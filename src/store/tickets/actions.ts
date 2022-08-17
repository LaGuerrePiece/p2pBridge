import { useTicketStore } from ".";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { bnToNumber } from "../../composition/functions";

/**
 * @notice - Used to push Validated Provider ticket into the state
 *
 * @param {Object} this - The binded ticket store to access the state
 * @param {String} chainId - The Id of the chain where the ticket has been accepted
 * @param {Object} ticket - The ticket to add to the state
 */
export function addTicket(
  this: ReturnType<typeof useTicketStore>,
  chainId: number,
  ticket: Awaited<ReturnType<BridgeDexInstance["getAcceptedTickets"]>>[0]
): void {
  if (!(chainId in this.$state)) this.$state[chainId] = [];
  this.$state[chainId].push({
    amount: bnToNumber(ticket.amount, true),
    bridger: ticket.bridger,
    chainBId: bnToNumber(ticket.chainBId),
    deadline: bnToNumber(ticket.deadline),
    requestId: bnToNumber(ticket.requestId),
    signature: ticket.signature
  });
}
