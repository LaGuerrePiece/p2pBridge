import { BridgeDexInstance } from "../../types/truffle-contracts";
import { AllEvents as BridgeDexEvents } from "../../types/truffle-contracts/BridgeDex";
import { Contractify } from "./commons";

export type BridgesState = {
  [chain: number]: {
    contract:  Contractify<BridgeDexInstance, BridgeDexEvents>;
  };
};

export const BridgesActions = {
  ConnectContract: "ConnectContract",
  PopulateMyRequests: "PopulateMyRequests",
  PopulateMyTickets: "PopulateMyTickets"
} as const;
