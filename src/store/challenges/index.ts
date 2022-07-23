import { defineStore } from "pinia";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import {
  ChainAChallenge,
  ChallengeActions,
  ChallengeGetters,
  challengeState,
} from "../../types/challenges";
import { addChainAChallenge, addChainBChallenge } from "./actions";
import { getMyChallenges } from "./getters";
import { challengestate } from "./state";

export const useChallengeStore = defineStore("challenges", {
  state: (): challengeState => challengestate,
  getters: {
    [ChallengeGetters.GetMyChallenges]: getMyChallenges
  },
  actions: {
    [ChallengeActions.AddChainAChallenge](
      index: string,
      chainId: number,
      challenge: Awaited<ReturnType<BridgeDexInstance["getLockChallenges"]>>[0]
    ): void {
      return addChainAChallenge.bind(this)(index, chainId, challenge);
    },
    [ChallengeActions.AddChainBChallenge](
      index: string,
      challenge: Awaited<ReturnType<BridgeDexInstance["getDepositDetails"]>>
    ): void {
      return addChainBChallenge.bind(this)(index, challenge);
    },
  },
});
