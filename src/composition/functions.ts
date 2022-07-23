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
