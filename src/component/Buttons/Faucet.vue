<template>
  <div @click="faucet"
    class="flex h-10 hover:bg-secondary items-center p-0.5 lg:p-1 border  border-primary rounded-lg cursor-pointer"
  >
    <div class="rounded-full pl-1">
    </div>
    <div
      class="px-3 flex grow justify-center font-mono font-bold text-xs text-white"
    >
    Faucet
    </div>
  </div>
</template>
<script setup lang="ts">

import { onMounted, ref, watch } from "vue";
import { useWeb3Store } from "../../store/web3";

import { chainDetails } from "../../composition/constants"
import { AllEvents } from "../../../types/truffle-contracts/ERC20";
import { Contractify, Web3ify } from "../../types/commons";
import { useBridgesStore } from "../../store/bridges";

import nuclearTokenAbi from "../../abis/nuclearTokenAbi.json"
import { NuclearTokenInstance } from "../../../types/truffle-contracts";


const web3Store = useWeb3Store();

async function faucet(){
    if (!web3Store.connected) return
    const bridgeStore = useBridgesStore()
    const faucetContract = new bridgeStore[web3Store.chainId].web3.eth.Contract(
      nuclearTokenAbi as AbiItem[],
      chainDetails[web3Store.chainId].token["NUKE"].address,
      { from: web3Store.address }) as unknown as Contractify<NuclearTokenInstance, AllEvents>;
  
  faucetContract.methods.faucet().send().on("receipt", async () => {
        window.alert('Received NUKE tokens !')
    });
  
}
</script>