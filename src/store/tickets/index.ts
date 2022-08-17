import { defineStore } from "pinia";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { ticketState } from "./state";
import { TicketActions, ticketState as TicketState } from "../../types/tickets";
import { addTicket } from "./actions";

export const useTicketStore = defineStore("tickets", {
  state: (): TicketState => ticketState,
  getters: {},
  actions: {
    [TicketActions.AddTicket](
      chainId: number,
      ticket: Awaited<ReturnType<BridgeDexInstance["getAcceptedTickets"]>>[0]
    ): void {
      return addTicket.bind(this)(chainId, ticket);
    },
  },
});
