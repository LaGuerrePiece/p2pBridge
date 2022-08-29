import { defineStore } from "pinia";
import { BridgesActions, BridgesState } from "../../types/bridges";
import {
  connectContract,
  populateMyTickets,
  populateMyRequests,
  populateLocks
} from "./actions";
import { state } from "./state";

export const useBridgesStore = defineStore("bridges", {
  state: (): BridgesState => state,
  actions: {
    async [BridgesActions.ConnectContract](): Promise<void> {
      return connectContract.bind(this)();
    },
    async [BridgesActions.PopulateMyTickets](
      chainId: number,
      lockIds: number[]
    ): Promise<void> {
      return populateMyTickets.bind(this)(chainId, lockIds);
    },
    async [BridgesActions.PopulateMyRequests](chainId: number): Promise<void> {
      return populateMyRequests.bind(this)(chainId);
    },
    async [BridgesActions.PopulateLocks](chainId: number): Promise<void> {
      return populateLocks.bind(this)(chainId);
    },
  },
});
