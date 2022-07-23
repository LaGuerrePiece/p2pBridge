import { RequestState, Request } from "../../types/requests";

export function myRequests(state: RequestState): Array<Request> {
  const keys = Object.keys(state);
  const response: Array<Request> = [];

  keys.forEach((key) => {
    const request = state[key].request
    const lock = state[key].lock

    if (!lock || !request) return;

    if(request) {
        response.push(request)
    }
  });

  return response
}
