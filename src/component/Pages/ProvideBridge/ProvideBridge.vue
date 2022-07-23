<template>
  <PageFrame>
    <div class="grid grid-cols-5 gap-4 gap-x-10 grid-rows-[auto_1fr] h-full">
      <MyChallenges></MyChallenges>
      <div class="flex">
        <div>
          <div>from</div>
          <SelectElementSpan
            :data="data.networks"
            v-model:actualValue="fromNetwork"
          ></SelectElementSpan>
        </div>
        <div>
          <div>to</div>
          <SelectElementSpan
            :data="data.networks"
            v-model:actualValue="fromNetwork"
          ></SelectElementSpan>
        </div>
        <div>
          <div>token</div>
          <SelectElementSpan
            :data="data.networks"
            v-model:actualValue="fromNetwork"
          ></SelectElementSpan>
        </div>
      </div>
      <div class="bg-red-500 col-span-2 rounded-lg p-3">a</div>
    </div>
  </PageFrame>
</template>
<script setup lang="ts">
import { ref } from "vue";
import PageFrame from "../PageFrame.vue";
import MyChallenges from "./MyChallenges.vue/MyChallenges.vue";
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
