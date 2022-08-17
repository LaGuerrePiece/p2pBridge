export type ProviderTicket = {
  amount: number;
  chainBId: number;
  requestId: number;
  deadline: number;
  signature: string;
  bridger: string;
};

export type ticketState = {
  [key in string]: ProviderTicket[];
};

export const TicketActions = {
  AddTicket: "AddTicket",
} as const;
