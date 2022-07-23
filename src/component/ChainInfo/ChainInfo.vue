<template>
  <div
    @click="expandSpan = !expandSpan"
    class="flex items-center rounded-full bg-slate-400 shadow-md shadow-white/20 p-0.5 lg:p-2 cursor-pointer hover:shadow-xl hover:shadow-black transition-all active:shadow-none bg-gradient-to-r from-transparent via-transparent to-black/30 mr-3"
    v-if="web3Store.chainId"
  >
    <div class="rounded-full w-5">
      <img
        :src="
          web3Store.chainId in web3Store.config.chains
            ? icons[
                web3Store.config.chains[web3Store.chainId].chainName
              ]
            : icons.Unknown
        "
        alt=""
      />
    </div>
    <div
      class="px-3 flex grow justify-center font-mono font-bold text-xs text-white"
    >
      {{
        web3Store.chainId in web3Store.config.chains
          ? web3Store.config.chains[web3Store.chainId].chainName
          : "Unknown chain"
      }}
    </div>
  </div>
  <template
    v-for="(chain, key, index) in removeCurrentChainFromList(
      web3Store.config.chains
    )"
    :key="index"
  >
    <div
      class="absolute flex items-center grow rounded-full bg-slate-400 shadow-md shadow-white/20 p-0.5 lg:p-2 cursor-pointer hover:shadow-xl hover:shadow-black transition-all active:shadow-none bg-gradient-to-r from-transparent via-transparent to-black/30 mr-3"
      :class="expandSpan ? 'opacity-1 z-20' : 'opacity-0 top-0 z-10'"
      :style="{ top: expandSpan ? (index + 1) * 30 + 35 + 'px' : '' }"
      @click.capture="
        web3Store[Web3Actions.SwitchChain](Number(key));
        expandSpan = !expandSpan;
      "
    >
      <div class="rounded-full w-5">
        <img :src="icons[chain.chainName]" alt="" class="w-5" />
      </div>
      <div
        class="px-3 flex grow justify-center font-mono font-bold text-xs text-white"
      >
        {{ chain.chainName }}
      </div>
    </div>
  </template>
</template>
<script setup lang="ts">
import {
  ethereum,
  avalanche,
  bsc,
  polygon,
  ganache,
  unknown,
} from "../../asset/images/images";
import { useWeb3Store } from "../../store/web3";
import { Web3Actions, Web3State } from "../../types/web3";
import { ref } from "vue";

const icons: any = {
  Ethereum: ethereum,
  Avalanche: avalanche,
  BSC: bsc,
  Polygon: polygon,
  Ganache: ganache,
  Unknown: unknown,
};
const web3Store = useWeb3Store();
console.log("web3Store.connected", web3Store.connected);

const expandSpan = ref<Boolean>(false);

function removeCurrentChainFromList(
  supportedList: Web3State["config"]["chains"]
) {
  if (!web3Store.chainId) return supportedList;
  let newList = Object.assign({}, supportedList);
  delete newList[web3Store.chainId];
  return newList;
}
</script>
