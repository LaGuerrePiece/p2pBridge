import { defineStore } from "pinia";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import {
  RequestActions,
  RequestGetters,
  RequestState,
} from "../../types/requests";
import { addLock, addRequest } from "./actions";
import { getRequestChallenges, myRequests } from "./getters";
import { state } from "./state";

export const useRequestStore = defineStore("requests", {
  state: (): RequestState => state,
  getters: {
    [RequestGetters.MyRequests]: myRequests,
    [RequestGetters.RequestChallenges]: getRequestChallenges,
  },
  actions: {
    [RequestActions.AddRequest](
      request: Awaited<ReturnType<BridgeDexInstance["idToRequest"]>>,
      chainId: number
    ): void {
      return addRequest.bind(this)(request, chainId);
    },
    [RequestActions.AddLock](
      lock: Awaited<ReturnType<BridgeDexInstance["idToLock"]>>,
      chainId: number,
      lockNonce: number
    ): void {
      return addLock.bind(this)(lock, chainId, lockNonce);
    },
  },
});
