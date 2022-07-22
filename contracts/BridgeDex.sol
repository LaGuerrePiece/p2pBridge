// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

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

    mapping(address => uint256) public point;
    uint256 public nonce;

    constructor(uint256 _chainId, address _owner) {
        chainId = _chainId;
        owner = _owner;
    }

    function lock(uint256 _amount, address _tokenAContract) external {
        uint256 id = ++nonce;

        Lock storage l = idToLock[id];

        ERC20 c = ERC20(_tokenAContract);

        l.locked = true;
        l.token = _tokenAContract;
        l.owner = msg.sender;
        l.date = uint64(block.timestamp);
        l.amount = _amount;
        c.transferFrom(msg.sender, address(this), _amount);
    }

    function withdrawLocked(uint256 _lockId) external {
        Lock storage l = idToLock[_lockId];

        if (l.challenged) require(l.date + 7 days < block.timestamp);
        require(l.owner == msg.sender);

        uint256 amount = l.amount - l.bridged;
        address token = l.token;
        delete idToLock[_lockId];

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
}
