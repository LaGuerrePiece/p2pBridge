import { useTestStore } from ".";

/**
 * @notice Increments the counter
 */
export function increment(this: ReturnType<typeof useTestStore>): void {
  this.$state.test += 1;
}
