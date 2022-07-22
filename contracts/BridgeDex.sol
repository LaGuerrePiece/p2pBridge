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

    function getMyLocks(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        return myLocks[_owner];
    }

    function getMyChallenges(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        return myChallenges[_owner];
    }

    function getLockChallenges(uint256 _lockId)
        external
        view
        returns (ChainAChallenge[] memory)
    {
        return idToLock[_lockId].challenges;
    }

    function getTokenContractRequests(address _token)
        external
        view
        returns (uint256[] memory)
    {
        return tokenContractToRequestId[_token];
    }

    function getMyRequests(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        return myRequests[_owner];
    }

    function getMyDepositsIds(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        return myDeposits[_owner];
    }

    function getDepositDetails(uint256 _id, address _owner)
        external
        view
        returns (ChainBChallenge memory)
    {
        return idToRequest[_id].challenges[_owner];
    }

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

    function _splice(uint256[] storage _array, uint256 _index) private {
        if (_index == _array.length - 1) {
            _array.pop();
        } else {
            _array[_index] = _array[_array.length - 1];
            _array.pop();
        }
    }
}
