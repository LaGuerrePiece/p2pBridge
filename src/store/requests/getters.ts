import { ChainAChallenge } from "../../types/challenges";
import { RequestState, Request } from "../../types/requests";
import { useChallengeStore } from "../challenges";

/**
 * @notice
 * @param { Object } state - The request state object
 * @returns { Array } - The request well formed to be displayed
 */
export function myRequests(state: RequestState): Array<Request> {
  const keys = Object.keys(state);
  const response: Array<Request> = [];

  keys.forEach((key) => {
    const request = state[key].request;
    const lock = state[key].lock;

    if (!lock || !request) return;

    if (lock && request) {
      if (lock.amount !== request.amount) return;
      response.push(request);
    }
  });
  return response;
}

/**
 * @notice - Used to retrieve the valid challenges for a corresponding request
 * @param { Object } state - Binded request store
 * @param { string } key - key composed of the concatenation of chainAid, lockId, chainBId, chainBNonce
 * @returns { Object } - Array of the corresponding valid challenge request
 */
export function getRequestChallenges(
  state: RequestState
): (key: string) => Array<ChainAChallenge> {
  return (key: string) => {
    const response: Array<ChainAChallenge> = [];
    const challengeStore = useChallengeStore();

    const chainBChallenge = challengeStore.$state[key].chainBChallenge;
    challengeStore.$state[key].chainAChallenges.forEach((challenge) => {
      if (challenge.bidAmount == chainBChallenge.bidAmount)
        response.push(challenge);
    });

    return response;
  };
}
