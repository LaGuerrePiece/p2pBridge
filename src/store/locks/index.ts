import { defineStore } from "pinia";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { LockActions, LockState } from "../../types/locks";
import { addLock } from "./actions";
import { state } from "./state";

export const useLockStore = defineStore("locks", {
  state: (): LockState => state,
  getters: {},
  actions: {
    [LockActions.AddLock](
      lock: Awaited<ReturnType<BridgeDexInstance["getMyLocks"]>>[0],
      tokenName: string,
      chainId: number
    ): void {
      return addLock.bind(this)(lock, tokenName, chainId);
    },
  },
});
