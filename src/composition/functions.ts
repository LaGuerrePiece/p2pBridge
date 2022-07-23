import BigNumber from "bignumber.js";
import BN from "bn.js";

/**
 * @notice - Returns a trimmed version of an address to fit into the components
 *
 * @param {String} address - The element to trim
 * @returns {String} The trimed representation of the address
 *
 * eg:
 * ```
 * trimaddress("0xaae52138754ea874358731") // -> "0xaae...731"
 *
 * ```
 */
export function trimAddress(address: string): string {
  if (address.length < 10)
    throw new Error(`The string provided is not long enough given: ${address}`);
  let length = address.length;
  let begin = address.slice(0, 5);
  let end = address.slice(length - 3, length);
  return `${begin}...${end}`;
}

/**
 * @notice - used to convert onchain data to numberss
 * @param { BN | string } n - The number to convert (from the on chain data)
 * @param { boolean } d1e18 - Weather to divide the result by 1e18 (for tokens mainly)
 * @returns {number} - The corrected number value from the input
 */
export function bnToNumber(n: BN | string, d1e18?: boolean): number {
  const number = new BigNumber(n.toString());
  return d1e18
    ? Number(number.toFixed())
    : Number(number.dividedToIntegerBy("1e18").toFixed());
}
