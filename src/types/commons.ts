import { AllEvents as ERC20Events } from "../../types/truffle-contracts/ERC20";
import { AllEvents as BridgeDexEvents } from "../../types/truffle-contracts/BridgeDex";

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
