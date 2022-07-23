import { defineStore } from "pinia";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { RequestActions, RequestState } from "../../types/requests";
import { state } from "./state";

export const useRequestStore = defineStore("requests", {
  state: (): RequestState => state,
  getters: {},
  actions: {
    [RequestActions.AddRequest](
      request: Awaited<ReturnType<BridgeDexInstance["idToRequest"]>>,
      chainId: number
    ): void {},
    [RequestActions.AddLock](
      lock: Awaited<ReturnType<BridgeDexInstance["idToLock"]>>,
      chainId: number,
      lockNonce: number
    ): void {},
  },
});
