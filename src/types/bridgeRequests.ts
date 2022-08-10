import {
    ERC20Instance,
    LpFirstHtlcInstance
  } from "../../types/truffle-contracts";
import { Contractify, Web3ify } from "../types/commons";
import { AllEvents } from "../../types/truffle-contracts/ERC20";


export type RequestInfo = {
    fromNetwork: string,
    toNetwork: string,
    token: string,
    amount: number | null,
    provider: string | null
}

export type RequestContracts = {
    originERC20: null | Contractify<ERC20Instance, AllEvents>,
    originBridge: null | Contractify<LpFirstHtlcInstance, AllEvents>,
    destinationERC20: null | Contractify<ERC20Instance, AllEvents>,
    destinationBridge: null | Contractify<LpFirstHtlcInstance, AllEvents>
}