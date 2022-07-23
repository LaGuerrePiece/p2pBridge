export type Request = {
  amount: number;
  minBidAmount: number;
  chainAId: number;
  chainANonce: number;
  chainBId: number;
  chainBNonce: number;
  initialSignature: string;
  tokenAcontract: string;
  tokenBContract: string;
  sender: string;
  date: number;
  fees: number;
};

export type Lock = {
  amount: number;
  bridged: number;
  accepted: number;
  chainAid: number;
  nonce: number;
  token: string;
  owner: string;
  date: number;
  locked: boolean;
  challenged: boolean;
};

export type RequestState = {
  [key in string]: {
    request?: Request;
    lock?: Lock;
  };
};

export const RequestActions = {
    AddRequest: "AddRequest",
    AddLock: "AddLock"
} as const  

export const RequestGetters = {
  MyRequests: "MyRequests"
}
