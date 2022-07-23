<template>
  <div class="self-start grid gap-5 lg:col-span-2 w-full row-span-2 order-2 lg:order-none">
    <div class="flex justify-evenly font-mono font-semibold text-white">
      <div>My Requests</div>
      <router-link
      :to="{name: RouteNames.BridgeTokensRequest}"
        class="bg-zinc-800 rounded-full px-3 py-0.5 text-yellow-400 text-xs shadow-md hover:shadow-lg active:text-yellow-500 active:bg-black hover:shadow-zinc-800/80 shadow-zinc-800/50 cursor-pointer transition-all"
      >
        + New Request
      </router-link>
    </div>
    <div
      class="grid gap-2 gap-y-4 grid-cols-5 text-center font-mono text-white xl:text-xs text-[10px]"
    >
      <div
        class="rounded-full bg-zinc-800 xl:px-4 font-bold shadow-black shadow-md py-0.5"
      >
        From
      </div>
      <div
        class="rounded-full bg-zinc-800 xl:px-4 font-bold shadow-black shadow-md py-0.5"
      >
        To
      </div>
      <div
        class="rounded-full bg-zinc-800 xl:px-4 font-bold shadow-black shadow-md py-0.5"
      >
        Token
      </div>
      <div
        class="rounded-full bg-zinc-800 xl:px-4 font-bold shadow-black shadow-md py-0.5"
      >
        Amount
      </div>
      <div
        class="rounded-full bg-zinc-800 xl:px-4 font-bold shadow-black shadow-md py-0.5"
      >
        Fee
      </div>
    <div class="col-span-full grid grid-cols-5 gap-y-4 max-h-[450px] overflow-scroll p-1 pb-3">
        <template v-for="(request, id) in data" :key="id" @click="alert(id)">
          <router-link
            :to="{name: RouteNames.BridgeTokensDisplayRequest, params: {id: id}}"
            :class="Number($route.params.id) == id ? 'ring-2 ring-offset-zinc-800 ring-offset-2 ring-yellow-500': ''"
            class="col-span-full grid gap-2 grid-cols-5 text-center font-mono text-white text-sm justify-items-center items-center shadow-black shadow-md p-1 rounded-full cursor-pointer hover:bg-zinc-600 transition-all duration-75 active:bg-zinc-800"
          >
            <div class="relative w-full flex justify-center items-center">
              <img :src="request.from" alt="" class="w-7 h-7" />
              <div
                class="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
              >
                <svg viewBox="0 0 384 512" class="w-3 -rotate-90">
                  <path
                    fill="#ffffffb7"
                    d="M192 384c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L192 306.8l137.4-137.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-160 160C208.4 380.9 200.2 384 192 384z"
                  />
                </svg>
              </div>
            </div>
            <div><img :src="request.to" alt="" class="w-7 h-7" /></div>
            <div><img :src="request.token" alt="" class="w-7 h-7" /></div>
            <div class="text-xs">{{ request.amount }}</div>
            <div class="text-xs">{{ request.maxFee }}</div>
          </router-link>
        </template>
    </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { RouteNames } from '../../../../router';
import { RouterLink, useRoute } from "vue-router";
import {
  avalanche,
  bsc,
  busd,
  ethereum,
  polygon,
  tether,
  usdc,
} from "../../../../asset/images/images";

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
