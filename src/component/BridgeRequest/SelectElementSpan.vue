<template>
  <div
    @click="expandSpan = !expandSpan"
    class="flex w-28 items-center p-0.5 lg:p-2 border border-white cursor-pointer"
  > 
    <div class="rounded-full w-6 pl-1">
      <img
        :src="icons[actualNetwork]"
        alt=""
      />
    </div>
    <div
      class="px-3 flex grow justify-center font-mono font-bold text-xs text-white w-28"
    >
      {{web3Store.config.chains[actualNetwork].chainName}}

    </div>
    <div
    class="absolute flex flex-col w-36 rounded-lg border items-center bg-black border-white cursor-pointer"
    :class="expandSpan ? 'opacity-1 z-20 top-[90px]' : 'opacity-0 invisible z-10'">
      <template v-for="(chain, key, index) in removeActualChainFromList(
        web3Store.config.chains, actualNetwork
      )" :key="index">
      <div class="flex flex-col">
        <div
        class="h-7 w-36 flex"
          @click.capture="updateActiveElement(key)"
        >
        <div class="rounded-full w-5">
          <img :src="icons[key]" alt="" class="w-5" />
        </div>
        <div class="px-3 flex grow justify-center font-mono font-bold text-xs text-white">
          {{ chain.chainName }}
          </div>
        </div>
      </div>
      <div class="w-1/2 m-auto h-px bg-white/10"></div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useWeb3Store } from "../../store/web3";
import { Web3State } from "../../types/web3";
import {
  avalanche,
  bsc,
  busd,
  cronos,
  ethereum,
  ganache,
  gnosis,
  polygon,
  tether,
  usdc,
} from "../../asset/images/images";

const icons: {[index: number]: any} = {
  1: ethereum,
  56: bsc,
  77: gnosis,
  137: polygon,
  338: cronos,
  1337: ganache,
  43114: avalanche
  // "USDT": tether,
  // "BUSD": busd,
  // "USDC": usdc,
}
const props = defineProps<{
  actualNetwork: number;
}>();

const web3Store = useWeb3Store();

function removeActualChainFromList(
  supportedList: Web3State["config"]["chains"], actualNetwork: number
) {
  let newList = Object.assign({}, supportedList);
  delete newList[actualNetwork];
  return newList;
}

const emits = defineEmits<{
  (e: "update:actualNetwork", element: number): void;
}>();

const expandSpan = ref<Boolean>(false);

function updateActiveElement(element: number) {
  if (!expandSpan.value) return;
  emits("update:actualNetwork", element);
}

</script>
