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

    uint256 public lpNonce;
    uint256 public bridgerNonce;

    mapping(uint256 => LpLock) public idToLpLock;
    mapping(uint256 => BridgerLock) public idToBridgerLock;

    // event fired when a user requests a bridge
    event Request(address bridger, uint256 amount, uint256 chainWanted, address token, uint256 bridgerLockId, uint256 lpLockId, address lp);
    
    // event fired when a user unlock the bridged funds 
    event Unlock(uint256 lpLockId, bytes signature, uint256 chainId, uint256 bridgerLockId, uint256 authIndex);

    // event fired when a lp authorizes a bridger for some of his funds 
    event BridgerAuth(uint256 amount, address bridger, uint256 deadline, uint256 chainId, uint256 lpLockId, uint256 bridgerLockId);       

    constructor() {
    }

    function createLpLock(uint256 _amount, uint256[] memory _acceptedChains, address _token, uint256 _fees) external {
        uint256 lockId = ++lpNonce;

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
        uint256 lockId = ++bridgerNonce;

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

        emit Request(msg.sender, _amount, _chainWanted, _token, lockId, _lpLockId, _lp);

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

        emit BridgerAuth(_amount, _bridger, _deadline, _chainId, _lpLockId, _bridgerLockId);

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

        uint256 chainId;
        assembly {
            chainId := chainid()
        }

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

    // Getter functions

    function getUserLpLocks(address _user) public view returns (uint256[] memory) {
        uint256[] memory ids;
        uint256 j;

        for (uint i = 1; i <= lpNonce; i++) {
            if (idToLpLock[i].owner == _user) {
                ids[j] = i;
                j++;
            }
        }
        return ids;
    }

    function getUserBridgerLocks(address _user) public view returns (uint256[] memory) {
        uint256[] memory ids;
        uint256 j;

        for (uint i = 1; i <= lpNonce; i++) {
            if (idToBridgerLock[i].owner == _user) {
                ids[j] = i;
                j++;
            }
        }
        return ids;
    }

    function getLpLockFromId(uint256 _id) public view returns (    
        uint256 amount,
        address owner,
        uint256[] memory acceptedChains,
        address token,
        uint256 fees
    ) 
    {
        return (
            idToLpLock[_id].amount,
            idToLpLock[_id].owner,
            idToLpLock[_id].acceptedChains,
            idToLpLock[_id].token,
            idToLpLock[_id].fees
        );
    }

    function getBridgerLockFromId(uint256 _id) public view returns (
        uint256 amount,
        address owner,
        uint256 chainWanted,
        address token,
        uint256 lpLockId,
        address lp,
        uint256 deadline
    ) 
    {
        return (     
            idToBridgerLock[_id].amount,
            idToBridgerLock[_id].owner,
            idToBridgerLock[_id].chainWanted,
            idToBridgerLock[_id].token,
            idToBridgerLock[_id].lpLockId,
            idToBridgerLock[_id].lp,
            idToBridgerLock[_id].deadline
        );
    }

    function getAuthsFromLpLockId(uint256 _id) public view returns (Auth[] memory)
    {
        Auth[] memory auths = new Auth[](idToLpLock[_id].auths.length);
        for (uint i = 0; i < idToLpLock[_id].auths.length; i++) {
            auths[i] = idToLpLock[_id].auths[i];
        }   
        return auths;
    }
} 