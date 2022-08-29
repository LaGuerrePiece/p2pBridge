<template>
  <div @click="faucet"
    class="btn flex h-10 hover:bg-secondary items-center p-0.5 lg:p-1 border border-primary rounded-lg cursor-pointer"
  >
    <div class="rounded-full pl-1 hidden sm:flex">
      <img :src="radioactive" alt="" class="w-7 h-7"/>
    </div>
    <div
      class="px-2 flex grow justify-center font-mono font-bold text-xs text-white"
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
import { radioactive, } from "../../asset/images/images";



const web3Store = useWeb3Store();

async function faucet(){
    if (!web3Store.connected) return
    const bridgeStore = useBridgesStore()
    const faucetContract = new web3Store.web3!.eth.Contract(
      nuclearTokenAbi as AbiItem[],
      chainDetails[web3Store.chainId].token["NUKE"].address,
      { from: web3Store.address }) as unknown as Contractify<NuclearTokenInstance, AllEvents>;
  
  faucetContract.methods.faucet().send().on("receipt", async () => {
        try {
          // wasAdded is a boolean. Like any RPC method, an error may be thrown.
          const wasAdded = await web3Store.provider!.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20', 
              options: {
                address: chainDetails[web3Store.chainId].token["NUKE"].address, 
                symbol: "NUKE", 
                decimals: 18, 
              },
            },
          });
          if (wasAdded) {
            console.log('Thanks for your interest!');
          } else {
            console.log('Your loss!');
          }
        } catch (error) {
          console.log(error);
        }
    });
}
</script>