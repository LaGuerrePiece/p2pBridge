import BigNumber from "bignumber.js";
import { useLockStore } from ".";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { bnToNumber } from "../../composition/functions";
import { useBridgesStore } from "../bridges";

/**
 * @notice - Used to add a lock to the lock store
 * @param { Object } this - Binded lock store
 * @param { Object } lock - The lock object needing to be parsed before being added
 * @param { number } chainId - The id of the chain where the lock was made
 */
export function addLock(
  this: ReturnType<typeof useLockStore>,
  lock: Awaited<ReturnType<BridgeDexInstance["getMyLocks"]>>[0],
  tokenName: string,
  chainId: number,
): void {
  if (!(chainId in this.$state)) this.$state[chainId] = {};
  if (!(tokenName in this.$state[chainId])) this.$state[chainId][tokenName] = [];

  this.$state[chainId][tokenName].push({
    amount: bnToNumber(lock.amount, true),
    accepted: bnToNumber(lock.accepted),
    nonce: bnToNumber(lock.nonce),
    acceptedChains: lock.acceptedChains.map(bn => bnToNumber(bn)),
    token: lock.token,
    owner: lock.owner,
    fees: bnToNumber(lock.fees),
  });
}