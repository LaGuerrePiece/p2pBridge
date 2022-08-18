<template>
  <div
    @click="expandSpan = !expandSpan"
    class="flex h-10 hover:bg-secondary items-center p-0.5 lg:p-2 border border-primary rounded-lg cursor-pointer"
    v-if="web3Store.chainId"
  >
    <div class="rounded-full w-7 pl-1 hidden sm:flex">
      <img
        :src="
          web3Store.chainId in chainDetails
            ? chainDetails[web3Store.chainId].icon
            : unknownChainIcon
        "
        alt=""
      />
    </div>
    <div
      class="px-3 flex grow justify-center font-mono font-bold text-xs text-white min-w-16"
    >
      {{
        web3Store.chainId in chainDetails
          ? chainDetails[web3Store.chainId].name
          : "Unknown chain"
      }}
    </div>
  </div>
  <template
    v-for="(chain, key, index) in removeDisabledChainsFromList(
      chainDetails
    )"
    :key="index"
  >
    <div
      class="absolute h-7 flex items-center border border-primary cursor-pointer bg-neutral"
      :class="expandSpan ? 'opacity-1 z-20' : 'opacity-0 top-0 z-10'"
      :style="{ top: expandSpan ? (index + 1) * 28 + 28 + 'px' : '' }"
      @click.capture="
        web3Store[Web3Actions.SwitchChain](Number(key));
        expandSpan = !expandSpan;
      "
    >
      <div class="rounded-full w-7 pl-1">
        <img :src="chain.icon" alt="" />
      </div>
      <div
        class="px-3 flex grow justify-center font-mono text-xs"
      >
        {{ chain.name }}
      </div>
    </div>
  </template>
</template>
<script setup lang="ts">
import { unknownChainIcon } from "../../asset/images/images";
import { useWeb3Store } from "../../store/web3";
import { Web3Actions, Web3State } from "../../types/web3";
import { ChainDetails } from "../../types/constants";
import { ref } from "vue";
import { chainDetails } from "../../composition/constants"

const web3Store = useWeb3Store();

const expandSpan = ref<Boolean>(false);

console.log("web3Store.chainId", web3Store.chainId, typeof web3Store.chainId)

function removeDisabledChainsFromList(
  chainDetails: ChainDetails
) {
  let newList = Object.assign({}, chainDetails);
  for (const chainId in newList) {
    if (!newList[chainId].enable) delete newList[chainId]
  }
  if (web3Store.chainId) delete newList[web3Store.chainId];
  return newList;
}
</script>
