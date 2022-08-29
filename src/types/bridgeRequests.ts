import { Lock } from "../types/locks";

export type RequestInfo = {
    fromNetwork: string,
    toNetwork: string,
    token: string,
    amount: number | null,
    validLocks: Lock[] | null,
    bestLock: Lock | null
    amountReceivedEst: number | null
}
