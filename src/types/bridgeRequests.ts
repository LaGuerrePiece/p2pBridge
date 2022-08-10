import {
    ERC20Instance,
    LpFirstHtlcInstance
  } from "../../types/truffle-contracts";
import { Contractify, Web3ify } from "../types/commons";
import { AllEvents } from "../../types/truffle-contracts/ERC20";
import { BridgerAuth } from "../../types/truffle-contracts/LpFirstHtlc";



export type RequestInfo = {
    fromNetwork: string,
    toNetwork: string,
    token: string,
    amount: number | null,
    lp: string | null
    lpLockId: number | null
    amountReceivedEst: number | null
}

export type RequestContracts = {
    originERC20: null | Contractify<ERC20Instance, AllEvents>,
    originBridge: null | Contractify<LpFirstHtlcInstance, BridgerAuth>,
    destinationERC20: null | Contractify<ERC20Instance, AllEvents>,
    destinationBridge: null | Contractify<LpFirstHtlcInstance, BridgerAuth>
}