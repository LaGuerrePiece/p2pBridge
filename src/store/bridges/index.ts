import { defineStore } from "pinia";
import { BridgesActions, BridgesState } from "../../types/bridges";
import {
  connectContract,
  // populateMyChallenges,
  // populateMyRequests,
} from "./actions";
import { state } from "./state";

export const useBridgesStore = defineStore("bridges", {
  state: (): BridgesState => state,
  actions: {
    async [BridgesActions.ConnectContract](): Promise<void> {
      return connectContract.bind(this)();
    },
    // async [BridgesActions.PopulateMyChallenges](
    //   chainId: number
    // ): Promise<void> {
    //   return populateMyChallenges.bind(this)(chainId);
    // },
    // async [BridgesActions.PopulateMyRequests](chainId: number): Promise<void> {
    //   return populateMyRequests.bind(this)(chainId);
    // },
  },
});
