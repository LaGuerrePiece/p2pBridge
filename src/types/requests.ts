export type Request = {
  amount: number;
  chainAId: number;
  lockId: number;
  requestId: number;
  tokenBContract: string;
  sender: string;
  provider: string;
  deadline: number;
};
export type RequestState = {
  [key in string]: Request[];
};

export const RequestActions = {
  AddRequest: "AddRequest",
  NewRequest: "NewRequest"
} as const;