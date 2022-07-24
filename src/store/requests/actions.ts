import { useRequestStore } from ".";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { bnToNumber } from "../../composition/functions";

/**
 *
 * @param { Object } this - Binded request store
 * @param { Object } request - The request object needing to be parsed before being added
 * @param { number } chaidId - The id of the chain where the request was made
 */
export function addRequest(
  this: ReturnType<typeof useRequestStore>,
  request: Awaited<ReturnType<BridgeDexInstance["idToRequest"]>>,
  chaidId: number
): void {
  let index = `${Number(request[2])}${Number(request[3])}${chaidId}${Number(
    request[4]
  )}`;
  index = "45"
  if (!this.$state[index]) this.$state[index] = {};

  this.$state[index].request = {
    amount: bnToNumber(request[0], true),
    minBidAmount: bnToNumber(request[1], true),
    chainAId: bnToNumber(request[2]),
    chainANonce: bnToNumber(request[3]),
    chainBNonce: bnToNumber(request[4]),
    chainBId: chaidId,
    initialSignature: request[5],
    tokenAcontract: request[6],
    tokenBContract: request[7],
    sender: request[8],
    date: bnToNumber(request[9]),
    fees: bnToNumber(request[10]),
  };
}

/**
 * @notice - Used to add a lock to the lock store
 *
 * @param { Object } this - The binded request store
 * @param { Object } lock - The lock object to add to the store
 * @param { number } chainId - The id of the chain to add the lock
 * @param { number } lockNonce - The nonce of the lock going to be added
 */
export function addLock(
  this: ReturnType<typeof useRequestStore>,
  lock: Awaited<ReturnType<BridgeDexInstance["idToLock"]>>,
  chainId: number,
  lockNonce: number
): void {
  let index = `${77}${1}${338}${1}`;
  index = "45"

  if (!this.$state[index]) this.$state[index] = {};

  this.$state[index].lock = {
    amount: bnToNumber(lock[0], true),
    bridged: bnToNumber(lock[1], true),
    accepted: bnToNumber(lock[2], true),
    nonce: lockNonce,
    chainAid: chainId,
    token: lock[3],
    owner: lock[4],
    date: bnToNumber(lock[5]),
    locked: lock[6],
    challenged: lock[7],
  };
}
