import Web3 from "web3";
import { useBridgesStore } from ".";
import { BridgeDexInstance } from "../../../types/truffle-contracts";
import { BridgesActions } from "../../types/bridges";
import { ChallengeActions } from "../../types/challenges";
import { RequestActions, Request } from "../../types/requests";
import { useChallengeStore } from "../challenges";
import { useRequestStore } from "../requests";
import { useWeb3Store } from "../web3";

/**
 * @notice - Used to connect and store the bridge contract on a given chain,
 * and to start the population of the locks and the challenges
 * @param {Object} this - The binded bridge store
 */
export async function connectContract(
  this: ReturnType<typeof useBridgesStore>
): Promise<void> {
  const promises: Array<Promise<any>> = [];

  for (const chainId in CONFIG["chains"]) {
    this.$state[chainId] = {
      contract: new new Web3(CONFIG["chains"][chainId].rpcUrls[0]).eth.Contract(
        CONFIG.abi.BridgeAbi,
        CONFIG["chains"][chainId].bridgeAddress
      ),
    };
    promises.push(this[BridgesActions.PopulateMyChallenges](Number(chainId)));
    promises.push(this[BridgesActions.PopulateMyRequests](Number(chainId)));
  }

  try {
    await Promise.all(promises);
  } catch (e: any) {
    console.log("An error occurend during the contract connection ", e);
  }
}

/**
 * @notice - Used to populate the challenge store with the users challenges
 *
 * @param { Object } this - The binded bridge store
 * @param { number } chainId - The id of the chain where the data is being fetched
 * @returns
 */
export async function populateMyChallenges(
  this: ReturnType<typeof useBridgesStore>,
  chainId: number
): Promise<void> {
  const web3Store = useWeb3Store();
  const challengeStore = useChallengeStore();

  const address = web3Store.$state.address;
  const contract = this.$state[chainId].contract;

  const depositIdsPromise = contract.methods.getMyDepositsIds(address).call();
  const challengesIdsPromise = contract.methods.getMyChallenges(address).call();

  const depositIds = await depositIdsPromise;
  const challengesIds = await challengesIdsPromise;

  const depositsPromise = Promise.all(
    depositIds.map((value) =>
      contract.methods.getDepositDetails(Number(value), address).call()
    )
  );

  const challengesListPromise = Promise.all(
    challengesIds.map((value) =>
      contract.methods.getLockChallenges(Number(value)).call()
    )
  );

  const requestsPromise = Promise.all([
    depositIds.map((value) => contract.methods.idToRequest(value).call()),
  ]);

  const deposits = await depositsPromise;
  const requests = (await requestsPromise) as unknown as Array<
    Omit<Request, "challenge">
  >;
  let challengesList = await challengesListPromise;

  for (const i in challengesList) {
    challengesList[i] = challengesList[i].filter(
      (value) => value.challenger == address
    );
  }

  for (const i in deposits) {
    const request = requests[i];
    const deposit = deposits[i];
    const index = `${Number(request.chainAId)}${Number(
      request.chainANonce
    )}${chainId}${Number(request.chainBNonce)}`;

    if (!Number(request.chainBNonce)) return;

    challengeStore[ChallengeActions.AddChainBChallenge](index, deposit);
  }

  for (const i in challengesIds) {
    const lockId = challengesIds[i];
    const chainAid = chainId;

    challengesList[i].forEach((value) => {
      const nonce = Number(value.nonce);
      const chainBId = Number(value.otherChain);

      if (!nonce) return;

      const index = `${chainAid}${lockId}${chainBId}${nonce}`;
      challengeStore[ChallengeActions.AddChainAChallenge](
        index,
        chainAid,
        value
      );
    });
  }
}

/**
 * @notice - Used to populate the user requests, both locks and requests are populated for data continuity
 * @param { Object } this - The binded bridge store
 * @param { number } chainId
 */
export async function populateMyRequests(
  this: ReturnType<typeof useBridgesStore>,
  chainId: number
): Promise<void> {
  const web3store = useWeb3Store();
  const requestStore = useRequestStore();

  const address = web3store.address;
  const contract = this.$state[chainId].contract;

  const [locksIds, requestIds] = await Promise.all([
    contract.methods.getMyLocks(address).call(),
    contract.methods.getMyRequests(address).call(),
  ]);

  const [locks, requests]: [
    Array<Awaited<ReturnType<BridgeDexInstance["idToLock"]>>>,
    Array<Awaited<ReturnType<BridgeDexInstance["idToRequest"]>>>
  ] = await Promise.all([
    Promise.all(
      locksIds.map((value) => contract.methods.idToLock(Number(value)).call())
    ),
    Promise.all(
      requestIds.map((value) =>
        contract.methods.idToRequest(Number(value)).call()
      )
    ),
  ]);

  locks.forEach((lock, index: number) => {
    if (!Number(lock[0])) return;

    requestStore[RequestActions.AddLock](
      lock,
      chainId,
      Number(locksIds[index])
    );
  });

  requests.forEach((request) => {
    if (!Number(request[0])) return;

    requestStore[RequestActions.AddRequest](request, chainId);
  });
}
