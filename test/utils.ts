import BigNumber from "bignumber.js";

const PREFIX = "Returned error: VM Exception while processing transaction: ";

async function tryCatch(promise: Promise<any>, message: string) {
  try {
    await promise;
    throw null;
  } catch (error: any) {
    assert(error, "Expected an error but did not get one");
    assert(
      error.message.startsWith(PREFIX + message),
      "Expected an error starting with '" +
        PREFIX +
        message +
        "' but got '" +
        error.message +
        "' instead"
    );
  }
}

const advanceTime = (time: number) => {
  return new Promise((resolve, reject) => {
    (web3 as any).currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [time],
        id: new Date().getTime(),
      },
      (err: string, result: string) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

const advanceBlock = () => {
  return new Promise((resolve, reject) => {
    (web3 as any).currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_mine",
        id: new Date().getTime(),
      },
      (err: string, result: string) => {
        if (err) {
          return reject(err);
        }
        const newBlockHash = (web3 as any).eth.getBlock("latest").hash;

        return resolve(newBlockHash);
      }
    );
  });
};

const takeSnapshot = () => {
  return new Promise<string>((resolve, reject) => {
    (web3 as any).currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_snapshot",
        id: new Date().getTime(),
      },
      (err: string, snapshotId: string) => {
        if (err) {
          return reject(err);
        }
        return resolve(snapshotId);
      }
    );
  });
};

const revertToSnapShot = (id: number) => {
  return new Promise((resolve, reject) => {
    (web3 as any).currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_revert",
        params: [id],
        id: new Date().getTime(),
      },
      (err: string, result: string) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

const absBN = (first: string, second: string | BN): number => {
  if (typeof second !== "string") second = second.toString();

  return Math.abs(
    Number(new BigNumber(first).minus(new BigNumber(second)).toFixed())
  );
};

const advanceTimeAndBlock = async (time: number) => {
  await advanceTime(time);
  await advanceBlock();
  return Promise.resolve(web3.eth.getBlock("latest"));
};

export default {
  absBN,
  advanceTimeAndBlock,
  takeSnapshot,
  revertToSnapShot,
  catchRevert: async function (promise: Promise<any>) {
    await tryCatch(promise, "revert");
  },
  catchOutOfGas: async function (promise: Promise<any>) {
    await tryCatch(promise, "out of gas");
  },
  catchInvalidJump: async function (promise: Promise<any>) {
    await tryCatch(promise, "invalid JUMP");
  },
  catchInvalidOpcode: async function (promise: Promise<any>) {
    await tryCatch(promise, "invalid opcode");
  },
  catchStackOverflow: async function (promise: Promise<any>) {
    await tryCatch(promise, "stack overflow");
  },
  catchStackUnderflow: async function (promise: Promise<any>) {
    await tryCatch(promise, "stack underflow");
  },
  catchStaticStateChange: async function (promise: Promise<any>) {
    await tryCatch(promise, "static state change");
  },
};
