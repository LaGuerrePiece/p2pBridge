<template>
  <div
    class="lg:col-span-3 grid gap-3 items-center bg-zinc-900 rounded-lg w-full max-w-2xl shadow-lg shadow-zinc-900/50 p-2 bg-gradient-to-tl from-transparent via-transparent to-black h-96"
  >
    <div
      class="justify-self-center rounded-full text-sm font-mono font-bold text-white px-5"
    >
      Request id: {{ props.id }}
    </div>
    <div class="w-1/2 m-auto h-px bg-white/10"></div>
    <div
      class="grid justify-self-center w-full grid-cols-2 gap-y-5 justify-items-center items-center font-mono text-white text-xs"
    >
      <div class="text-left w-20">From :</div>
      <div class="flex w-24 items-center gap-3">
        <img :src="data[Number(props.id)].from" alt="" class="w-6 h-6" />
        <div>{{ data[Number(props.id)].fromName }}</div>
      </div>
      <div class="text-left w-20">To :</div>
      <div class="flex w-24 items-center gap-3">
        <img :src="data[Number(props.id)].to" alt="" class="w-6 h-6" />
        <div>{{ data[Number(props.id)].toName }}</div>
      </div>

      <div class="text-left w-20">Token :</div>
      <div class="flex w-24 justify-start items-center gap-3">
        <img :src="data[Number(props.id)].token" alt="" class="w-6 h-6" />
        <div>{{ data[Number(props.id)].tokenName }}</div>
      </div>

      <div class="w-1/6 m-auto h-px bg-white/10 col-span-2"></div>
      <div class="text-left w-20">Amount :</div>
      <div>
        {{ data[Number(props.id)].amount }}
      </div>
      <div class="text-left w-20">Max fees :</div>
      <div>
        {{ data[Number(props.id)].maxFee }}
      </div>
      <div class="w-1/6 m-auto h-px bg-white/10 col-span-2"></div>
      <div
        class="col-span-2 rounded-full px-2 py-1 bg-zinc-700 w-2/3 sm:w-1/2 lg:w-1/3 text-center text-md bg-gradient-to-br from-white/20 via-transparent to-black/50 shadow-lg hover:shadow-md active:to-transparent active:from-transparent shadow-black cursor-pointer transition-all"
        @click="modalOpen = true"
      >
        Select Challengers
      </div>
      <div
        class="col-span-2 rounded-full px-2 py-1 animate-pulse bg-zinc-700 w-2/3 sm:w-1/2 lg:w-1/3 text-center text-md bg-gradient-to-br from-white/20 via-transparent to-black/50 shadow-lg hover:shadow-md active:to-transparent active:from-transparent shadow-black cursor-pointer transition-all"
        @click="withdrawOpen = true"
      >
        Withdraw Funds
      </div>
    </div>
    <teleport to="body">
      <transition name="fadeMod">
        <ModalFrame v-if="modalOpen" @close="modalOpen = false">
          <template #title>Challengers</template>
          <ChallengersList :id="props.id"></ChallengersList>
        </ModalFrame>
        <ModalFrame v-else-if="withdrawOpen" @close="withdrawOpen = false">
          <template #title>Withdraw</template>
          <WithdrawConfirmation :token="data[0].token" :to="data[0].to" :amount="data[0].amount" ></WithdrawConfirmation>
        </ModalFrame>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import PageFrame from "../PageFrame.vue";

import { ref } from "vue";
import {
  avalanche,
  bsc,
  polygon,
  ethereum,
  usdc,
  busd,
  tether,
} from "../../../../asset/images/images";
import SelectElementSpan from "../../BridgeTokens/BridgeRequest/SelectElementSpan.vue";
import ModalFrame from "../../../Modals/ModalFrame.vue";
import ChallengersList from "./ChallengersList.vue";
import WithdrawConfirmation from "./WithdrawConfirmation.vue";

const props = defineProps<{
  id: string;
}>();

const modalOpen = ref<boolean>(false);
const withdrawOpen = ref<boolean>(false);
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
const amount = ref<number>();
const maxFees = ref<number>();

const data = [
  {
    from: avalanche,
    fromName: "Avalanche",
    to: ethereum,
    toName: "Ethereum",
    token: usdc,
    tokenName: "USDC",
    amount: 27895,
    maxFee: 134,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: polygon,
    fromName: "Polygon",
    to: bsc,
    toName: "BSC",
    token: busd,
    tokenName: "BUSD",
    amount: 3985056,
    maxFee: 24,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: avalanche,
    fromName: "Avalanche",
    to: bsc,
    toName: "BSC",
    token: tether,
    tokenName: "USDT",
    amount: 209585,
    maxFee: 22,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: polygon,
    fromName: "Polygon",
    to: ethereum,
    toName: "Ethereum",
    token: busd,
    tokenName: "BUSD",
    amount: 35095247,
    maxFee: 95,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: avalanche,
    fromName: "Avalanche",
    to: bsc,
    toName: "BSC",
    token: busd,
    tokenName: "BUSD",
    amount: 4385092,
    maxFee: 50,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: polygon,
    fromName: "Polygon",
    to: avalanche,
    toName: "Avalanche",
    token: usdc,
    tokenName: "USDC",
    amount: 2490858,
    maxFee: 59,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: ethereum,
    fromName: "Ethereum",
    to: bsc,
    toName: "BSC",
    token: tether,
    tokenName: "USDT",
    amount: 439085,
    maxFee: 2,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: polygon,
    fromName: "Polygon",
    to: bsc,
    toName: "BSC",
    token: usdc,
    tokenName: "USDC",
    amount: 5096509,
    maxFee: 24,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: avalanche,
    fromName: "Avalanche",
    to: ethereum,
    toName: "Ethereum",
    token: usdc,
    tokenName: "USDC",
    amount: 25593,
    maxFee: 3,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: ethereum,
    fromName: "Ethereum",
    to: bsc,
    toName: "BSC",
    token: busd,
    tokenName: "BUSD",
    amount: 2908509,
    maxFee: 5,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: avalanche,
    fromName: "Polygon",
    to: bsc,
    toName: "BSC",
    token: usdc,
    tokenName: "USDC",
    amount: 9058375,
    maxFee: 45,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: polygon,
    fromName: "Polygon",
    to: ethereum,
    toName: "Ethereum",
    token: busd,
    tokenName: "BUSD",
    amount: 39580,
    maxFee: 5,
    date: Math.floor(Date.now() / 1000),
  },
  {
    from: avalanche,
    fromName: "Polygon",
    to: bsc,
    toName: "BSC",
    token: tether,
    tokenName: "USDT",
    amount: 2498,
    maxFee: 1,
    date: Math.floor(Date.now() / 1000),
  },
];
</script>
