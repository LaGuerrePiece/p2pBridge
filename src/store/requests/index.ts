import { defineStore } from "pinia";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { RequestActions, RequestState } from "../../types/requests";
import { addRequest, newRequest } from "./actions";
import { state } from "./state";

export const useRequestStore = defineStore("requests", {
  state: (): RequestState => state,
  getters: {},
  actions: {
    [RequestActions.AddRequest](
      request: Awaited<ReturnType<BridgeDexInstance["getMyRequests"]>>[0],
      chainId: number
    ): void {
      return addRequest.bind(this)(request, chainId);
    },
    async [RequestActions.NewRequest](
      amount: number,
      chainBId: number,
      chainAId: number,
      lockId: number,
      deadline: number,
      tokenBContract: string,
      provider: string
    ): Promise<void> {
      return newRequest.bind(this)(
        amount,
        chainBId,
        chainAId,
        lockId,
        deadline,
        tokenBContract,
        provider
      );
    },
  },
});
