import { AllEvents as ERC20Events } from "../../types/truffle-contracts/ERC20";
import { AllEvents as BridgeDexEvents } from "../../types/truffle-contracts/BridgeDex";


export type Request = {
  amount: number;
  minBidAmount: number;
  chainAId: number;
  chainANonce: number;
  index: number;
  initialSignature: string;
  tokenAContract: string;
  tokenBContract: string;
  sender: string;
  date: number;
  fees: number;
};

export type Lock = {
  amount: number;
  bridged: number;
  accepted: number;
  challenges: { [key: string]: any };
  token: string;
  owner: string;
  date: number;
  locked: boolean;
  challenged: boolean;
};

type ExractEventName<T extends { name: string }> = T["name"];
type Objectify<T extends { name: string; args: any }> = {
  [key in T["name"]]: Partial<Extract<T, { name: key }>["args"]>;
};

export type Web3ify<T extends { args: any }> = {
  returnValues: T["args"];
  transactionHash: string;
  logIndex: number;
};

export type Contractify<T, U extends ERC20Events | BridgeDexEvents> = {
  methods: {
    [key in keyof T]: T[key] extends (...args: any) => any
      ? (...args: Parameters<T[key]>) => {
          call(args?: Truffle.TransactionDetails): ReturnType<T[key]>;
          send(args?: Truffle.TransactionDetails): any;
        }
      : T[key];
  };
  events: {
    [key in ExractEventName<U>]: (options?: {
      filter?: Objectify<U>[key];
      fromBlock?: number | "latest" | "pending" | "earliest";
    }) => EventEmitter;
  };
};
