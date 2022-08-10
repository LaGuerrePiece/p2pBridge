import { ERC20Instance, LpFirstHtlcInstance } from "../../types/truffle-contracts";
import { AllEvents } from "../../types/truffle-contracts/ERC20";
import { AllEvents as LpFirstHtlcEvents } from "../../types/truffle-contracts/LpFirstHtlc";
import { Contractify } from "./commons";

export type BridgesState = {
  [chain: string]: {
    web3: Web3,
    bridge: Contractify<LpFirstHtlcInstance, LpFirstHtlcEvents>;
    token: {
      [tokenName: string]: Contractify<ERC20Instance, AllEvents>;
    }
  };
};

export const BridgesActions = {
  ConnectContract: "ConnectContract",
  PopulateMyRequests: "PopulateMyRequests",
  PopulateMyChallenges: "PopulateMyChallenges"
} as const;
