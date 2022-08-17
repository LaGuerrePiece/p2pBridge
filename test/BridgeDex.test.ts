import BigNumber from "bignumber.js";
import {
  BridgeDexInstance,
  DummyERC20Instance,
} from "../types/truffle-contracts";
import utils from "./utils";
import testing from "./utils";

const BridgeDex = artifacts.require("BridgeDex");
const DummyERC20 = artifacts.require("DummyERC20");

contract("BridgeDex protocol fees update", (accounts: Truffle.Accounts) => {
  var bridgeDex: BridgeDexInstance;

  before(async () => {
    bridgeDex = await BridgeDex.deployed();
  });

  it("Checks only the contract owner can change the contract protocol fees", async () => {
    await utils.catchRevert(bridgeDex.changeProtocolFees(10));
  });

  it("Checks we can't set more than 100% of the provider fees", async () => {
    await utils.catchRevert(bridgeDex.changeProtocolFees(101, {from: accounts[5]}));
  });

  it("Checks the owner of the contract can change the protocol fees", async () => {
    await bridgeDex.changeProtocolFees("50", {from: accounts[5]});
    const fees = await bridgeDex.protocolFees();

    assert.equal(
      fees.toString(),
      "50",
      "The contract should hold the new protocol fees"
    );
  });
});

contract(
  "BridgeDex Chain A Lock and Withdraw",
  (accounts: Truffle.Accounts) => {
    var bridgeDex: BridgeDexInstance;
    var bridgeDex2: BridgeDexInstance;
    var dummyERC20: DummyERC20Instance;
    var dummyERC202: DummyERC20Instance;

    before(async () => {
      bridgeDex = await BridgeDex.deployed();
      bridgeDex2 = await BridgeDex.new();
      dummyERC20 = await DummyERC20.deployed();
      dummyERC202 = await DummyERC20.new();

      await dummyERC202.transfer(accounts[3], new BigNumber("50e18").toFixed());
      await dummyERC202.approve(
        bridgeDex.address,
        new BigNumber("40e18").toFixed()
      );
    });

    it("Checks the owner receives the dummy tokens well", async () => {
      const dummyAmount = await dummyERC20.balanceOf(accounts[0]);

      assert.equal(
        dummyAmount.toString(),
        new BigNumber("5000000e18").toFixed(),
        "The number of tokens available at the beginning should be 5 millions"
      );
    });

    it("Checks without approval of the contract we can't start a lock", async () => {
      await testing.catchRevert(
        bridgeDex.lock(
          new BigNumber("1e18").toFixed(),
          dummyERC20.address,
          [1, 2, 3],
          100
        )
      );
    });

    it("Checks once we have approved the contract we can create a lock", async () => {
      const amount = new BigNumber("10000e18").toFixed();

      const balancesUserBefore = await dummyERC20.balanceOf(accounts[0]);
      const balanceBridgeBefore = await dummyERC20.balanceOf(bridgeDex.address);

      await dummyERC20.approve(
        bridgeDex.address,
        new BigNumber("1e50").toFixed()
      );
      await bridgeDex.lock(amount, dummyERC20.address, [1, 2, 3], 100);

      const balancesUserAfter = await dummyERC20.balanceOf(accounts[0]);
      const balanceBridgeAfter = await dummyERC20.balanceOf(bridgeDex.address);

      const lockId = await bridgeDex.lockNonce();
      const lock = await bridgeDex.idToLock(lockId);
      const locksForToken = await bridgeDex.getLocksForToken(
        dummyERC20.address
      );

      const myLocks = await bridgeDex.getMyLocks(accounts[0]);

      assert.deepEqual(
        locksForToken,
        myLocks,
        "The locks for token and the my locks should be initially equal"
      );

      assert.equal(
        lock[0].toString(),
        amount,
        "The amount in the lock should match the amount locked"
      );

      assert.equal(
        lock[0].toString(),
        myLocks[0].amount.toString(),
        "The lock from the mapping should match the lock from the myLocksGetter"
      );

      assert.equal(
        lock[1].toString(),
        myLocks[0].accepted.toString(),
        "The accepted amount should be the same on the mapping and the getter function"
      );

      assert.equal(
        lock[1].toString(),
        "0",
        "The accepted amount should be initially 0"
      );

      assert.equal(
        lock[2].toString(),
        myLocks[0].nonce.toString(),
        "The nonce should be the same on the mapping and the getter function"
      );

      assert.equal(lock[2].toString(), "1", "The first nonce should be one");

      assert.deepEqual(
        [1, 2, 3],
        myLocks[0].acceptedChains.map((value) => Number(value)),
        "The accepcted chains should be available on the getter response"
      );

      assert.equal(
        lock[3].toString(),
        myLocks[0].token.toString(),
        "The address of the token should be the same on the mapping and the getter function"
      );

      assert.equal(
        lock[3].toString(),
        dummyERC20.address,
        "The address of the provided token should be reported to the lock"
      );

      assert.equal(
        lock[4].toString(),
        myLocks[0].owner.toString(),
        "The address of the owner should be the same on the mapping and the getter function"
      );

      assert.equal(
        lock[4].toString(),
        accounts[0],
        "The address of the provided token should be reported to the lock"
      );

      assert.equal(
        lock[5].toString(),
        myLocks[0].fees.toString(),
        "The fees should be the same on the mapping and the getter function"
      );

      assert.equal(
        lock[5].toString(),
        "100",
        "The fees provided should be reported to the lock"
      );

      assert.equal(
        new BigNumber(balancesUserBefore.toString()).minus(amount).toFixed(),
        balancesUserAfter.toString(),
        "The user balances should be reduced after creating the lock"
      );

      assert.equal(
        lockId.toString(),
        "1",
        "The id of the lock should be 1 as its the first"
      );

      assert.equal(
        new BigNumber(balanceBridgeBefore.toString()).plus(amount).toFixed(),
        balanceBridgeAfter.toString(),
        "The bridge contract should have received the amount of the lock"
      );
    });

    it("Checks after creating a lock we can relock again for another token", async () => {
      const amount = new BigNumber("20000e18").toFixed();

      const balancesUserBefore = await dummyERC202.balanceOf(accounts[0]);
      const balanceBridgeBefore = await dummyERC202.balanceOf(
        bridgeDex.address
      );

      await dummyERC202.approve(
        bridgeDex.address,
        new BigNumber("1e50").toFixed()
      );
      await bridgeDex.lock(amount, dummyERC202.address, [3, 4, 5], 1000);

      const balancesUserAfter = await dummyERC202.balanceOf(accounts[0]);
      const balanceBridgeAfter = await dummyERC202.balanceOf(bridgeDex.address);

      const lockId = await bridgeDex.lockNonce();
      const locksForToken = await bridgeDex.getLocksForToken(
        dummyERC202.address
      );

      const myLocks = await bridgeDex.getMyLocks(accounts[0]);

      assert.equal(
        myLocks.length,
        2,
        "One new element should be pushed on the myLocks array"
      );

      assert.equal(
        locksForToken[0].amount.toString(),
        amount,
        "The amount in the lock should match the amount locked"
      );

      assert.equal(
        locksForToken[0].token.toString(),
        dummyERC202.address,
        "The address of the token in the lock should match the amount locked"
      );

      assert.deepEqual(
        locksForToken[0],
        myLocks[1],
        "The mylocks and locksfortoken should point to the same array"
      );

      assert.equal(
        new BigNumber(balancesUserBefore.toString()).minus(amount).toFixed(),
        balancesUserAfter.toString(),
        "The user balances should be reduced after creating the lock"
      );

      assert.equal(
        lockId.toString(),
        "2",
        "The id of the lock should be 2 as its the second one"
      );

      assert.equal(
        new BigNumber(balanceBridgeBefore.toString()).plus(amount).toFixed(),
        balanceBridgeAfter.toString(),
        "The bridge contract should have received the amount of the lock"
      );
    });

    it("Checks we can't withdraw a lock that we don't own", async () => {
      await testing.catchRevert(
        bridgeDex.withdrawLock(1, { from: accounts[1] })
      );
    });

    it("Checks we can withdraw if no amount was accepted", async () => {
      const balanceBefore = await dummyERC20.balanceOf(accounts[0]);
      const amount = new BigNumber("10000e18").toFixed();
      const lockId = "1";

      await bridgeDex.withdrawLock(1);

      const balancesAfter = await dummyERC20.balanceOf(accounts[0]);
      const lock = await bridgeDex.idToLock(lockId);
      const myLocks = await bridgeDex.getMyLocks(accounts[0]);
      const tokenLock = await bridgeDex.getLocksForToken(dummyERC202.address);

      assert.equal(
        myLocks.length,
        1,
        "The myLocks length should be reduced by one"
      );

      assert.deepEqual(
        myLocks,
        tokenLock,
        "The dummyERC202 should be the only lock remaining"
      );

      assert.equal(
        new BigNumber(balancesAfter.toString())
          .minus(balanceBefore.toString())
          .toFixed(),
        amount,
        "After the withdrawal of the funds the balances should be credited of the remainder of the lock"
      );

      assert.equal(
        lock[0].toString(),
        "0",
        "The lock amount should be deleted after the withdrawal of the funds"
      );
      assert.equal(
        lock[1].toString(),
        "0",
        "The lock accepted amount should be deleted after the withdrawal of the funds"
      );
      assert.equal(
        lock[2].toString(),
        "0",
        "The lock nonce should be deleted after the withdrawal of the funds"
      );
      assert.equal(
        lock[3].toString(),
        "0x0000000000000000000000000000000000000000",
        "The address of the token should be set to the 0 address after a withdrawal"
      );
      assert.equal(
        lock[4].toString(),
        "0x0000000000000000000000000000000000000000",
        "The address of the lock owner should be resetted"
      );
      assert.equal(
        lock[5].toString(),
        "0",
        "The fees of the lock should be deleted after the withdrawal"
      );
    });

    it("Checks we can't add liquidity to a lock we don't own", async () => {
      await utils.catchRevert(
        bridgeDex.addLiquidity(2, new BigNumber("10e18").toFixed(), {
          from: accounts[3],
        })
      );
    });

    it("Checks the owner can add liquidity", async () => {
      const amount = new BigNumber("10e18").toFixed();
      const lockBefore = await bridgeDex.idToLock(2);
      const userBalanceBefore = await dummyERC202.balanceOf(accounts[0]);
      const contractBalanceBefore = await dummyERC202.balanceOf(
        bridgeDex.address
      );

      await bridgeDex.addLiquidity(2, amount);

      const userBalanceAfter = await dummyERC202.balanceOf(accounts[0]);
      const lockAfter = await bridgeDex.idToLock(2);
      const contractBalanceAfter = await dummyERC202.balanceOf(
        bridgeDex.address
      );

      assert.equal(
        new BigNumber(lockBefore[0].toString()).plus(amount).toFixed(),
        lockAfter[0].toString(),
        "The lock amount should be increased after adding liquidity"
      );

      assert.equal(
        new BigNumber(userBalanceBefore.toString()).minus(amount).toFixed(),
        userBalanceAfter.toString(),
        "The user balances should be reduced after adding the liquidity"
      );

      assert.equal(
        new BigNumber(userBalanceBefore.toString()).minus(amount).toFixed(),
        userBalanceAfter.toString(),
        "The user balances should be reduced after adding the liquidity"
      );

      assert.equal(
        new BigNumber(contractBalanceBefore.toString()).plus(amount).toFixed(),
        contractBalanceAfter.toString(),
        "The contract balances should be increased after adding liquidity"
      );
    });

    it("Checks we can't withdraw liquidity from a lock we don't own", async () => {
      await utils.catchRevert(
        bridgeDex.removeLiquidity(2, new BigNumber("10e18").toFixed(), {
          from: accounts[3],
        })
      );
    });

    it("Checks we can withdraw liquidity from a lock we own", async () => {
      const amount = new BigNumber("100e18").toFixed();
      const lockBefore = await bridgeDex.idToLock(2);
      const userBalanceBefore = await dummyERC202.balanceOf(accounts[0]);
      const contractBalanceBefore = await dummyERC202.balanceOf(
        bridgeDex.address
      );

      await bridgeDex.removeLiquidity(2, amount);

      const userBalanceAfter = await dummyERC202.balanceOf(accounts[0]);
      const lockAfter = await bridgeDex.idToLock(2);
      const contractBalanceAfter = await dummyERC202.balanceOf(
        bridgeDex.address
      );

      assert.equal(
        new BigNumber(lockBefore[0].toString()).minus(amount).toFixed(),
        lockAfter[0].toString(),
        "The lock amount should be reduced after removing liquidity"
      );

      assert.equal(
        new BigNumber(userBalanceBefore.toString()).plus(amount).toFixed(),
        userBalanceAfter.toString(),
        "The user balances should be increased after removing the liquidity"
      );

      assert.equal(
        new BigNumber(userBalanceBefore.toString()).plus(amount).toFixed(),
        userBalanceAfter.toString(),
        "The user balances should be increased after removing the liquidity"
      );

      assert.equal(
        new BigNumber(contractBalanceBefore.toString()).minus(amount).toFixed(),
        contractBalanceAfter.toString(),
        "The contract balances should be reduced after removing liquidity"
      );
    });

    it("Checks removing all the liquidity deletes the lock", async () => {
      const lock = await bridgeDex.idToLock(2);
      await bridgeDex.removeLiquidity(2, lock[0].toString());

      const myLocks = await bridgeDex.getMyLocks(accounts[0]);
      const tokenLocks = await bridgeDex.getLocksForToken(dummyERC202.address);
      const lockAfter = await bridgeDex.idToLock(2);

      assert.equal(
        myLocks.length,
        0,
        "After removing all the liquidity the lock should not appear in myLocks"
      );

      assert.equal(
        tokenLocks.length,
        0,
        "After removing all the liquidity the lock should not appear in the tokensLocks list"
      );

      assert.equal(
        lockAfter[2].toString(),
        "0",
        "The lock should be deleted from the idToLock mapping"
      );
    });
  }
);

contract("BridgeDex Chain B Publish request", (accounts: Truffle.Accounts) => {
  var bridgeDex: BridgeDexInstance;
  var bridgeDex2: BridgeDexInstance;
  var dummyERC20: DummyERC20Instance;
  var dummyERC202: DummyERC20Instance;

  before(async () => {
    bridgeDex = await BridgeDex.deployed();
    bridgeDex2 = await BridgeDex.new();
    dummyERC20 = await DummyERC20.deployed();
    dummyERC202 = await DummyERC20.new();
  });

  it("Checks without approval a bridger cannot publish a request", async () => {
    await utils.catchRevert(
      bridgeDex.publishRequest(
        new BigNumber("10e18").toFixed(),
        1,
        1,
        10,
        dummyERC20.address,
        accounts[3]
      )
    );
  });

  it("Checks with approval a bridge request can be created", async () => {
    await dummyERC20.approve(
      bridgeDex.address,
      new BigNumber("10e50").toFixed()
    );

    const amount = new BigNumber("100e18").toFixed();
    const toChain = "2";
    const lockId = "5";
    const requestId = "1";
    const deadline = Math.floor(Date.now() / 1000);

    const contractBalanceBefore = await dummyERC20.balanceOf(bridgeDex.address);
    const userBalanceBefore = await dummyERC20.balanceOf(accounts[0]);

    await bridgeDex.publishRequest(
      amount,
      toChain,
      lockId,
      deadline,
      dummyERC20.address,
      accounts[3]
    );

    const contractBalanceAfter = await dummyERC20.balanceOf(bridgeDex.address);
    const userBalanceAfter = await dummyERC20.balanceOf(accounts[0]);
    const tokenRequests = await bridgeDex.getRequestsForToken(
      dummyERC20.address
    );
    const myRequests = await bridgeDex.getMyRequests(accounts[0]);
    const request = await bridgeDex.idToRequest(1);

    assert.equal(
      new BigNumber(contractBalanceBefore.toString()).plus(amount).toFixed(),
      contractBalanceAfter.toString(),
      "The balance of the contract should be increased after the deposit"
    );

    assert.equal(
      new BigNumber(userBalanceAfter.toString()).plus(amount).toFixed(),
      userBalanceBefore.toString(),
      "The balance of the user should be reduced after the deposit"
    );

    assert.equal(
      request[0].toString(),
      amount,
      "The amount of the request should match input amount"
    );

    assert.equal(
      request[0].toString(),
      tokenRequests[0].amount.toString(),
      "The token request getters should send the right request"
    );

    assert.deepEqual(
      tokenRequests,
      myRequests,
      "The tokens requests and my requests array should be the same"
    );

    assert.equal(
      request[1].toString(),
      toChain,
      "The destination chain of the request should match input destination chain"
    );

    assert.equal(
      request[2].toString(),
      lockId,
      "The lockId of the request should match input lockId"
    );

    assert.equal(
      request[3].toString(),
      requestId,
      "The requestId of the request should match input requestId"
    );

    assert.equal(
      request[4].toString(),
      dummyERC20.address,
      "The token of the request should match input token"
    );

    assert.equal(
      request[5].toString(),
      accounts[0],
      "The sender of the request should be reported into the request"
    );

    assert.equal(
      request[6].toString(),
      accounts[3],
      "The provider of the request should match input provider"
    );

    assert.equal(
      request[7].toString(),
      String(deadline),
      "The deadline of the request should match input deadline"
    );
  });

  it("Checks we can have two simultaneous request on a single chain", async () => {
    await dummyERC202.approve(
      bridgeDex.address,
      new BigNumber("10e50").toFixed()
    );

    const amount = new BigNumber("111e18").toFixed();
    const toChain = "5";
    const lockId = "3";
    const requestId = "2";
    const deadline = Math.floor(Date.now() / 1000) + 100;

    await bridgeDex.publishRequest(
      amount,
      toChain,
      lockId,
      deadline,
      dummyERC202.address,
      accounts[4]
    );

    const tokenRequests = await bridgeDex.getRequestsForToken(
      dummyERC202.address
    );
    const myRequests = await bridgeDex.getMyRequests(accounts[0]);
    const request = await bridgeDex.idToRequest(requestId);

    assert.equal(
      myRequests.length,
      2,
      "A new element should be returned by the myRequest getter"
    );

    assert.equal(
      tokenRequests.length,
      1,
      "The dummyERC202 token request list should contain one element"
    );

    assert.equal(
      request[0].toString(),
      myRequests[1].amount.toString(),
      "The new request should have the same amount than the second user requests"
    );

    assert.equal(
      request[0].toString(),
      amount,
      "The amount of the request should match the input amount"
    );
  });

  it("Checks we cant withdraw a request before the deadline", async () => {
    await utils.catchRevert(bridgeDex.withdrawChainBRequest(2));
  });

  it("Checks after the deadline only the owner can withdraw the request's funds", async () => {
    await utils.catchRevert(
      bridgeDex.withdrawChainBRequest(1, { from: accounts[1] })
    );
  });

  it("Checks after the deadline we can withdraw a request funds", async () => {
    const userBalanceBefore = await dummyERC20.balanceOf(accounts[0]);
    const contractBalanceBefore = await dummyERC20.balanceOf(bridgeDex.address);
    const amount = new BigNumber("100e18").toFixed();
    const amount2 = new BigNumber("111e18").toFixed();

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
    await bridgeDex.withdrawChainBRequest(1);

    const userBalanceAfter = await dummyERC20.balanceOf(accounts[0]);
    const contractBalanceAfter = await dummyERC20.balanceOf(bridgeDex.address);
    const request = await bridgeDex.idToRequest(1);
    const myRequest = await bridgeDex.getMyRequests(accounts[0]);
    const tokenRequests = await bridgeDex.getRequestsForToken(
      dummyERC20.address
    );

    assert.equal(
      request[1].toString(),
      "0",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      userBalanceAfter.toString(),
      new BigNumber(userBalanceBefore.toString()).plus(amount).toFixed(),
      "After the withdrawal of the request user's funds should be increased"
    );

    assert.equal(
      contractBalanceAfter.toString(),
      new BigNumber(contractBalanceBefore.toString()).minus(amount).toFixed(),
      "After the request withdrawal the contract funds should be reduced"
    );

    assert.equal(
      myRequest.length,
      1,
      "One of the request should be removed after the withdrawal"
    );
    assert.equal(
      tokenRequests.length,
      0,
      "After the withdrawal no token request should be left"
    );

    assert.equal(
      myRequest[0].amount.toString(),
      amount2.toString(),
      "The remaining request should be the one that was no withdrawn"
    );
  });
});

contract("BridgeDex ChainA Accept bridger", (accounts: Truffle.Accounts) => {
  var bridgeDex: BridgeDexInstance;
  var bridgeDex2: BridgeDexInstance;
  var dummyERC20: DummyERC20Instance;
  var dummyERC202: DummyERC20Instance;
  var bridgerSignature: string;

  before(async () => {
    bridgeDex = await BridgeDex.deployed();
    bridgeDex2 = await BridgeDex.new();
    dummyERC20 = await DummyERC20.deployed();
    dummyERC202 = await DummyERC20.new();

    await dummyERC20.approve(
      bridgeDex.address,
      new BigNumber("1e50").toFixed()
    );
    await bridgeDex.lock(
      new BigNumber("10000e18").toFixed(),
      dummyERC20.address,
      [1, 2, 3],
      "1000"
    );
  });

  it("Checks we can't add a ticket if we don't own the lock", async () => {
    const amount = new BigNumber("100e18").toFixed();
    const chainBId = "3";
    const requestId = "4";
    const deadline = Math.floor(Date.now() / 1000);
    await utils.catchRevert(
      bridgeDex.acceptBridger(
        amount,
        1,
        chainBId,
        deadline,
        requestId,
        accounts[1],
        { from: accounts[2] }
      )
    );
  });

  it("Checks if we are the owner we can add a ticket", async () => {
    const amount = new BigNumber("100e18").toFixed();
    const chainBId = "3";
    const requestId = "4";
    const deadline = Math.floor(Date.now() / 1000) + 100;
    await bridgeDex.acceptBridger(
      amount,
      1,
      chainBId,
      deadline,
      requestId,
      accounts[1]
    );

    const lock = (await bridgeDex.getMyLocks(accounts[0]))[0];

    assert.equal(
      lock.tickets.length,
      1,
      "The new ticket should be added to the ticket queue"
    );

    assert.equal(
      lock.accepted.toString(),
      amount,
      "The accepted amount should be increased by the accepted amount"
    );

    assert.equal(
      lock.tickets[0].amount.toString(),
      amount,
      "The amount of the ticket should match the input amount"
    );

    assert.equal(
      lock.tickets[0].chainBId.toString(),
      chainBId,
      "The chainBId of the ticket should match the input chainBId"
    );

    assert.equal(
      lock.tickets[0].bridger.toString(),
      accounts[1],
      "The bridger of the ticket should match the input bridger"
    );

    assert.equal(
      lock.tickets[0].deadline.toString(),
      String(deadline),
      "The deadline of the ticket should match the input deadline"
    );

    assert.equal(
      lock.tickets[0].requestId.toString(),
      requestId,
      "The requestId of the ticket should match the input requestId"
    );

    assert.equal(
      lock.tickets[0].signature.toString(),
      "0x",
      "The signature should be empty right after the ticket creation"
    );
  });

  it("Checks we can't add a new ticket with a too high amount", async () => {
    const amount = new BigNumber("9950e18").toFixed();
    const chainBId = "2";
    const requestId = "5";
    const deadline = Math.floor(Date.now() / 1000);
    await utils.catchRevert(
      bridgeDex.acceptBridger(
        amount,
        1,
        chainBId,
        deadline,
        requestId,
        accounts[1]
      )
    );
  });

  it("Checks we can't withdraw a lock with non nil accepted amount", async () => {
    await utils.catchRevert(bridgeDex.withdrawLock(1));
  });

  it("Checks a user with several tickets can see all of them at the same time", async () => {
    const amount = new BigNumber("100e18").toFixed();
    const amount2 = new BigNumber("200e18").toFixed();
    const chainBId2 = "1";
    const requestId2 = "6";
    const deadline2 = Math.floor(Date.now() / 1000) + 100;

    await bridgeDex.acceptBridger(
      amount2,
      1,
      chainBId2,
      deadline2 - 100,
      requestId2,
      accounts[3]
    );

    await bridgeDex.acceptBridger(
      amount2,
      1,
      chainBId2,
      deadline2,
      requestId2,
      accounts[1]
    );

    const tickets = await bridgeDex.getAcceptedTickets([1, 1], accounts[1]);
    const lock = await bridgeDex.idToLock(1);

    assert.equal(
      lock[1].toString(),
      new BigNumber(amount).plus(amount2).plus(amount2).toFixed(),
      "The accepted amount should be the sum of the tickets amounts"
    );

    assert.equal(
      tickets.length,
      2,
      "The new ticket should be added to user ticket queue"
    );

    assert.equal(
      tickets[1].amount.toString(),
      amount2,
      "The amount of the ticket should match the input amount"
    );

    assert.equal(
      tickets[1].chainBId.toString(),
      chainBId2,
      "The chainBId of the ticket should match the input chainBId"
    );

    assert.equal(
      tickets[1].bridger.toString(),
      accounts[1],
      "The bridger of the ticket should match the input bridger"
    );

    assert.equal(
      tickets[1].deadline.toString(),
      String(deadline2),
      "The deadline of the ticket should match the input deadline"
    );

    assert.equal(
      tickets[1].requestId.toString(),
      requestId2,
      "The requestId of the ticket should match the input requestId"
    );

    assert.equal(
      tickets[1].signature.toString(),
      "0x",
      "The signature should be empty right after the ticket creation"
    );
  });

  it("Checks the getAcceptedTicket function returns empty tickets if they were not accepted", async () => {
    const amount2 = new BigNumber("200e18").toFixed();
    const chainBId2 = "1";
    const requestId2 = "6";

    const tickets = await bridgeDex.getAcceptedTickets([1, 1], accounts[3]);

    assert.equal(
      tickets.length,
      2,
      "The new ticket should be added to user ticket queue"
    );

    assert.equal(
      tickets[0].amount.toString(),
      amount2,
      "The amount of the ticket should match the input amount"
    );

    assert.equal(
      tickets[0].chainBId.toString(),
      chainBId2,
      "The chainBId of the ticket should match the input chainBId"
    );

    assert.equal(
      tickets[0].bridger.toString(),
      accounts[3],
      "The bridger of the ticket should match the input bridger"
    );

    assert.equal(
      tickets[0].requestId.toString(),
      requestId2,
      "The requestId of the ticket should match the input requestId"
    );

    assert.equal(
      tickets[0].signature.toString(),
      "0x",
      "The signature should be empty right after the ticket creation"
    );

    assert.equal(
      tickets[1].bridger,
      "0x0000000000000000000000000000000000000000",
      "if the ticket was not validated an empty ticket should be returned"
    );
    assert.equal(
      tickets[1].requestId.toString(),
      "0",
      "if the ticket was not validated an empty ticket should be returned"
    );
  });

  it("Checks only the owner of the ticket can submit the ticket validation", async () => {
    const chainBId = "3";
    const requestId = "4";
    const ticketIndex = "0";
    const lockId = "1";
    const bridger = accounts[1];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);
    await utils.catchRevert(
      bridgeDex.bridgerWithdraw(bridgerSignature, ticketIndex, lockId)
    );
  });

  it("Checks the bridger cant submit a wrong signature", async () => {
    const chainBId = "3";
    const requestId = "7";
    const ticketIndex = "0";
    const lockId = "1";
    const bridger = accounts[1];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);
    await utils.catchRevert(
      bridgeDex.bridgerWithdraw(bridgerSignature, ticketIndex, lockId)
    );
  });

  it("Checks we can withdraw the provider funds by submitting a valid signature", async () => {
    const amount = new BigNumber("100e18").toFixed();
    const amount2 = new BigNumber("200e18").toFixed();
    const fees = new BigNumber(amount).dividedToIntegerBy("10").toFixed();
    const protocolFees = new BigNumber(fees).dividedToIntegerBy("10").toFixed();

    const chainBId = "3";
    const requestId = "4";
    const ticketIndex = "0";
    const lockId = "1";
    const bridger = accounts[1];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);

    const lockBefore = await bridgeDex.idToLock(1);
    const userBalanceBefore = await dummyERC20.balanceOf(accounts[1]);
    const contractBalanceBefore = await dummyERC20.balanceOf(bridgeDex.address);
    const ownerBalanceBefore = await dummyERC20.balanceOf(accounts[5]);

    await bridgeDex.bridgerWithdraw(bridgerSignature, ticketIndex, lockId, {
      from: accounts[1],
    });

    const lockAfter = await bridgeDex.idToLock(1);
    const userBalanceAfter = await dummyERC20.balanceOf(accounts[1]);
    const contractBalanceAfter = await dummyERC20.balanceOf(bridgeDex.address);
    const ownerBalanceAfter = await dummyERC20.balanceOf(accounts[5]);
    const myLocks = await bridgeDex.getMyLocks(accounts[0]);

    assert.equal(
      userBalanceAfter.toString(),
      new BigNumber(userBalanceBefore.toString())
        .plus(amount)
        .minus(fees)
        .toFixed(),
      "After the signature submission the funds minus the fees should be sent to the bridger"
    );

    assert.equal(
      contractBalanceAfter.toString(),
      new BigNumber(contractBalanceBefore.toString())
        .minus(amount)
        .minus(protocolFees)
        .plus(fees)
        .toFixed(),
      "After the signature submission the funds minus the fees should be reduced from the contract"
    );

    assert.equal(
      ownerBalanceAfter.toString(),
      new BigNumber(ownerBalanceBefore.toString()).plus(protocolFees).toFixed(),
      "After a successfull withdrawal the protocol should have eearned fees"
    );

    assert.equal(
      lockAfter[1].toString(),
      new BigNumber(lockBefore[1].toString()).minus(amount).toFixed(),
      "The accepted amount of the lock should be reduced after a ticket withdrawal"
    );

    assert.equal(
      lockAfter[0].toString(),
      new BigNumber(lockBefore[0].toString())
        .minus(amount)
        .plus(fees)
        .minus(protocolFees)
        .toFixed(),
      "The lock amount should be reduced by the amount + fees - protocol fees"
    );

    assert.equal(
      myLocks[0].tickets[0].amount.toString(),
      "0",
      "The ticket amount should be 0 after the ticket withdrawal"
    );

    assert.equal(
      myLocks[0].tickets[0].signature.toString(),
      bridgerSignature,
      "The signature should be added to the ticket after the withdrawal"
    );
  });

  it("Checks the ticket withdrawal twice doesn't work", async () => {
    const chainBId = "3";
    const requestId = "4";
    const ticketIndex = "0";
    const lockId = "1";
    const bridger = accounts[1];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);

    await utils.catchRevert(
      bridgeDex.bridgerWithdraw(bridgerSignature, ticketIndex, lockId, {
        from: accounts[1],
      })
    );
  });

  it("Checks we can't submit a signature after the deadline", async () => {
    const chainBId = "1";
    const requestId = "6";
    const ticketIndex = "2";
    const lockId = "1";
    const bridger = accounts[3];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);

    await utils.catchRevert(
      bridgeDex.bridgerWithdraw(bridgerSignature, ticketIndex, lockId, {
        from: accounts[1],
      })
    );
  });

  it("Checks after a withdrawal the get accepted tickets returns the same tickets", async () => {
    const chainBId = "3";
    const requestId = "4";

    const tickets = await bridgeDex.getAcceptedTickets([1, 1], accounts[1]);

    assert.equal(
      tickets.length,
      2,
      "The accepted ticket lenght should still be 2"
    );

    assert.equal(
      tickets[0].amount.toString(),
      "0",
      "The ticket should have a nil amount after the withdrawal"
    );

    assert.equal(
      tickets[0].chainBId.toString(),
      chainBId,
      "The chainBId of the ticket should match the input chainBId"
    );

    assert.equal(
      tickets[0].bridger.toString(),
      accounts[1],
      "The bridger of the ticket should match the input bridger"
    );

    assert.equal(
      tickets[0].requestId.toString(),
      requestId,
      "The requestId of the ticket should match the input requestId"
    );

    assert.notEqual(
      tickets[0].signature.toString(),
      "0x",
      "The signature should not be empty after the withdrawal"
    );
  });

  it("Checks we can't delete a ticket with a not expired deadline", async () => {
    await utils.catchRevert(bridgeDex.deleteTicket(1, 2));
  });

  it("Checks we can't delete a ticket if we are not the lock owner", async () => {
    await utils.catchRevert(
      bridgeDex.deleteTicket(1, 1, { from: accounts[9] })
    );
  });

  it("Checks we can delete a ticket if the deadline is expired", async () => {
    const amount = new BigNumber("200e18").toFixed();
    const lockBefore = (await bridgeDex.getMyLocks(accounts[0]))[0];
    await bridgeDex.deleteTicket(1, 1);
    const lockAfter = (await bridgeDex.getMyLocks(accounts[0]))[0];

    assert.equal(
      lockAfter.tickets.length,
      2,
      "After a ticket deletion the number of ticket into the lock should be decremented"
    );

    assert.equal(
      lockBefore.amount.toString(),
      lockAfter.amount.toString(),
      "The amout after a ticket deletion should be the same"
    );

    assert.equal(
      lockBefore.accepted.toString(),
      new BigNumber(lockAfter.accepted.toString()).plus(amount).toFixed(),
      "The accepted amount of the lock should be reduced after the expired ticket deletion"
    );
  });

  it("Checks we can't delete a lock with a unexpired ticket deadline", async () => {
    await utils.catchRevert(bridgeDex.withdrawLock(1));
  });

  it("Checks if all the tickets are withdrawn or expired a lock owner can withdraw the lock", async () => {
    const timeId = await utils.takeSnapshot();
    await utils.advanceTimeAndBlock(1000);

    await bridgeDex.withdrawLock(1);
    const lockAfter = await bridgeDex.idToLock(1);
    const myLocks = await bridgeDex.getMyLocks(accounts[0]);
    const tokenLocks = await bridgeDex.getLocksForToken(dummyERC20.address);

    assert.equal(
      lockAfter[0].toString(),
      "0",
      "After the lock withdraw the lock should be deleted"
    );

    assert.equal(
      lockAfter[3].toString(),
      "0x0000000000000000000000000000000000000000",
      "After the lock withdrawal the token address should be nil"
    );

    assert.equal(
      myLocks.length,
      0,
      "After the lock withdrawal the myLocks length should be decreased"
    );
    assert.equal(
      tokenLocks.length,
      0,
      "After the lock withdrawal the token Locks length should be decreased"
    );

    await utils.revertToSnapShot(Number(timeId));
  });
});

contract("BridgeDex ChainB funds unlock", (accounts: Truffle.Accounts) => {
  var bridgeDex: BridgeDexInstance;
  var bridgeDex2: BridgeDexInstance;
  var dummyERC20: DummyERC20Instance;
  var dummyERC202: DummyERC20Instance;

  before(async () => {
    bridgeDex = await BridgeDex.deployed();
    bridgeDex2 = await BridgeDex.new();
    dummyERC20 = await DummyERC20.deployed();
    dummyERC202 = await DummyERC20.new();

    await dummyERC20.approve(
      bridgeDex.address,
      new BigNumber("10e50").toFixed()
    );
    await dummyERC20.approve(
      bridgeDex.address,
      new BigNumber("10e50").toFixed(),
      { from: accounts[3] }
    );

    await dummyERC20.transfer(accounts[3], new BigNumber("1000e18").toFixed());
    await bridgeDex.lock(
      new BigNumber("500e18").toFixed(),
      dummyERC20.address,
      [1, 2, 3],
      1000,
      { from: accounts[3] }
    );

    await dummyERC202.approve(
      bridgeDex.address,
      new BigNumber("10e50").toFixed()
    );
    await dummyERC202.approve(
      bridgeDex.address,
      new BigNumber("10e50").toFixed(),
      { from: accounts[3] }
    );
    await dummyERC202.transfer(accounts[3], new BigNumber("1000e18").toFixed());
    await bridgeDex.lock(
      new BigNumber("500e18").toFixed(),
      dummyERC202.address,
      [1, 2, 3],
      1000,
      { from: accounts[3] }
    );

    const amount = new BigNumber("100e18").toFixed();
    const amount2 = new BigNumber("200e18").toFixed();
    const toChain = "2";
    const toChain2 = "3";
    const lockId = "5";
    const lockId2 = "6";
    const deadline = Math.floor(Date.now() / 1000) + 100;

    await bridgeDex.publishRequest(
      amount,
      toChain,
      lockId,
      deadline,
      dummyERC20.address,
      accounts[3]
    );

    await bridgeDex.publishRequest(
      amount2,
      toChain2,
      lockId2,
      deadline - 100,
      dummyERC20.address,
      accounts[3]
    );

    await bridgeDex.publishRequest(
      amount2,
      toChain2,
      lockId2,
      deadline,
      dummyERC20.address,
      accounts[3]
    );
  });

  it("Checks with the wrong signature we can't take the funds", async () => {
    const chainBId = "1337";
    const requestId = "567";
    const bridger = accounts[0];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);
    await utils.catchRevert(
      bridgeDex.withdrawRequest(bridgerSignature, 1, { from: accounts[4] })
    );
  });

  it("Checks we can't take the funds of a request after the deadline", async () => {
    const chainBId = "1337";
    const requestId = "2";
    const bridger = accounts[0];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);
    await utils.catchRevert(
      bridgeDex.withdrawRequest(bridgerSignature, 2, { from: accounts[4] })
    );
  });

  it("Checks we can withdraw a request with the right signature", async () => {
    const amount = new BigNumber("100e18").toFixed();
    const chainBId = "1337";
    const requestId = "1";
    const bridger = accounts[0];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);
    const providerBalanceBefore = await dummyERC20.balanceOf(accounts[3]);
    await bridgeDex.withdrawRequest(bridgerSignature, 1, { from: accounts[4] });
    const providerBalanceAfter = await dummyERC20.balanceOf(accounts[3]);

    const tokenRequests = await bridgeDex.getRequestsForToken(
      dummyERC20.address
    );
    const myRequest = await bridgeDex.getMyRequests(accounts[0]);
    const request = await bridgeDex.idToRequest(1);

    assert.equal(
      request[0].toString(),
      "0",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      request[1].toString(),
      "0",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      request[2].toString(),
      "0",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      request[3].toString(),
      "0",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      request[4].toString(),
      "0x0000000000000000000000000000000000000000",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      myRequest.length,
      2,
      "One of the requests of the user should be deleted"
    );

    assert.equal(
      tokenRequests.length,
      2,
      "After the token withdrawal the token request length should be decremented"
    );

    assert.equal(
      providerBalanceAfter.toString(),
      new BigNumber(providerBalanceBefore.toString()).plus(amount).toFixed(),
      "The provider should have received the funds on its address"
    );
  });

  it("Checks only the provider can perform a relock withdraw", async () => {
    const chainBId = "1337";
    const requestId = "3";
    const bridger = accounts[0];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);
    await utils.catchRevert(
      bridgeDex.relockRequest(bridgerSignature, 3, 1, { from: accounts[4] })
    );
  });

  it("Checks we can't withdraw a request twice", async () => {
    const amount = new BigNumber("100e18").toFixed();
    const chainBId = "1337";
    const requestId = "1";
    const bridger = accounts[0];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);
    await utils.catchRevert(
      bridgeDex.withdrawRequest(bridgerSignature, 1, { from: accounts[4] })
    );
  });

  it("Checks relock withdraw works only with the same token", async () => {
    const chainBId = "1337";
    const requestId = "3";
    const bridger = accounts[0];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);
    await utils.catchRevert(
      bridgeDex.relockRequest(bridgerSignature, 3, 2, { from: accounts[3] })
    );
  });

  it("Checks a provider can withdraw and relock directly", async () => {
    const amount = new BigNumber("200e18").toFixed();
    const chainBId = "1337";
    const requestId = "3";
    const bridger = accounts[0];

    const encodedParameters = web3.utils.encodePacked(
      { type: "uint256", value: chainBId },
      { type: "uint256", value: requestId }
    )!;

    const bridgerSignature = await web3.eth.sign(encodedParameters, bridger);
    const providerBalanceBefore = await dummyERC20.balanceOf(accounts[3]);
    const lockBefore = await bridgeDex.idToLock(1);
    await bridgeDex.relockRequest(bridgerSignature, 3, 1, {
      from: accounts[3],
    });
    const providerBalanceAfter = await dummyERC20.balanceOf(accounts[3]);
    const lockAfter = await bridgeDex.idToLock(1);

    const tokenRequests = await bridgeDex.getRequestsForToken(
      dummyERC20.address
    );
    const myRequest = await bridgeDex.getMyRequests(accounts[0]);
    const request = await bridgeDex.idToRequest(3);

    assert.equal(
      request[0].toString(),
      "0",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      request[1].toString(),
      "0",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      request[2].toString(),
      "0",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      request[3].toString(),
      "0",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      request[4].toString(),
      "0x0000000000000000000000000000000000000000",
      "After the withdrawal of the request the request should be deleted"
    );

    assert.equal(
      providerBalanceAfter.toString(),
      providerBalanceBefore.toString(),
      "The provider balances should stay the same after the relock operation"
    );

    assert.equal(
      lockAfter[0].toString(),
      new BigNumber(lockBefore[0].toString()).plus(amount).toFixed(),
      "The lock should be increased by the relocked amount"
    );

    assert.equal(
      lockAfter[1].toString(),
      lockBefore[1].toString(),
      "The accepted amount of the lock should not change after the relock operation"
    );

    assert.equal(
      myRequest.length,
      1,
      "One of the requests should be popped after the relock operation"
    );
    assert.equal(
      tokenRequests.length,
      1,
      "One of the token requests should be deleted after the relock operation"
    );
  });
});
