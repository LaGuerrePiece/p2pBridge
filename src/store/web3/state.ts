import { Web3State } from "../../types/web3";

export const state: Web3State = {
    address: "",
    web3: null,
    provider: null,
    connected: false,
    chainId: 0,
    ens: null,
};