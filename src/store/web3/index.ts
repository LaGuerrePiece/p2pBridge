import { defineStore } from "pinia";
import { Web3Actions, Web3State } from "../../types/web3";
import { connect, switchChain } from "./actions";
import { state } from "./state";


export const useWeb3Store = defineStore("web3", {
    state: (): Web3State => state,
    actions: {
        async [Web3Actions.Connect](): Promise<void> {
            return connect.bind(this)();
        },
        async [Web3Actions.SwitchChain](chainId: number): Promise<void> {
            return switchChain.bind(this)(chainId);
        }
    }
})