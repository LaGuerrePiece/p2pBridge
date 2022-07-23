import { useChallengeStore } from ".";
import { ChainAChallenge, challengeState } from "../../types/challenges";
import { useWeb3Store } from "../web3";

/**
 * @notice - Filters the challenges to render only the one belonging to the user
 * @param { Object } state - The binded challenges state
 * @returns { Array } - The list of the challenges belonging to the user
 */
export function getMyChallenges(
  state: challengeState,
): Array<ChainAChallenge> {
  const address = useWeb3Store().address;
  const response: Array<ChainAChallenge> = [];

  Object.keys(state).forEach((value: keyof typeof state) => {
    const chainBchallenge = state[value].chainBChallenge;

    const match = state[value].chainAChallenges.find(
      (value) => value.bidAmount == chainBchallenge.bidAmount
    );

    if (match) response.push(match);
  });
  return response;
}
