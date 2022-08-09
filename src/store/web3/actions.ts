import { useWeb3Store } from ".";
import Web3Modal from "web3modal";
import Web3 from "web3";
import { BridgesActions } from "../../types/bridges";
import { useBridgesStore } from "../bridges";
import { ethers } from "ethers";
import { chainDetails } from "../../composition/constants"

/**
 * @notice Function used to check if the user has granted the access
 * to its metamask accounts to the application
 */
 export async function checkConnection(
  this: ReturnType<typeof useWeb3Store>
): Promise<void> {
  try {
    const accounts: Truffle.Accounts = await (window.ethereum as any).request({
      method: "eth_accounts",
    });

    if (accounts.length === 0) return;
    await connect.bind(this)();
  } catch (e: any) {
    console.log("An error occured during the connection checking : ", e);
    return;
  }
}


export async function connect(
  this: ReturnType<typeof useWeb3Store>
): Promise<void> {

  if (this.connected) {
    this.connected = false
    this.provider = null;
    this.web3 = null
    this.chainId = 0;
    this.ens = null;
    return
  }

  const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions: CONFIG.providerOptions,
    theme: "dark",
  });

  const provider = await web3Modal.connect();

  this.provider = provider;
  this.web3 = new Web3(provider);
  this.address = (await this.web3.eth.getAccounts())[0];
  this.chainId = await this.web3.eth.getChainId();

  if (this.chainId === 1) this.ens = await getEns(this.address)

  // if (!(this.chainId in chainDetails)) {
  //   await switchChain(1337); //On unknown chain switch to ganache for user safety
  // }

  const bridgesStore = useBridgesStore();
  await bridgesStore[BridgesActions.ConnectContract]();

  provider.on("accountsChanged", async (accounts: string[]) => {
    this.address = accounts[0];
    this.ens = null
    if (this.chainId === 1) this.ens = await getEns(this.address)
  });

  provider.on("chainChanged", async (chainId: string) => {
    this.chainId = parseInt(chainId);
    if (this.chainId === 1) this.ens = await getEns(this.address)
  });
  this.connected = true;
}

async function addNewChain(chainId: number): Promise<void> {
  const web3Store = useWeb3Store();
  if (!web3Store.provider) return;
  return web3Store.provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: `0x${chainId.toString(16)}`,
        chainName: chainDetails[chainId].name,
        rpcUrls: [chainDetails[chainId].rpcUrls[0]],
      },
    ],
  });
}

async function _switchChain(chainId: number): Promise<void> {
  const web3Store = useWeb3Store();
  if (!web3Store.provider) return;
  return web3Store.provider.request({
    method: "wallet_switchEthereumChain",
    params: [
      {
        chainId: `0x${chainId.toString(16)}`,
      },
    ],
  });
}

export async function switchChain(chainId: number): Promise<void> {
  const web3Store = useWeb3Store();
  try {
    await _switchChain(chainId);
  } catch {
    await addNewChain(chainId);
    await _switchChain(chainId);
  }
}

async function getEns(address: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  return await provider.lookupAddress(address)
}