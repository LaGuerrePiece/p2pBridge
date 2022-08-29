export type RequestInfo = {
    fromNetwork: string,
    toNetwork: string,
    token: string,
    amount: number | null,
    lp: string | null
    lpLockId: number | null
    amountReceivedEst: number | null
}
