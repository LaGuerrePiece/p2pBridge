import { RequestState, Request } from "../../types/requests";

/**
 * @notice
 * @param { Object } state - The request state object
 * @returns { Array } - The request well formed to be displayed 
 */
export function myRequests(state: RequestState): Array<Request> {
  const keys = Object.keys(state);
  const response: Array<Request> = [];

  keys.forEach((key) => {
    const request = state[key].request
    const lock = state[key].lock

    if (!lock || !request) return;

    if (lock && request) {
        if(lock.amount !== request.amount) return
        response.push(request);
    }
  });
  return response
}
