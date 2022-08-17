import BigNumber from "bignumber.js";
import { useRequestStore } from ".";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { bnToNumber } from "../../composition/functions";
import { useBridgesStore } from "../bridges";

/**
 * @notice - Used to add a request to the request store
 * @param { Object } this - Binded request store
 * @param { Object } request - The request object needing to be parsed before being added
 * @param { number } chainId - The id of the chain where the request was made
 */
export function addRequest(
  this: ReturnType<typeof useRequestStore>,
  request: Awaited<ReturnType<BridgeDexInstance["getMyRequests"]>>[0],
  chainId: number
): void {
  if (!(chainId in this.$state)) this.$state[chainId] = [];
  this.$state[chainId].push({
    amount: bnToNumber(request.amount, true),
    chainAId: bnToNumber(request.chainAId),
    deadline: bnToNumber(request.deadline),
    lockId: bnToNumber(request.lockId),
    provider: request.provider,
    requestId: bnToNumber(request.provider),
    sender: request.sender,
    tokenBContract: request.tokenBContract,
  });
}

/**
 * @notice - Used to submit a new bridge request to the contract
 *
 * @param {number} amount - The amount to lock into the request
 * @param {number} chainBId - The chain where the request will be published
 * @param {number} chainAId - The chain on which the bridger wants to receive the funds
 * @param {number} lockId - The id of the lock of the chain A
 * @param {number} deadline - The time the request will lock the funds
 * @param {string} tokenBContract - The token to send along the request
 * @param {string} provider - The owner of the lock on the chainA
 */
export async function newRequest(
  amount: number,
  chainBId: number,
  chainAId: number,
  lockId: number,
  deadline: number,
  tokenBContract: string,
  provider: string
) {
  const bridgeStore = useBridgesStore();
  await bridgeStore.$state[chainBId].contract.methods
    .publishRequest(
      new BigNumber(amount).multipliedBy("1e18").toFixed(),
      chainAId,
      lockId,
      deadline,
      tokenBContract,
      provider
    )
    .send();
}
