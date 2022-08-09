import { Contract } from "web3-eth-contract";
import { BridgeDexInstance } from "../../types/truffle-contracts";
import { AllEvents as BridgeDexEvents } from "../../types/truffle-contracts/BridgeDex";
import { Contractify } from "./commons";

export type BridgesState = {
  [chain: string]: {
    web3: Web3,
    contract:  Contractify<BridgeDexInstance, BridgeDexEvents>;
  };
};

export const BridgesActions = {
  ConnectContract: "ConnectContract",
  PopulateMyRequests: "PopulateMyRequests",
  PopulateMyChallenges: "PopulateMyChallenges"
} as const;
