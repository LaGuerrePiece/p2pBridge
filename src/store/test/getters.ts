import { TestState } from "../../types/test";

/**
 * @notice used to get twice the state counter
 */
export function twiceCounter(state: TestState): number {
  return state.test * 2;
}
