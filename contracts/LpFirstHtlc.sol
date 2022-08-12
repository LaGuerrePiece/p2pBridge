// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

struct Auth {
    uint256 amount;
    address bridger;
    uint256 originChainId;
    uint256 bridgerLockId;
    bytes bridgerSignature;
    uint256 deadline;
}

struct LpLock {
    uint256 amount;
    address owner;
    uint256[] acceptedChains;
    address token;
    uint256 fees;
    uint256 lockId;
    uint256 amountLockedInAuths;
    Auth[] auths;
}

struct BridgerLock {
    uint256 amount;
    address owner;
    uint256 chainWanted;
    address token;
    uint256 lockId;
    uint256 lpLockId;
    address lp;
    uint256 deadline;
}

contract LpFirstHtlc {

    address public protocolOwner;

    uint256 public lpNonce;
    uint256 public bridgerNonce;
    uint256 public protocolFees;

    mapping(address => uint256) public protocolBalance;

    mapping(uint256 => LpLock) public idToLpLock;
    mapping(uint256 => BridgerLock) public idToBridgerLock;

    // event fired when a user requests a bridge
    event Request(address bridger, uint256 amount, uint256 chainWanted, address token, uint256 bridgerLockId, uint256 lpLockId, address lp, uint256 deadline);
    
    // event fired when a user unlock the bridged funds 
    event Unlock(uint256 lpLockId, uint256 authIndex, uint256 originChainId, uint256 bridgerLockId, bytes signature);

    // event fired when a lp authorizes a bridger for some of his funds 
    event BridgerAuth(uint256 amount, address bridger, uint256 deadline, uint256 originChainId, uint256 lpLockId, uint256 bridgerLockId);       

    constructor(address _owner) {
        protocolOwner = _owner;
    }

    /**
     * @notice Used by the LP to lock his funds
     *
     * @param _amount - The amount to lock into the contract
     * @param _acceptedChains - The chainids where he accepts his funds to be bridge
     * @param _token - The ERC20 token address to lock
     * @param _fees - The fees he agrees to take (on a /10000 basis)
     */
    function createLpLock(uint256 _amount, uint256[] memory _acceptedChains, address _token, uint256 _fees) external {
        uint256 lockId = ++lpNonce;

        LpLock storage lpLock = idToLpLock[lockId];
        lpLock.amount = _amount;
        lpLock.owner = msg.sender;
        lpLock.acceptedChains = _acceptedChains;
        lpLock.token = _token;
        lpLock.fees = _fees;
        lpLock.lockId = lockId;
        // lpLock.amountLockedInAuths = 0;

        ERC20(_token).transferFrom(msg.sender, address(this), _amount);
    }

    /**
     * @notice Used to create a bridger lock on origin chain
     *
     * @param _amount - The amount to bridge
     * @param _chainWanted - The destination chain wanted by the bridger
     * @param _token - The token contract on the origin chain
     * @param _lpLockId - The id of the lock of the lp on the destination chain
     * @param _lp - The lp adress
     * @param _deadline - The deadline of the lock
     */
    function createBridgerLock(uint256 _amount, uint256 _chainWanted, address _token, uint256 _lpLockId, address _lp, uint256 _deadline) external {
        uint256 lockId = ++bridgerNonce;

        idToBridgerLock[lockId] = BridgerLock({
            amount: _amount,
            owner: msg.sender,
            chainWanted: _chainWanted,
            token: _token,
            lockId : lockId,
            lpLockId: _lpLockId,
            lp: _lp,
            deadline: _deadline
        });

        ERC20(_token).transferFrom(msg.sender, address(this), _amount);

        emit Request(msg.sender, _amount, _chainWanted, _token, lockId, _lpLockId, _lp, _deadline);
    }

    /**
     * @notice Used to authorize a bridger to withdraw an amount with his signature
     *
     * @param _amount - The amount to authorize
     * @param _bridger - The bridger's address
     * @param _originChainId - The origin chainid of the bridger 
     * @param _lpLockId - The id of the lock on which to create the lock
     * @param _bridgerLockId - The id to the bridger's lock on the origin chain
     * @param _deadline - The deadline of the auth
     */
    function authBridger(uint256 _amount, address _bridger, uint256 _originChainId, uint256 _lpLockId, uint256 _bridgerLockId, uint256 _deadline) external {
        LpLock storage lpLock = idToLpLock[_lpLockId];
        
        require(lpLock.owner == msg.sender, "not the lp");
        require(lpLock.amount - lpLock.amountLockedInAuths >= _amount, "not enough funds in lock");

        bytes memory empty;
        lpLock.auths.push(Auth({
            amount: _amount,
            bridger: _bridger,
            originChainId: _originChainId,
            bridgerLockId: _bridgerLockId,
            bridgerSignature: empty,
            deadline: _deadline
        }));

        lpLock.amountLockedInAuths += _amount;

        emit BridgerAuth(_amount, _bridger, _deadline, _originChainId, _lpLockId, _bridgerLockId);
    }


    /**
     * @notice Used by the bridger to unlock his funds on destination chain
     *
     * @param _lpLockId - The id of the lp lock
     * @param _authIndex - The index of the Auth in the Auth array of the lp lock
     * @param _originChainId - The origin chainid of the bridger 
     * @param _bridgerLockId - The id of the bridger's lock on the origin chain
     * @param _signature - The bridger's signature of (_originChainId, _bridgerLockId)
     */
    function bridgerUnlock(uint256 _lpLockId, uint256 _authIndex, uint256 _originChainId, uint256 _bridgerLockId, bytes memory _signature) external {
        LpLock storage lpLock = idToLpLock[_lpLockId];
        Auth storage auth = lpLock.auths[_authIndex];

        require(auth.bridger == msg.sender, "not the bridger");
        require(auth.deadline > block.timestamp, "auth expired");
        require(auth.originChainId == _originChainId, "wrong originChainId");
        require(auth.bridgerLockId == _bridgerLockId, "wrong bridgerLockId");
        
        _verify(
            msg.sender,
            _signature,
            abi.encodePacked(_originChainId, _bridgerLockId)
        );

        uint256 lpFee = (auth.amount * lpLock.fees) / 1e6;
        uint256 prtlFee = (auth.amount * protocolFees) / 1e6;

        uint256 amountToTransfer = auth.amount - lpFee - prtlFee;

        ERC20(lpLock.token).transfer(msg.sender, amountToTransfer);

        lpLock.amount = lpLock.amount - auth.amount - prtlFee;
        lpLock.amountLockedInAuths -= auth.amount;

        protocolBalance[lpLock.token] += prtlFee;

        auth.amount = 0;
        auth.bridgerSignature = _signature;

        emit Unlock(_lpLockId, _authIndex, _originChainId, _bridgerLockId, _signature);
    }

    /**
     * @notice Used by the lp to unlock the bridger's funds on his origin chain
     *
     * @param _bridgerLockId - The id of the bridger's lock
     * @param _bridgerSignature - The bridger's signature of (_originChainId, _bridgerLockId)
     */
    function lpUnlock(uint256 _bridgerLockId, bytes memory _bridgerSignature) external {
        BridgerLock storage bridgerLock = idToBridgerLock[_bridgerLockId];

        require(bridgerLock.lp == msg.sender, "not the lp");
        require(bridgerLock.deadline > block.timestamp, "bridgerLock expired");

        uint256 chainId;

        assembly {
            chainId := chainid()
        }

        _verify(
            bridgerLock.owner,
            _bridgerSignature,
            abi.encodePacked(chainId, _bridgerLockId)
        );

        ERC20(bridgerLock.token).transfer(msg.sender, bridgerLock.amount);

        delete idToBridgerLock[_bridgerLockId];
    }

    /**
     * @notice Used by the bridger to cancel his lock on his origin chain
     * @notice Can only be called after deadline is passed
     * 
     * @param _lockId - The id of the lock
     */
    function cancelBridgerLock(uint256 _lockId) external {
        BridgerLock storage bridgerLock = idToBridgerLock[_lockId];

        require(bridgerLock.owner == msg.sender, "not the bridger");
        require(bridgerLock.deadline < block.timestamp, "lock not expired");

        ERC20(bridgerLock.token).transfer(msg.sender, bridgerLock.amount);

        delete idToBridgerLock[_lockId];
    }

    /**
     * @notice Used to cancel an lp lock. Funds can be withdrawn immediately if there is no active auth
     * 
     * @param _lockId - The id of the lock
     */
    function cancelLpLock(uint256 _lockId) external {
        LpLock storage lpLock = idToLpLock[_lockId];

        require(lpLock.owner == msg.sender, "not the lp");
        require(lpLock.amountLockedInAuths == 0, "amount locked in auth not null");

        ERC20(lpLock.token).transfer(msg.sender, lpLock.amount);

        delete idToLpLock[_lockId];
    }

    /**
     * @notice Used by lp to add liquidity to one of his locks.
     * 
     * @param _lockId - The id of the lock
     * @param _amount - The amount to add
     */
    function addLiquidity(uint256 _lockId, uint256 _amount) external {
        LpLock storage lpLock = idToLpLock[_lockId];
        require(lpLock.owner == msg.sender, "not the lp");

        lpLock.amount += _amount;

        ERC20(lpLock.token).transferFrom(msg.sender, address(this), _amount);
    }

    /**
     * @notice Used by lp to remove liquidity from one of his locks.
     * @notice The amount engaged in auths cannot be removed
     * 
     * @param _lockId - The id of the lock
     * @param _amount - The amount to remove
     */
    function removeLiquidity(uint256 _lockId, uint256 _amount) external {
        LpLock storage lpLock = idToLpLock[_lockId];

        require(lpLock.owner == msg.sender, "not the lp");
        require(lpLock.amount - lpLock.amountLockedInAuths >= _amount, "cannot remove that much");

        ERC20(lpLock.token).transfer(msg.sender, _amount);
    }

    /**
     * @notice Used by owner/governance to withdraw protocol fees
     * 
     * @param _token - The token to withdraw
     */
    function withdrawProtocolFees(address _token) external {
        require(protocolOwner == msg.sender, "not the owner");

        ERC20(_token).transfer(protocolOwner, protocolBalance[_token]);
    }

    /**
     * @notice Used by owner/governance to change protocol fees
     * 
     * @param _newFee - The new fee (on a /10000 basis)
     */
    function changeProtocolFees(uint256 _newFee) external {
        require(protocolOwner == msg.sender, "not the owner");
        require(_newFee <= 1e4, "fee higher than 1%");

        protocolFees = _newFee;
    }

    /**
     * @notice Checks signature
     * 
     * @param _address - The address of the signer
     * @param _signature - The signature
     * @param data - The signed data
     */
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
     * @notice - Used to get the lpLocks of a given user
     * @param _user - The address to look for lpLocks
     * @return uint256[] - The list of the lpLock's ids
     */
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

    /**
     * @notice - Used to get the bridgerLocks of a given user
     * @param _user - The address to look for bridgerLocks
     * @return uint256[] - The list of the bridgerLocks's ids
     */
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

    /**
     * @notice - Used to get the lpLock from a given id
     * @param _id - The id of the lpLock
     * @return amount - The amount locked
     * @return owner - The address of the owner
     * @return acceptedChains - An array of the chainids the lp accepts bridging to
     * @return token - The token address
     * @return fees - The fees he wants (on a /10000 basis)
     */
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

    /**
     * @notice - Used to get the bridgerLock from a given id
     * @param _id - The id of the bridgerLock
     * @return amount - The amount locked
     * @return owner - The address of the owner
     * @return chainWanted - The chainid of the chain the bridger wants to bridge to
     * @return token - The token address on the origin chain
     * @return lpLockId - The id of the lpLock the bridger is targetting
     * @return lp - The address of the lp
     * @return deadline - The deadline of the lock
     */
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

    /**
     * @notice - Used to get the Auths of a lpLock from a given id
     * @param _id - The id of the lpLock
     * @return auths - The array of all Auth on the given lock
     */
    function getAuthsFromLpLockId(uint256 _id) public view returns (Auth[] memory)
    {
        Auth[] memory auths = new Auth[](idToLpLock[_id].auths.length);
        for (uint i = 0; i < idToLpLock[_id].auths.length; i++) {
            auths[i] = idToLpLock[_id].auths[i];
        }   
        return auths;
    }
}