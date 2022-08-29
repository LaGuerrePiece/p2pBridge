<template>
  <div
    @click="expandSpan = !expandSpan"
    class="btn flex w-28 items-center p-0.5 lg:p-2 border  border-primary cursor-pointer"
  > 
    <div class="rounded-full w-6 pl-1">
      <img
        :src="chainDetails[actualNetwork].icon"
        alt=""
      />
    </div>
    <div
      class="px-3 flex grow justify-center font-mono font-bold text-xs text-white w-28"
    >
      {{chainDetails[actualNetwork].name}}

    </div>
    <div
    class="absolute flex flex-col w-36 rounded-lg border items-center bg-neutral  border-primary cursor-pointer"
    :class="expandSpan ? 'opacity-1 z-20 top-[90px]' : 'opacity-0 invisible z-10'">
      <template v-for="(chain, key, index) in removeDisabledChainsFromList(
        chainDetails, actualNetwork
      )" :key="index">
      <div class="flex flex-col">
        <div
        class="h-7 w-36 flex"
          @click.capture="updateActiveElement(key)"
        >
        <div class="rounded-full w-5">
          <img :src="chain.icon" alt="" class="w-5" />
        </div>
        <div class="px-3 flex grow justify-center font-mono font-bold text-xs text-white">
          {{ chain.name }}
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
import { chainDetails } from "../../composition/constants"
import { ChainDetails } from "../../types/constants";

const props = defineProps<{
  actualNetwork: string;
}>();

const web3Store = useWeb3Store();

function removeDisabledChainsFromList(
  supportedList: ChainDetails, actualNetwork: string
) {
  let newList = Object.assign({}, supportedList);
  for (const chainId in newList) {
    if (!newList[chainId].enable) delete newList[chainId]
  }
  delete newList[actualNetwork];
  return newList;
}

const emits = defineEmits<{
  (e: "update:actualNetwork", element: string): void;
}>();

const expandSpan = ref<Boolean>(false);

function updateActiveElement(element: string) {
  if (!expandSpan.value) return;
  emits("update:actualNetwork", element);
}

</script>
