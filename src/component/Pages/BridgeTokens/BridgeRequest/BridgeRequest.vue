<template>
  <div
    class="grid gap-3 items-center bg-zinc-900 rounded-lg w-full max-w-2xl shadow-lg shadow-zinc-900/50 p-2 bg-gradient-to-tl from-transparent via-transparent to-black h-96"
  >
    <div
      class="justify-self-center rounded-full text-sm font-mono font-bold text-white px-5"
    >
      Bridge
    </div>
    <div class="w-1/2 m-auto h-px bg-white/10"></div>
    <div
      class="grid justify-self-center w-full grid-cols-2 gap-y-5 justify-items-center items-center font-mono text-white text-xs"
    >
      <div class="text-left w-20">From :</div>

      <SelectElementSpan
        class="w-36"
        :data="data.networks"
        v-model:actualValue="fromNetwork"
      ></SelectElementSpan>
      <div class="text-left w-20">To :</div>

      <SelectElementSpan
        class="w-36"
        :data="data.networks"
        v-model:actualValue="toNetwork"
      ></SelectElementSpan>
      <div class="text-left w-20">Token :</div>

      <SelectElementSpan
        class="w-36"
        :data="data.tokens"
        v-model:actualValue="token"
      ></SelectElementSpan>
      <div class="w-1/6 m-auto h-px bg-white/10 col-span-2"></div>
      <div class="text-left w-20">Amount :</div>
      <div>
        <input
          v-model.number="amount"
          placeholder="Enter amount"
          class="bg-zinc-500 text-center rounded-full px-2 py-0.5 text-xs appearance-none outline-none w-full ring-1 ring-offset-zinc-800 ring-offset-2 ring-yellow-500"
        />
      </div>
      <div class="text-left w-20">Max fees :</div>
      <div>
        <input
          v-model.number="maxFees"
          placeholder="Enter amount"
          class="bg-zinc-500 text-center rounded-full px-2 py-0.5 text-xs appearance-none outline-none w-full ring-1 ring-offset-zinc-800 ring-offset-2 ring-yellow-500"
        />
      </div>
      <div class="w-1/6 m-auto h-px bg-white/10 col-span-2"></div>
      <div
        @click="send"
        class="col-span-2 rounded-full px-2 py-1 bg-zinc-700 w-2/3 sm:w-1/2 lg:w-1/3 text-center text-md bg-gradient-to-br from-white/20 via-transparent to-black/50 shadow-lg hover:shadow-md active:to-transparent active:from-transparent shadow-black cursor-pointer transition-all"
      >
        Send
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BigNumber from "bignumber.js";
import { ref } from "vue";
import {
  BridgeDexInstance,
  ERC20Instance,
} from "../../../../../types/truffle-contracts";
import { AllEvents } from "../../../../../types/truffle-contracts/ERC20";
import {
  avalanche,
  bsc,
  busd,
  celo,
  cronos,
  ethereum,
  ganache,
  gnosis,
  polygon,
  tether,
  usdc,
} from "../../../../asset/images/images";
import { useBridgesStore } from "../../../../store/bridges";
import { useWeb3Store } from "../../../../store/web3";
import { Contractify, Web3ify } from "../../../../types/commons";
import { Web3Actions } from "../../../../types/web3";
import SelectElementSpan from "./SelectElementSpan.vue";

const bridgeStore = useBridgesStore();
const web3Store = useWeb3Store();

const fromNetwork = ref<{ name: string; icon: any; id: number }>({
  name: "Select",
  icon: avalanche,
  id: 0,
});
const toNetwork = ref<{ name: string; icon: any; id: number }>({
  name: "Select",
  icon: avalanche,
  id: 0,
});
const token = ref<{ name: string; icon: any; id: number }>({
  name: "Select",
  icon: avalanche,
  id: 0,
});
const amount = ref<number>();
const maxFees = ref<number>();

const data = {
  networks: [
    {
      name: "Ganache",
      icon: ganache,
      id: 1337,
    },
    {
      name: "Cronos",
      icon: cronos,
      id: 338,
    },
    {
      name: "Gnosis",
      icon: gnosis,
      id: 77,
    },
    {
      name: "Celo",
      icon: celo,
    },
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

async function send() {}
</script>
