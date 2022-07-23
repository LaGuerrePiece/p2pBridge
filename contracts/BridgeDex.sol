// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

struct ChainAChallenge {
    uint256 otherChain;
    uint256 nonce;
    bytes challengerSignature;
    address challenger;
    address token;
}

struct ChainBChallenge {
    uint24 fees;
    bytes bridgerSignature;
}

struct Lock {
    uint256 amount;
    ChainAChallenge[] challenges;
    address token;
    address owner;
    uint64 date;
    bool locked;
    bool challenged;
}

struct Request {
    uint256 amount;
    uint256 chainAId;
    uint256 chainANonce;
    uint256 index;
    bytes initialSignature;
    address tokenAContract;
    address tokenBContract;
    address sender;
    uint64 date;
    uint24 fees;
    mapping(address => ChainBChallenge) challenges;
}

/// @title A simple Decentralized bridge
contract BridgeDex {
    uint256 public chainId;
    address public owner;

    mapping(uint256 => Lock) public idToLock;
    mapping(address => uint256[]) public tokenContractToRequestId;
    mapping(uint256 => Request) public idToRequest;

    mapping(address => uint256[]) public myDeposits;
    mapping(address => uint256[]) public myRequests;
    mapping(address => uint256[]) public myChallenges;
    mapping(address => uint256[]) public myLocks;

    mapping(address => uint256) public point;
    uint256 public nonce;

    event LockCreated(
        uint256 indexed id,
        address indexed bridger,
        uint256 amount,
        address tokenAContract,
        uint64 date
    );
    event RequestPublished(
        uint256 indexed id,
        address indexed bridger,
        uint256 amount,
        uint256 _chainAId,
        uint256 _chainANonce,
        bytes _signature,
        address _tokenAContract,
        address _tokenBContract,
        uint256 _date,
        uint24 _fees
    );

    constructor(uint256 _chainId, address _owner) {
        chainId = _chainId;
        owner = _owner;
    }

    /**
     * @notice Used to lock a certain amount of a certain token before
     * starting the bridge operation
     *
     * @param _amount - The amount to lock into the contract
     * @param _tokenAContract - The ERC20 token address to lock
     */
    function lock(uint256 _amount, address _tokenAContract) external {
        uint256 id = ++nonce;

        Lock storage l = idToLock[id];
        myLocks[msg.sender].push(id);

        ERC20 c = ERC20(_tokenAContract);

        l.locked = true;
        l.token = _tokenAContract;
        l.owner = msg.sender;
        l.date = uint64(block.timestamp);
        l.amount = _amount;
        c.transferFrom(msg.sender, address(this), _amount);

        emit LockCreated(
            id,
            msg.sender,
            _amount,
            _tokenAContract,
            uint64(block.timestamp)
        );
    }

    /**
     * @notice Used to withdraw the locked funds, funds can be withdraw immediatly if there is no challenger
     * else the locker will need to wait for 7 days to unlock its funds
     *
     * @param _lockId - The lock id on the chain A
     */
    function withdrawLocked(uint256 _lockId) external {
        Lock storage l = idToLock[_lockId];

        if (l.challenged) require(l.date + 7 days < block.timestamp);
        require(l.owner == msg.sender);

        delete idToLock[_lockId];

        for (uint256 i = 0; i < myLocks[msg.sender].length; ++i) {
            if (myLocks[msg.sender][i] == _lockId) {
                _splice(myLocks[msg.sender], i);
                break;
            }
        }

        ERC20(l.token).transfer(msg.sender, l.amount);
    }

    /**
     * @notice Used to publish a bridge request on chainB
     *
     * @param _amount - The total amount of token to bridge
     * @param _date - The date corresponding to the chain A lock
     * @param _chainAId - The id of the chain where the bridger will provide tokens
     * @param _chainANonce - The nonce of the lock on the chain A
     * @param _signature - The signature of the bridger for the given request
     * @param _tokenAContract - The address of the token willing to be exchanged on chain A
     * @param _tokenBContract - The address of the token willing to be exchanged on chain B
     * @param _nonce - The nonce of the contract
     * @param _fees - The amount of fee willing to be given by the sender (on a /10000 basis)
     */
    function publishRequest(
        uint256 _amount,
        uint256 _date,
        uint256 _chainAId,
        uint256 _chainANonce,
        bytes memory _signature,
        address _tokenAContract,
        address _tokenBContract,
        uint256 _nonce,
        uint24 _fees
    ) external {
        require(_nonce == ++nonce);

        _verify(
            msg.sender,
            _signature,
            abi.encodePacked(_nonce, chainId, _chainANonce, _chainAId)
        );

        tokenContractToRequestId[_tokenBContract].push(_nonce);
        Request storage request = idToRequest[_nonce];
        request.amount = _amount;
        request.chainAId = _chainAId;
        request.chainANonce = _chainANonce;
        request.initialSignature = _signature;
        request.tokenAContract = _tokenAContract;
        request.tokenBContract = _tokenBContract;
        request.sender = msg.sender;
        request.date = uint64(_date);
        request.fees = _fees;
        request.index = tokenContractToRequestId[_tokenBContract].length - 1;

        myRequests[msg.sender].push(_nonce);
    }

    /**
     * @notice - Used to drop a certain request from the sender list
     * @param _index - The index of the request in the owner list to drop
     */
    function dropRequest(uint256 _index) external {
        _splice(myRequests[msg.sender], _index);
    }

    /**
     * @notice Used to become one of the challengers on the chain B and
     * to deposit the tokens for becoming a challenger
     *
     * @param _id - the id for the mapping of the request to become challenger of
     * @param _fees - The amount of fees the challenger want to keep
     */
    function becomeChainBChallenger(uint256 _id, uint256 _fees) external {
        Request storage request = idToRequest[_id];
        require(
            request.challenges[msg.sender].fees == 0,
            "You already locked funds for this request"
        );
        require(request.amount != 0, "The request has already been fulfilled");
        bytes memory none;
        request.challenges[msg.sender] = ChainBChallenge({
            fees: uint24(_fees),
            bridgerSignature: none
        });
        uint256 amount = request.amount - (_fees * request.amount) / 2e6;
        myDeposits[msg.sender].push(_id);

        ERC20(request.tokenBContract).transferFrom(
            msg.sender,
            address(this),
            amount
        );
    }

    /**
     * @notice Used to become the challenger of a given lock on the chainA
     *
     * @param _chainBId - The id of the chainB
     * @param _nonce - The nonce of the transaction
     * @param _initialSignature - The signature provided by the the bridger on chain B (to be verified here)
     * @param _lockId - The address which initiated the exchange of token on chain A
     *
     */
    function becomeChainAChallenger(
        uint256 _chainBId,
        uint256 _nonce,
        bytes memory _initialSignature,
        bytes memory _challengerSignature,
        uint256 _lockId
    ) external {
        Lock storage l = idToLock[_lockId];
        require(l.locked, "The bridge seeker is not searching to bridge");
        require(l.date + 5 days > block.timestamp, "The lock is out of date");

        _verify(
            l.owner,
            _initialSignature,
            abi.encodePacked(_nonce, _chainBId, _lockId, chainId)
        );

        _verify(
            msg.sender,
            _challengerSignature,
            abi.encodePacked(_initialSignature)
        );

        l.challenges.push(
            ChainAChallenge({
                token: l.token,
                otherChain: _chainBId,
                nonce: _nonce,
                challenger: msg.sender,
                challengerSignature: _challengerSignature
            })
        );
        myChallenges[msg.sender].push(_lockId);
        l.challenged = true;
    }

    /**
     * @notice - Used to withdraw the funds locked for a particular token request
     * @param _id - The id of the challenge to withdraw the funds from
     */
    function withdrawChainBChallenge(uint256 _id) external {
        ChainBChallenge storage challenge = idToRequest[_id].challenges[
            msg.sender
        ];
        Request storage request = idToRequest[_id];

        require(request.date + 5 days < block.timestamp || request.amount == 0);

        uint256 amount = request.amount -
            (challenge.fees * request.amount) /
            2e6;
        delete idToRequest[_id].challenges[msg.sender];
        ERC20(request.tokenBContract).transfer(msg.sender, amount);
    }

    /**
     * @notice Used on chain B to withdraw the funds of the provider by the bridge seeker
     *
     * @param _challengerSignature - The signature sent on the chain A by the challenger to become the challenger
     * @param _bridgerSignature - The signature of the bridger for the coming request (needed by the provided to withdraw the funds on chain A)
     * @param _challenger - The address of the challenger which accpted the bridger request
     * @param _id - The id of the element we are going to withdraw from
     */
    function withdrawRequest(
        bytes memory _challengerSignature,
        bytes memory _bridgerSignature,
        address _challenger,
        uint256 _id
    ) external {
        Request storage request = idToRequest[_id];

        uint256 fees = (request.amount * request.challenges[_challenger].fees) /
            1e6;
        uint256 amount = request.amount - fees;

        require(request.date + 5 days > block.timestamp);

        _verify(
            _challenger,
            _challengerSignature,
            abi.encodePacked(request.initialSignature)
        );

        _verify(
            request.sender,
            _bridgerSignature,
            abi.encodePacked(_challengerSignature)
        );

        request.challenges[_challenger].bridgerSignature = _bridgerSignature;
        request.amount = 0;

        _splice(
            tokenContractToRequestId[request.tokenBContract],
            request.index
        );

        ERC20(request.tokenBContract).transfer(msg.sender, amount);
        ERC20(request.tokenBContract).transfer(owner, fees / 2);
    }

    /**
     * @notice Used by the provider to withdraw his funds on chain A
     *
     * @param _bridgerSignature - The last signature of the bridger allonwing the provider to withdraw its funds on chain A
     * @param _challengeId - The id of the challenge in the challenge list
     * @param _lockId - The id of the lock to withdraw from
     */
    function finalWithdraw(
        bytes memory _bridgerSignature,
        uint256 _challengeId,
        uint256 _lockId
    ) external {
        Lock storage l = idToLock[_lockId];
        ChainAChallenge storage challenge = l.challenges[_challengeId];

        _verify(
            l.owner,
            _bridgerSignature,
            abi.encodePacked(challenge.challengerSignature)
        );

        delete idToLock[_lockId];

        ERC20(l.token).transfer(challenge.challenger, l.amount);
    }

    /**
     * @notice - Used to get acces to all the address' locks at once
     * @param _owner - The address to retrieve the locks from
     * @return uint256[] - An array containing the address active lock ids
     */
    function getMyLocks(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        return myLocks[_owner];
    }

    /**
     * @notice - Used to get acces to all the address' challenges at once
     * @param _owner - The address to retrieve the challenges from
     * @return uint256[] - An array containing the address active challenges ids
     */
    function getMyChallenges(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        return myChallenges[_owner];
    }

    /**
     * @notice - Used to get the challenges of a given lock, not possible other way
     * @param _lockId - The id of the lock to get the challenges
     * @return - The array of the challenges for the given lock
     */
    function getLockChallenges(uint256 _lockId)
        external
        view
        returns (ChainAChallenge[] memory)
    {
        return idToLock[_lockId].challenges;
    }

    /**
     *
     * @notice - Used to get the list of the request id for a given token
     * @param _token - The address of the token contract to look for requests
     * @return uint256[] - Array of the requests ids
     */
    function getTokenContractRequests(address _token)
        external
        view
        returns (uint256[] memory)
    {
        return tokenContractToRequestId[_token];
    }

    /**
     * @notice Used to get the request ids for a given address
     * @param _owner - The address to look for request ids
     * @return uint256[] - The list of the request ids for a given address
     */
    function getMyRequests(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        return myRequests[_owner];
    }

    /**
     * @notice - Used to get the requests ids where the _owner made deposits
     * @param _owner - The address from which to get the requests Ids of the deposits made
     * @return - The list of the request ids where deposits where made
     */
    function getMyDepositsIds(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        return myDeposits[_owner];
    }

    /**
     * @notice - Used to the the formal details of a deposit on a specific token request
     *
     * @param _id - The id of the token request considered
     * @param _owner - The address of the challenger to get the informations
     *
     * @return - The Challenge details
     */
    function getDepositDetails(uint256 _id, address _owner)
        external
        view
        returns (ChainBChallenge memory)
    {
        return idToRequest[_id].challenges[_owner];
    }

    /**
     * @notice - Used to get the list of the request ids for a given token
     * @param _token - The token address on chain B to look for token requests
     */
    function getRequestsIdsForToken(address _token)
        external
        view
        returns (uint256[] memory)
    {
        return tokenContractToRequestId[_token];
    }

    function _verify(
        address _address,
        bytes memory _signature,
        bytes memory data
    ) private pure {
        require(
            _address ==
                ECDSA.recover(ECDSA.toEthSignedMessageHash(data), _signature),
            "Invalid signature"
        );
    }

    /**
     * @notice - Used to pop an element from a list (modifies the order of the elements)
     *
     * @param _array - The array from which the element will be deleted
     * @param _index - The index of the element to pop
     */
    function _splice(uint256[] storage _array, uint256 _index) private {
        if (_index == _array.length - 1) {
            _array.pop();
        } else {
            _array[_index] = _array[_array.length - 1];
            _array.pop();
        }
    }
}
