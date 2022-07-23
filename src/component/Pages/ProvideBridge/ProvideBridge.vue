<template>
  <PageFrame>
    <div class="grid grid-cols-5 gap-x-10 gap-y-4 lg:grid-rows-[auto_1fr] h-full">
      <MyChallenges></MyChallenges>
      <div class="lg:hidden col-span-full flex justify-center">
        <Documentation></Documentation>
      </div>
      <div
        class="flex flex-wrap lg:col-span-2 col-span-full justify-evenly text-white/80 text-xs gap-y-3 gap-x-1 bg-zinc-900 bg-gradient-to-br from-black/10 via-transparent to-transparent p-3 rounded-lg mt-3 shadow-lg shadow-black/50"
      >
        <div
          class="flex w-5/12 min-w-[200px] px-3 justify-between items-center border border-white/20 p-1 rounded-full shadow-lg shadow-black/50"
        >
          <div>From</div>
          <SelectElementSpan
            class="w-28"
            :data="data.networks"
            v-model:actualValue="fromNetwork"
          ></SelectElementSpan>
        </div>
        <div
          class="flex w-5/12 min-w-[200px] px-3 justify-between items-center border border-white/20 p-1 rounded-full shadow-lg shadow-black/50"
        >
          <div>To</div>
          <SelectElementSpan
            class="w-28"
            :data="data.networks"
            v-model:actualValue="toNetwork"
          ></SelectElementSpan>
        </div>
        <div
          class="flex w-5/12 min-w-[200px] px-3 justify-between items-center border border-white/20 p-1 rounded-full shadow-lg shadow-black/50"
        >
          <div>Token</div>
          <SelectElementSpan
            class="w-28"
            :data="data.tokens"
            v-model:actualValue="token"
          ></SelectElementSpan>
        </div>
      </div>
      <div class="col-span-2 rounded-lg p-3">a</div>
    </div>
  </PageFrame>
</template>
<script setup lang="ts">
import { ref } from "vue";
import PageFrame from "../PageFrame.vue";
import MyChallenges from "./MyChallenges/MyChallenges.vue";
import SelectElementSpan from "../BridgeTokens/BridgeRequest/SelectElementSpan.vue";
import {
  avalanche,
  bsc,
  busd,
  ethereum,
  polygon,
  tether,
  usdc,
} from "../../../asset/images/images";
import Documentation from "../../Buttons/Documentation.vue";

const fromNetwork = ref<{ name: string; icon: any }>({
  name: "Select",
  icon: avalanche,
});
const toNetwork = ref<{ name: string; icon: any }>({
  name: "Select",
  icon: avalanche,
});
const token = ref<{ name: string; icon: any }>({
  name: "Select",
  icon: avalanche,
});

const data = {
  networks: [
    {
      name: "Avalanche",
      icon: avalanche,
    },
    {
      name: "BSC",
      icon: bsc,
    },
    {
      name: "Polygon",
      icon: polygon,
    },
    {
      name: "Ethereum",
      icon: ethereum,
    },
  ],
  tokens: [
    {
      name: "USDT",
      icon: tether,
    },
    {
      name: "BUSD",
      icon: busd,
    },
    {
      name: "USDC",
      icon: usdc,
    },
  ],
};
</script>
