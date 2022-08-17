// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct ProviderTicket {
    uint256 amount;
    uint256 chainBId;
    uint256 requestId;
    uint256 deadline;
    bytes signature;
    address bridger;
}

struct Lock {
    uint256 amount;
    uint256 accepted;
    uint256 nonce;
    uint256[] acceptedChains;
    ProviderTicket[] tickets;
    address token;
    address owner;
    uint16 fees;
}

struct Request {
    uint256 amount;
    uint256 chainAId;
    uint256 lockId;
    uint256 requestId;
    address tokenBContract;
    address sender;
    address provider;
    uint64 deadline;
}

/// @title A simple Decentralized bridge
contract BridgeDex is Ownable {
    uint256 public lockNonce;
    uint256 public bridgeNonce;
    uint256 public protocolFees = 10;

    mapping(uint256 => Lock) public idToLock;
    mapping(address => uint256[]) public tokenContractToRequestIds;
    mapping(address => uint256[]) public tokenContractToLockIds;
    mapping(uint256 => Request) public idToRequest;

    mapping(address => uint256[]) public myRequests;
    mapping(address => uint256[]) public myLocks;

    event LockCreated(
        uint256 indexed id,
        address indexed bridger,
        uint256 amount,
        address tokenAContract,
        uint64 date
    );
    event RequestPublished(
        address indexed _bridger,
        uint256 _amount,
        uint256 _chainAId,
        uint256 _lockId,
        uint256 _requestId,
        address _tokenBContract,
        uint256 _deadline
    );

    event NewTicket(
        uint256 _amount,
        uint256 _deadline,
        uint256 _chainBId,
        uint256 _lockId,
        uint256 _requestId,
        address _bridger
    );

    event NewWithdraw(
        uint256 _lockId,
        uint256 _challengeIndex,
        uint256 _chainBId,
        uint256 _requestId,
        bytes _signature
    );

    constructor() Ownable() {}

    /**
     * @notice Used to lock a certain amount of a certain token to allow bridge operations
     *
     * @param _amount - The amount to lock into the contract
     * @param _acceptedChains - The chainids where the provider accepts his funds to be bridged
     * @param _tokenAContract - The ERC20 token address to lock
     * @param _fees - Fees the provider is going to take (on a /10000 basis)
     */
    function lock(
        uint256 _amount,
        address _tokenAContract,
        uint256[] calldata _acceptedChains,
        uint256 _fees
    ) external {
        uint256 lockId = ++lockNonce;

        Lock storage l = idToLock[lockId];
        myLocks[msg.sender].push(lockId);
        tokenContractToLockIds[_tokenAContract].push(lockId);

        ERC20 c = ERC20(_tokenAContract);

        l.token = _tokenAContract;
        l.owner = msg.sender;
        l.amount = _amount;
        l.nonce = lockId;
        l.acceptedChains = _acceptedChains;
        l.fees = uint16(_fees);
        c.transferFrom(msg.sender, address(this), _amount);

        emit LockCreated(
            lockId,
            msg.sender,
            _amount,
            _tokenAContract,
            uint64(block.timestamp)
        );
    }

    /**
     * @notice Used to publish a bridge request on chainB
     *
     * @param _amount - The total amount of token to bridge
     * @param _chainAId - The id of the chain where the bridger will provide tokens
     * @param _lockId - The nonce of the lock on the chain A
     * @param _deadline - The deadline corresponding to the chain A lock
     * @param _tokenBContract - The address of the token willing to be exchanged on chain B
     * @param _provider - The chosen provider on chainA
     */
    function publishRequest(
        uint256 _amount,
        uint256 _chainAId,
        uint256 _lockId,
        uint256 _deadline,
        address _tokenBContract,
        address _provider
    ) external {
        uint256 _requestId = ++bridgeNonce;

        tokenContractToRequestIds[_tokenBContract].push(_requestId);
        myRequests[msg.sender].push(_requestId);

        Request storage request = idToRequest[_requestId];
        request.amount = _amount;
        request.chainAId = _chainAId;
        request.lockId = _lockId;
        request.requestId = _requestId;
        request.tokenBContract = _tokenBContract;
        request.sender = msg.sender;
        request.provider = _provider;
        request.deadline = uint64(_deadline);

        ERC20(_tokenBContract).transferFrom(msg.sender, address(this), _amount);

        emit RequestPublished(
            msg.sender,
            _amount,
            _chainAId,
            _lockId,
            _requestId,
            _tokenBContract,
            _deadline
        );
    }

    /**
     * @notice - Used by the provider to give a ticket to the trusted bridger
     * @param _lockId - The lock for the given transaction
     * @param _bridger - The bridger of the chainB
     *
     */
    function acceptBridger(
        uint256 _amount,
        uint256 _lockId,
        uint256 _chainBId,
        uint256 _deadline,
        uint256 _requestId,
        address _bridger
    ) external {
        Lock storage l = idToLock[_lockId];

        require(l.owner == msg.sender, "You are not the owner of the lock");
        require(l.amount - l.accepted >= _amount, "Not enough on the lock");

        bytes memory challengerSignature;
        l.tickets.push(
            ProviderTicket({
                amount: _amount,
                chainBId: _chainBId,
                requestId: _requestId,
                deadline: _deadline,
                bridger: _bridger,
                signature: challengerSignature
            })
        );

        l.accepted += _amount;

        emit NewTicket(
            _amount,
            _deadline,
            _chainBId,
            _lockId,
            _requestId,
            _bridger
        );
    }

    /**
     * @notice Used by the bridger to withdraw its funds on the chain A
     *
     * @param _bridgerSignature - The signature of the bridger allowing the provider to withdraw its funds on chain B
     * @param _ticketIndex - The index of the ticket in the ticket queue
     * @param _lockId - The id of the lock to withdraw from
     */
    function bridgerWithdraw(
        bytes calldata _bridgerSignature,
        uint256 _ticketIndex,
        uint256 _lockId
    ) external {
        Lock storage l = idToLock[_lockId];
        ProviderTicket storage ticket = l.tickets[_ticketIndex];

        require(ticket.deadline > block.timestamp);
        require(msg.sender == ticket.bridger);
        require(ticket.amount > 0);

        _verify(
            ticket.bridger,
            _bridgerSignature,
            abi.encodePacked(ticket.chainBId, ticket.requestId)
        );

        uint256 providerFee = (ticket.amount * l.fees) / 1e4;
        uint256 prtlFee = (protocolFees * providerFee) / 100;
        uint256 amount = ticket.amount - providerFee;

        l.amount -= amount + prtlFee;
        l.accepted -= ticket.amount;
        ticket.amount = 0;
        ticket.signature = _bridgerSignature;

        ERC20(l.token).transfer(msg.sender, amount);
        ERC20(l.token).transfer(owner(), prtlFee);

        emit NewWithdraw(
            _lockId,
            _ticketIndex,
            ticket.chainBId,
            ticket.requestId,
            _bridgerSignature
        );
    }

    /**
     * @notice Used on chain B to withdraw the funds of the bridger by the provider
     * Anyone can send this signature as the only receiver of the lock is the chainA 
     * provider
     *
     * @param _bridgerSignature - The signature sent on the chain A by the bridger to redeem the funds
     * @param _requestId - The id of the request we are going to withdraw from
     */
    function withdrawRequest(
        bytes calldata _bridgerSignature,
        uint256 _requestId
    ) external {
        (address token, address provider, uint256 amount) = _deleteRequest(
            _bridgerSignature,
            _requestId
        );
        ERC20(token).transfer(provider, amount);
    }

    /**
     * @notice Used on chain B to relock the funds of the bridger into a provider lock
     *
     * @param _bridgerSignature - The signature sent on the chain A by the bridger to redeem the funds
     * @param _requestId - The id of the request we are going to withdraw from
     * @param _lockId - The id of the lock to relock into
     */
    function relockRequest(
        bytes calldata _bridgerSignature,
        uint256 _requestId,
        uint256 _lockId
    ) external {
        (address token, address provider, uint256 amount) = _deleteRequest(
            _bridgerSignature,
            _requestId
        );

        Lock storage l = idToLock[_lockId];

        require(l.owner == provider);
        require(l.owner == msg.sender);
        require(l.token == token);
        l.amount += amount;
    }

    /**
     * @notice - Used by the lock owner to delete an outdated ticket in order
     * to get the accepted amount of the lock released
     *
     * @param _lockId - The id of the lock to remove the ticket from
     * @param _ticketIndex - The index of the ticket to remove
     */
    function deleteTicket(uint256 _lockId, uint256 _ticketIndex) external {
        Lock storage l = idToLock[_lockId];
        ProviderTicket storage ticket = l.tickets[_ticketIndex];

        require(l.owner == msg.sender);
        require(ticket.deadline < block.timestamp);

        l.accepted -= ticket.amount;

        if (_ticketIndex == l.tickets.length - 1) {
            l.tickets.pop();
        } else {
            l.tickets[_ticketIndex] = l.tickets[l.tickets.length - 1];
            l.tickets.pop();
        }
    }

    /**
     * @notice Used to withdraw the locked funds, funds can be withdraw immediatly if there is no active challenger
     * @param _lockId - The lock id on the chain A
     */
    function withdrawLock(uint256 _lockId) external {
        Lock storage l = idToLock[_lockId];

        require(l.owner == msg.sender);
        uint256 i;

        for (i = 0; i < l.tickets.length; ++i) {
            require(
                l.tickets[i].deadline < block.timestamp ||
                    l.tickets[i].amount == 0
            );
        }

        uint256 amount = l.amount;
        address token = l.token;

        for (i = 0; i < myLocks[msg.sender].length; ++i) {
            if (myLocks[msg.sender][i] == _lockId) {
                _splice(myLocks[msg.sender], i);
                break;
            }
        }

        for (i = 0; i < tokenContractToLockIds[l.token].length; ++i) {
            if (tokenContractToLockIds[l.token][i] == _lockId) {
                _splice(tokenContractToLockIds[l.token], i);
                break;
            }
        }
        delete idToLock[_lockId];

        ERC20(token).transfer(msg.sender, amount);
    }

    /**
     * @notice - Used to withdraw the funds locked for a particular token request
     * @param _requestId - The id of the challenge to withdraw the funds from
     */
    function withdrawChainBRequest(uint256 _requestId) external {
        Request storage request = idToRequest[_requestId];

        require(request.sender == msg.sender);
        require(request.deadline < block.timestamp);

        uint256 amount = request.amount;
        address token = request.tokenBContract;

        for (uint256 i = 0; i < myRequests[msg.sender].length; ++i) {
            if (myRequests[msg.sender][i] == _requestId) {
                _splice(myRequests[msg.sender], i);
                break;
            }
        }
        for (
            uint256 i = 0;
            i < tokenContractToRequestIds[request.tokenBContract].length;
            ++i
        ) {
            if (
                tokenContractToRequestIds[request.tokenBContract][i] ==
                _requestId
            ) {
                _splice(tokenContractToRequestIds[request.tokenBContract], i);
                break;
            }
        }
        delete idToRequest[_requestId];

        ERC20(token).transfer(msg.sender, amount);
    }

    /**
     * @notice Used to extend lock liquidity.
     *
     * @param _lockId - Id of the lock
     * @param _amount - Amount to add
     */
    function addLiquidity(uint256 _lockId, uint256 _amount) external {
        Lock storage l = idToLock[_lockId];
        require(l.owner == msg.sender);

        l.amount += _amount;
        ERC20(l.token).transferFrom(msg.sender, address(this), _amount);
    }

    /**
     * @notice Remove liquidity from a provider lock
     * accepted amount is not withdrawable
     *
     * @param _lockId - Id of the lock
     * @param _amount - Amount to remove
     */
    function removeLiquidity(uint256 _lockId, uint256 _amount) external {
        Lock storage l = idToLock[_lockId];

        require(l.owner == msg.sender);
        require(l.amount - l.accepted >= _amount);
        l.amount -= _amount;

        ERC20(l.token).transfer(msg.sender, _amount);

        if (l.amount == 0) {
            for (uint256 i = 0; i < myLocks[msg.sender].length; ++i) {
                if (myLocks[msg.sender][i] == _lockId) {
                    _splice(myLocks[msg.sender], i);
                    break;
                }
            }
            for (
                uint256 i = 0;
                i < tokenContractToLockIds[l.token].length;
                ++i
            ) {
                if (tokenContractToLockIds[l.token][i] == _lockId) {
                    _splice(tokenContractToLockIds[l.token], i);
                    break;
                }
            }
            delete idToLock[_lockId];
        }
    }

    /**
     * @notice Updated the protocol fees
     * @param _newFee - % of new fee
     */
    function changeProtocolFees(uint256 _newFee) external onlyOwner {
        require(_newFee < 100);
        protocolFees = _newFee;
    }

    /**
     * @notice - Used to get acces to all the address' locks at once
     * @param _owner - The address to retrieve the locks from
     * @return uint256[] - An array containing the address active lock ids
     */
    function getMyLocks(address _owner) external view returns (Lock[] memory) {
        uint256[] memory lockIds = myLocks[_owner];
        Lock[] memory response = new Lock[](lockIds.length);

        for (uint256 i; i < lockIds.length; ++i) {
            response[i] = idToLock[lockIds[i]];
        }
        return response;
    }

    /**
     * @notice - Used to get the tickets of a given lock, not possible other way
     * @param _lockId - The id of the lock to get the challenges
     * @return - The array of the challenges for the given lock
     */
    function getLockTickets(uint256 _lockId)
        external
        view
        returns (ProviderTicket[] memory)
    {
        return idToLock[_lockId].tickets;
    }

    /**
     * @notice Used to get the active requests for a given address
     * @param _owner - The address to look for request ids
     * @return Requests[] - The list of the active requests for the user
     */
    function getMyRequests(address _owner)
        external
        view
        returns (Request[] memory)
    {
        uint256[] memory requestIds = myRequests[_owner];
        Request[] memory response = new Request[](requestIds.length);

        for (uint256 i; i < requestIds.length; ++i) {
            response[i] = idToRequest[requestIds[i]];
        }
        return response;
    }

    /**
     * @notice - Used to get the list of the request for a given token
     * @param _token - The token address on chain B to look for token requests
     */
    function getRequestsForToken(address _token)
        external
        view
        returns (Request[] memory)
    {
        uint256[] memory requestIds = tokenContractToRequestIds[_token];
        Request[] memory response = new Request[](requestIds.length);

        for (uint256 i; i < requestIds.length; ++i) {
            response[i] = idToRequest[requestIds[i]];
        }
        return response;
    }

    /**
     * @notice - Used to get the list of the locks for a given token
     * @param _token - The token address on chain A to look for token locks
     */
    function getLocksForToken(address _token)
        external
        view
        returns (Lock[] memory)
    {
        uint256[] memory lockIds = tokenContractToLockIds[_token];
        Lock[] memory response = new Lock[](lockIds.length);

        for (uint256 i; i < lockIds.length; ++i) {
            response[i] = idToLock[lockIds[i]];
        }
        return response;
    }

    /**
     * @notice Returns the accepted tickets corresponding to the locks ids given
     * by the user
     *
     * @param _lockIds - The ids of the locks to look into
     * @param _bridger - The address of the bridger to look for
     */
    function getAcceptedTickets(uint256[] calldata _lockIds, address _bridger)
        external
        view
        returns (ProviderTicket[] memory)
    {
        uint256 j;
        uint256 id;
        uint256 lastLock;

        ProviderTicket[] memory tickets;
        ProviderTicket[] memory response = new ProviderTicket[](
            _lockIds.length
        );

        for (uint256 i = 0; i < _lockIds.length; ++i) {
            tickets = idToLock[_lockIds[i]].tickets;
            _lockIds[i] == lastLock ? ++j : j = 0;
            lastLock = _lockIds[i];

            for (; j < tickets.length; ++j) {
                if (tickets[j].bridger == _bridger) {
                    response[id++] = tickets[j];
                    break;
                }
            }
        }
        return response;
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

    /**
     * @notice Used to delete a request from the request pool
     *
     * @param _bridgerSignature - The signature sent on the chain A by the bridger to redeem the funds
     * @param _requestId - The id of the request we are going to withdraw from
     */
    function _deleteRequest(
        bytes calldata _bridgerSignature,
        uint256 _requestId
    )
        private
        returns (
            address,
            address,
            uint256
        )
    {
        Request memory request = idToRequest[_requestId];

        require(request.deadline > block.timestamp);

        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        _verify(
            request.sender,
            _bridgerSignature,
            abi.encodePacked(chainId, _requestId)
        );

        for (uint256 i = 0; i < myRequests[request.sender].length; ++i) {
            if (myRequests[request.sender][i] == _requestId) {
                _splice(myRequests[request.sender], i);
                break;
            }
        }

        for (
            uint256 i = 0;
            i < tokenContractToRequestIds[request.tokenBContract].length;
            ++i
        ) {
            if (
                tokenContractToRequestIds[request.tokenBContract][i] ==
                _requestId
            ) {
                _splice(tokenContractToRequestIds[request.tokenBContract], i);
                break;
            }
        }

        delete idToRequest[_requestId];
        return (request.tokenBContract, request.provider, request.amount);
    }
}
