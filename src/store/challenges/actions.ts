import { useChallengeStore } from ".";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { bnToNumber } from "../../composition/functions";

/**
 * @notice - Used to push a ChainAChallenge at a specific index into the state
 *
 * @param {Object} this - The binded challenge store to access the state
 * @param {String} index - The index that represents the concatenation of ChainAid, ChainANonce, ChainBId, ChainBNonce
 * @param {Object} challenge - The challenge to add to the state
 */
export function addChainAChallenge(
  this: ReturnType<typeof useChallengeStore>,
  index: string,
  chaidId: number,
  challenge: Awaited<ReturnType<BridgeDexInstance["getLockChallenges"]>>[0]
): void {
  // this.$state[index].chainAChallenges.push({
  //   accepted: challenge.accepted,
  //   chainId: chaidId,
  //   bidAmount: bnToNumber(challenge.bidAmount, true),
  //   challenger: challenge.challenger,
  //   challengerSignature: challenge.challengerSignature,
  //   nonce: bnToNumber(challenge.nonce),
  //   otherChain: bnToNumber(challenge.otherChain),
  //   token: challenge.token,
  // });
}

/**
 * @notice - Used to update the chain b challenge for a given index
 *
 * @param { Object } this - The binded Challenge store
 * @param { string } index - The unique identifier of the request
 * @param { Object } challenge - The on chain data of the challenge
 */
export function addChainBChallenge(
  this: ReturnType<typeof useChallengeStore>,
  index: string,
  challenge: Awaited<ReturnType<BridgeDexInstance["getDepositDetails"]>>
): void {
  // this.$state[index].chainBChallenge = {
  //   bidAmount: bnToNumber(challenge.bidAmount, true),
  //   fee: bnToNumber(challenge.fees),
  //   bridgerSignature: challenge.bridgerSignature,
  // };
}
