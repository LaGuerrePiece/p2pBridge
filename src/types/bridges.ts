import { BridgeDexInstance, ERC20Instance } from "../../types/truffle-contracts";
import { AllEvents as BridgeDexEvents } from "../../types/truffle-contracts/BridgeDex";
import { AllEvents as ERC20Events} from "../../types/truffle-contracts/ERC20";
import { Contractify } from "./commons";

export type BridgesState = {
  [chain: number]: {
    contract:  Contractify<BridgeDexInstance, BridgeDexEvents>;
    tokenContracts: {
      [tokenName: string]: Contractify<ERC20Instance, ERC20Events>;
    }
  };
};

export const BridgesActions = {
  ConnectContract: "ConnectContract",
  PopulateMyRequests: "PopulateMyRequests",
  PopulateMyTickets: "PopulateMyTickets"
} as const;
