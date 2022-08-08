<template>
  <div
    @click="web3Store[Web3Actions.Connect]()"
    class="flex h-10 items-center hover:bg-secondary p-0.5 lg:p-1 border border-primary rounded-lg cursor-pointer"
  >
    <div class="rounded-full pl-1">
      <img :src="metamask" alt="" />
    </div>
    <div
      class="px-3 flex grow justify-center font-mono font-bold text-xs text-white"
    >
      {{
        web3Store.connected === true
          ? web3Store.ens || trimAddress(web3Store.address)
          : "Connect"
      }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { metamask } from "../../asset/images/images";
import { trimAddress } from "../../composition/functions";
import { useWeb3Store } from "../../store/web3";
import { Web3Actions } from "../../types/web3";


const web3Store = useWeb3Store();
</script>