import { Contract } from "web3-eth-contract";
import { LpFirstHtlcInstance } from "../../types/truffle-contracts";
import { AllEvents as LpFirstHtlcEvents } from "../../types/truffle-contracts/LpFirstHtlc";
import { Contractify } from "./commons";

export type BridgesState = {
  [chain: string]: {
    web3: Web3,
    contract:  Contractify<LpFirstHtlcInstance, LpFirstHtlcEvents>;
  };
};

export const BridgesActions = {
  ConnectContract: "ConnectContract",
  PopulateMyRequests: "PopulateMyRequests",
  PopulateMyChallenges: "PopulateMyChallenges"
} as const;
