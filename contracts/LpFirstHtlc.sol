// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

struct Auth {
    uint256 amount;
    address bridger;
    uint256 deadline;
    uint256 chainId;
    uint256 bridgerLockId;
    bytes bridgerSignature;
}

struct LpLock {
    uint256 amount;
    address owner;
    uint256[] acceptedChains;
    address token;
    uint256 fees;
    uint256 id;
    Auth[] auths;
}

struct BridgerLock {
    uint256 amount;
    address owner;
    uint256 chainWanted;
    address token;
    uint256 id;
    uint256 lpLockId;
    address lp;
    uint256 deadline;
}

contract LpFirstHtlc {

    uint256 public chainId;
    uint256 public nonce;

    mapping(uint256 => LpLock) public idToLpLock;
    mapping(uint256 => BridgerLock) public idToBridgerLock;

    // event fired when an user requests a bridge
    event Request(uint256 amount, address bridger, uint256 deadline, uint256 chainId, uint256 indexed lpLockId, uint256 bridgerLockId);
    // event fired when an user unlock the bridged funds 
    event Unlock(uint256 lpLockId, bytes signature, uint256 chainId, uint256 bridgerLockId, uint256 authIndex);

    constructor(uint256 _chainId) {
        chainId = _chainId;
    }

    function createLpLock(uint256 _amount, uint256[] memory _acceptedChains, address _token, uint256 _fees) external {
        uint256 lockId = ++nonce;

        LpLock storage lpLock = idToLpLock[lockId];
        lpLock.amount = _amount;
        lpLock.owner = msg.sender;
        lpLock.acceptedChains = _acceptedChains;
        lpLock.token = _token;
        lpLock.fees = _fees;
        lpLock.id = lockId;

        ERC20(_token).transferFrom(msg.sender, address(this), _amount);
    }

    function createBridgerLock(uint256 _amount, uint256 _chainWanted, address _token, uint256 _lpLockId, address _lp) external {
        uint256 lockId = ++nonce;

        idToBridgerLock[lockId] = BridgerLock({
            amount: _amount,
            owner: msg.sender,
            chainWanted: _chainWanted,
            token: _token,
            id : lockId,
            lpLockId: _lpLockId,
            lp: _lp,
            deadline: block.timestamp
        });

        ERC20(_token).transferFrom(msg.sender, address(this), _amount);

    }

    function authBridger(uint256 _amount, address _bridger, uint256 _deadline, uint256 _chainId, uint256 _lpLockId, uint256 _bridgerLockId) external {
        require(_amount <= idToLpLock[_lpLockId].amount, "trying to authorize more than lock contains");

        bytes memory empty;
        idToLpLock[_lpLockId].auths.push(Auth({
            amount: _amount,
            bridger: _bridger,
            deadline: _deadline,
            chainId: _chainId,
            bridgerLockId: _bridgerLockId,
            bridgerSignature: empty
        }));

        emit Request(_amount, _bridger, _deadline, _chainId, _lpLockId, _bridgerLockId);
    }

    function bridgerUnlock(uint256 _lpLockId, bytes memory _signature, uint256 _chainId, uint256 _bridgerLockId, uint256 _authIndex) external {
        LpLock storage lpLock = idToLpLock[_lpLockId];
        Auth storage auth = lpLock.auths[_authIndex];

        require(auth.chainId == _chainId, "wrong chainId");
        require(auth.bridgerLockId == _bridgerLockId, "wrong bridgerLockId");
        require(auth.deadline < block.timestamp, "auth expired");
        require(auth.bridger == msg.sender, "not the bridger");
        
        _verify(
            msg.sender,
            _signature,
            abi.encodePacked(_chainId, _bridgerLockId)
        );

        uint256 fee = (auth.amount * lpLock.fees) / 1e6;

        ERC20(lpLock.token).transfer(msg.sender, auth.amount - fee);

        lpLock.amount -= auth.amount;
        auth.amount = 0;
        auth.bridgerSignature = _signature;

        emit Unlock(_lpLockId, _signature, _chainId, _bridgerLockId, _authIndex);

    }

    function lpUnlock(uint256 _bridgerLockId, bytes memory _signature) external {
        BridgerLock storage bridgerLock = idToBridgerLock[_bridgerLockId];
        require(bridgerLock.lp == msg.sender, "not the lp");
        require(bridgerLock.deadline < block.timestamp, "bridgerLock expired");

        _verify(
            bridgerLock.owner,
            _signature,
            abi.encodePacked(chainId, _bridgerLockId)
        );

        ERC20(bridgerLock.token).transfer(msg.sender, bridgerLock.amount);

        delete idToBridgerLock[_bridgerLockId];
    }

    // Cancel functions

    function bridgerCancelLock(uint256 _lockId) external {
        BridgerLock storage bridgerLock = idToBridgerLock[_lockId];
        require(bridgerLock.deadline < block.timestamp, "lock not expired");
        require(bridgerLock.owner == msg.sender, "not the bridger");

        ERC20(bridgerLock.token).transfer(msg.sender, bridgerLock.amount);

        delete idToBridgerLock[_lockId];
    }

    function lpCancelLock(uint256 _lockId) external {
        LpLock storage lpLock = idToLpLock[_lockId];
        require(lpLock.owner == msg.sender, "not the lp");

        Auth[] memory auth = lpLock.auths;

        for (uint256 i = 0; i < auth.length; i++) {
            require(auth[i].deadline < block.timestamp, "an auth is still valid");
        }

        ERC20(lpLock.token).transfer(msg.sender, lpLock.amount);

        delete idToLpLock[_lockId];
    }

    // Add or remove liquidity from lp lock

    function addLiquidity(uint256 _lockId, uint256 _amount) external {
        LpLock storage lpLock = idToLpLock[_lockId];
        require(lpLock.owner == msg.sender, "not the lp");

        lpLock.amount += _amount;

        ERC20(lpLock.token).transferFrom(msg.sender, address(this), _amount);
    }

    function removeLiquidity(uint256 _lockId, uint256 _amount) external {
        LpLock storage lpLock = idToLpLock[_lockId];
        require(lpLock.owner == msg.sender, "not the lp");

        Auth[] memory auth = lpLock.auths;

        uint256 amountEngagedInAuth = 0;

        for (uint256 i = 0; i < auth.length; i++) {
            if (auth[i].deadline < block.timestamp){
                amountEngagedInAuth += auth[i].amount;
            }
        }
        require(lpLock.amount - amountEngagedInAuth > _amount, "cant remove that much");

        ERC20(lpLock.token).transfer(msg.sender, _amount);
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