export type ChainAChallenge = {
  bidAmount: number;
  chainId: number;
  otherChain: number;
  nonce: number;
  challengerSignature: string;
  challenger: string;
  token: string;
  accepted: boolean;
};

export type ChainBChallenge = {
  bidAmount: number;
  fee: number;
  bridgerSignature: string;
};

export type challengeState = {
  [key in string]: {
    chainAChallenges: Array<ChainAChallenge>;
    chainBChallenge: ChainBChallenge;
  };
};

export const ChallengeActions = {
  AddChainBChallenge: "AddChainBChallenge",
  AddChainAChallenge: "AddChainAChallenge",
} as const;

export const ChallengeGetters = {
  GetMyChallenges: "GetMyChallenges"
}