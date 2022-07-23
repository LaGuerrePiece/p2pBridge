<template>
  <div
    @click="web3Store[Web3Actions.Connect]()"
    class="flex items-center rounded-full bg-slate-400 shadow-md shadow-white/20 p-0.5 lg:p-2 cursor-pointer hover:shadow-xl hover:shadow-black transition-all active:shadow-none bg-gradient-to-r from-transparent via-transparent to-black/30"
  >
    <div class="rounded-full">
      <img :src="metamask" alt="" />
    </div>
    <div
      class="px-3 flex grow justify-center font-mono font-bold text-xs text-white"
    >
      {{
        web3Store.connected === true
          ? trimAddress(web3Store.address)
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
