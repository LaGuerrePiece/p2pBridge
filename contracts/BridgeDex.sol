// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

struct ChainAChallenge {
    uint256 bidAmount;
    uint256 otherChain;
    uint256 nonce;
    bytes challengerSignature;
    address challenger;
    address token;
    bool accepted;
}

struct ChainBChallenge {
    uint256 bidAmount;
    uint24 fees;
    bytes bridgerSignature;
}

struct Lock {
    uint256 amount;
    uint256 bridged;
    uint256 accepted;
    ChainAChallenge[] challenges;
    address token;
    address owner;
    uint64 date;
    bool locked;
    bool challenged;
}

struct Request {
    uint256 amount;
    uint256 minBidAmount;
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
        uint256 _minBidAmount,
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

        uint256 amount = l.amount - l.bridged;
        address token = l.token;
        delete idToLock[_lockId];

        for (uint256 i = 0; i < myLocks[msg.sender].length; ++i) {
            if (myLocks[msg.sender][i] == _lockId) {
                _splice(myLocks[msg.sender], i);
                break;
            }
        }

        ERC20(token).transfer(msg.sender, amount);
    }

    /**
     * @notice Used to publish a bridge request on chainB
     *
     * @param _amount - The total amount of token to bridge
     * @param _minBidAmount - The minimal amount the bridge seeker is willing to accept for an operation
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
        uint256 _minBidAmount,
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
        request.minBidAmount = _minBidAmount;
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
     * @notice Used to become the challenger of a given lock on the chainA
     * The user first submits its challenge and needs to be accepted
     *
     * @param _bidAmount - The amount the provider is willing to provide to the bridger from chain B
     * @param _chainBId - The id of the chainB
     * @param _nonce - The nonce of the transaction
     * @param _initialSignature - The signature provided by the the bridger on chain B (to be verified here)
     * @param _lockId - The address which initiated the exchange of token on chain A
     *
     */
    function becomeChainAChallenger(
        uint256 _bidAmount,
        uint256 _chainBId,
        uint256 _nonce,
        bytes memory _initialSignature,
        uint256 _lockId
    ) external {
        Lock storage l = idToLock[_lockId];
        require(l.locked, "The bridge seeker is not searching to bridge");
        require(l.date + 5 days > block.timestamp, "The lock is out of date");
        require(
            l.amount >= _bidAmount,
            "The bidAmount is greated than the requested amount"
        );

        _verify(
            l.owner,
            _initialSignature,
            abi.encodePacked(_nonce, _chainBId, _lockId, chainId)
        );

        bytes memory none;
        l.challenges.push(
            ChainAChallenge({
                token: l.token,
                bidAmount: _bidAmount,
                otherChain: _chainBId,
                nonce: _nonce,
                challenger: msg.sender,
                challengerSignature: none,
                accepted: false
            })
        );
        myChallenges[msg.sender].push(_lockId);
        l.challenged = true;
    }

    /**
     * @notice - Used by the bridger to choose the challengers he wants to went with
     *
     * @param _lockId - The lock for the given transaction
     * @param _challengerId - The id of the challenger into the challengers to accept the challenge
     *
     */
    function acceptChainAChallenger(uint256 _lockId, uint256 _challengerId)
        external
    {
        Lock storage l = idToLock[_lockId];

        require(l.locked, "The bridge seeker is not searching to bridge");
        require(l.date + 5 days > block.timestamp, "The lock is out of date");
        require(l.owner == msg.sender, "You are not the owner of the lock");
        require(
            l.amount >= l.accepted + l.challenges[_challengerId].bidAmount,
            "Cannot accept more than the initial amount"
        );

        l.challenges[_challengerId].accepted = true;
        l.accepted += l.challenges[_challengerId].bidAmount;
    }

    /**
     * @notice - Used to submit the signature after being accepted for a challenge
     *
     * @param _challengerId - The id of our submit on the lock challenges array
     * @param _challengerSignature - The signature for the bridger to take our funds on the chain B
     * @param _lockId - The id of the current lock
     * @param _initialSignature - The signature of the bridger for the given transaction on chain B
     */
    function submitChainAChallengerSignature(
        uint256 _challengerId,
        bytes memory _challengerSignature,
        uint256 _lockId,
        bytes memory _initialSignature
    ) external {
        Lock storage l = idToLock[_lockId];
        require(l.date + 5 days > block.timestamp, "The lock is out of date");
        require(
            l.challenges[_challengerId].challenger == msg.sender,
            "You are not the challenger you pretend to be"
        );
        require(
            l.challenges[_challengerId].accepted,
            "Not accepted by the briger"
        );
        require(
            l.challenges[_challengerId].challengerSignature.length == 0,
            "The request has already been signed"
        );

        _verify(
            msg.sender,
            _challengerSignature,
            abi.encodePacked(_initialSignature)
        );

        l.challenges[_challengerId].challengerSignature = _challengerSignature;
    }

    /**
     * @notice Used to become one of the challengers on the chain B and
     * to deposit the tokens for becoming a challenger
     *
     * @param _id - the id for the mapping of the request to become challenger of
     * @param _bidAmount - The amount to be deposited to the bridge
     * @param _fees - The amount of fees the challenger want to keep
     */
    function becomeChainBChallenger(
        uint256 _id,
        uint256 _bidAmount,
        uint256 _fees
    ) external {
        Request storage request = idToRequest[_id];
        require(
            request.challenges[msg.sender].bidAmount == 0,
            "You already locked funds for this request"
        );
        require(request.amount != 0, "The request has already been fulfilled");
        bytes memory none;
        request.challenges[msg.sender] = ChainBChallenge({
            fees: uint24(_fees),
            bidAmount: _bidAmount,
            bridgerSignature: none
        });
        uint256 amount = _bidAmount - (_fees * _bidAmount) / 2e6;
        myDeposits[msg.sender].push(_id);

        ERC20(request.tokenBContract).transferFrom(
            msg.sender,
            address(this),
            amount
        );
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

        require(challenge.bidAmount != 0);
        require(request.date + 5 days < block.timestamp || request.amount == 0);

        uint256 amount = challenge.bidAmount -
            (challenge.fees * challenge.bidAmount) /
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

        uint256 amount = request.challenges[_challenger].bidAmount;
        request.amount -= amount;

        uint256 fees = (amount * request.challenges[_challenger].fees) / 1e6;
        amount = amount - fees;

        require(request.date + 5 days > block.timestamp);
        require(request.challenges[_challenger].bidAmount != 0);

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
        request.challenges[_challenger].bidAmount = 0;

        if (request.amount == 0) {
            _splice(
                tokenContractToRequestId[request.tokenBContract],
                request.index
            );
        }

        ERC20(request.tokenBContract).transfer(msg.sender, amount);
        ERC20(request.tokenBContract).transfer(owner, fees / 2);
    }

    /**
     * @notice Used by the provided to withdraw its funds on the chain A
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

        l.bridged += challenge.bidAmount;
        if (l.amount == l.bridged) {
            delete idToLock[_lockId];
        }

        ERC20(l.token).transfer(challenge.challenger, challenge.bidAmount);
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
