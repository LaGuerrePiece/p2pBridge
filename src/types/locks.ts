export type Lock = {
    amount: number;
    accepted: number,
    nonce: number;
    lockId: number;
    acceptedChains: number[];
    token: string;
    owner: string;
    fees: string;
};

// chainId => tokenContrat => Lock[]
export type LockState = {
    [key in string]: {
        [key in string]: Lock[];
    }
};

export const LockActions = {
    AddLock: "AddLock",
} as const;