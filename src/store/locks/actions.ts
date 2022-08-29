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
  chainId: number,
  token: string,
  lock: Awaited<ReturnType<BridgeDexInstance["getMyLocks"]>>[0],
): void {
  if (!(chainId in this.$state)) this.$state[chainId] = [];
  this.$state[chainId].push({
    amount: bnToNumber(lock.amount, true),
    chainAId: bnToNumber(lock.chainAId),
    deadline: bnToNumber(lock.deadline),
    lockId: bnToNumber(lock.lockId),
    provider: lock.provider,
    lockId: bnToNumber(lock.provider),
    sender: lock.sender,
    tokenBContract: lock.tokenBContract,
  });
}