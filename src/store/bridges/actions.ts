import Web3 from "web3";
import { useBridgesStore } from ".";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { BridgesActions } from "../../types/bridges";
import { TicketActions } from "../../types/tickets";
import { RequestActions, Request } from "../../types/requests";
import { useTicketStore } from "../tickets";
import { useRequestStore } from "../requests";
import { useWeb3Store } from "../web3";
import { bnToNumber } from "../../composition/functions";

/**
 * @notice - Used to connect and store the bridge contract on a given chain,
 * and to start the population of the user requests
 *
 * @param {Object} this - The binded bridge store
 */
export async function connectContract(
  this: ReturnType<typeof useBridgesStore>
): Promise<void> {
  const promises: Array<Promise<any>> = [];
  const requestStore = useRequestStore();
  const web3Store = useWeb3Store();

  for (const chainId in CONFIG["chains"]) {
    const web3 = web3Store.provider!.chainId == Number(chainId)
               ? web3Store.web3!
               : new Web3(CONFIG["chains"][chainId].rpcUrls[0])
    
    const bridgeContract = new web3.eth.Contract(
      CONFIG.abi.BridgeAbi,
      CONFIG["chains"][chainId].bridgeAddress,
      { from: web3Store.address }
    )

    let tokenContract: any = {}

    for (const tokenName in CONFIG["chains"][chainId].tokensAddress) {
      tokenContract[tokenName] = new web3.eth.Contract(
        CONFIG.abi.ERC20Abi,
        CONFIG["chains"][chainId].tokensAddress[tokenName],
        { from: web3Store.address }
      )
    }
    
    this.$state[chainId] = {
      contract: bridgeContract,
      tokenContracts: tokenContract
    };
    promises.push(this[BridgesActions.PopulateMyRequests](Number(chainId)));
  }

  try {
    await Promise.all(promises);
    promises.splice(0, promises.length);
  } catch (e: any) {
    console.log(
      "An error occurend during the contract connection for requests",
      e
    );
    return;
  }

  const lockRequests: { [key in string]: number[] } = {};

  for (const chain in requestStore.$state) {
    requestStore.$state[chain].forEach((request) => {
      if (!(String(request.chainAId) in lockRequests))
        lockRequests[String(request.chainAId)] = [];
      lockRequests[String(request.chainAId)].push(request.lockId);
    });
  }

  for (const chain in lockRequests) {
    promises.push(
      this[BridgesActions.PopulateMyTickets](Number(chain), lockRequests[chain])
    );
  }

  try {
    await Promise.all(promises);
  } catch (e: any) {
    console.log(
      "An error occurend during the contract connection for tickets",
      e
    );
    return;
  }
}

/**
 * @notice - Used to populate the user requests
 * @param { Object } this - The binded bridge store
 * @param { number } chainId - The id of the chain where the requests belong
 */
export async function populateMyRequests(
  this: ReturnType<typeof useBridgesStore>,
  chainId: number
): Promise<void> {
  const web3store = useWeb3Store();
  const requestStore = useRequestStore();

  const address = web3store.address;
  const contract = this.$state[chainId].contract;

  const requests: Awaited<ReturnType<BridgeDexInstance["getMyRequests"]>> =
    await contract.methods.getMyRequests(address).call();

  requests.forEach((request) => {
    requestStore[RequestActions.AddRequest](request, chainId);
  });
}

/**
 * @notice - Used to populate the ticket store with the user validated and ready to withdraw tickets
 *
 * @param { Object } this - The binded bridge store
 * @param { number } chainId - The id of the chain where the tickets are
 * @returns
 */
export async function populateMyTickets(
  this: ReturnType<typeof useBridgesStore>,
  chainId: number,
  lockIds: number[]
): Promise<void> {
  const web3Store = useWeb3Store();
  const ticketStore = useTicketStore();

  const address = web3Store.$state.address;
  const contract = this.$state[chainId].contract;

  const tickets: Awaited<ReturnType<BridgeDexInstance["getAcceptedTickets"]>> =
    await contract.methods.getAcceptedTickets(lockIds, address).call();

  tickets.forEach((ticket) => {
    const amount = bnToNumber(ticket.amount, true);
    if (amount == 0 || ticket.signature != "0x") return;
    ticketStore[TicketActions.AddTicket](chainId, ticket);
  });
}
