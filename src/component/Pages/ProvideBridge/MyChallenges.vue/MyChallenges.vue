<template>
  <div
    class="lg:col-span-3 col-span-full row-span-2 rounded-lg font-mono text-white text-xs flex flex-col items-center text-center lg:p-2"
  >
    <div
      class="grow grid lg:grid-cols-6 grid-cols-5 gap-2 auto-rows-min justify-items-center items-center w-full max-w-2xl rounded-lg bg-zinc-900 shadow-lg shadow-zinc-900/50 lg:p-2 p-0.5 bg-gradient-to-tl from-transparent via-transparent to-black h-96"
    >
      <div class="col-span-full p-2 font-semibold text-base">My Challenges</div>
      <div class="h-px w-1/2 bg-white/20 col-span-full"></div>

      <div
        class="p-0.5 bg-zinc-700 rounded-full w-full text-center font-semibold bg-gradient-to-tl from-transparent via-transparent to-black/50 shadow-black shadow-md lg:text-xs text-[10px]"
      >
        From
      </div>
      <div
        class="p-0.5 bg-zinc-700 rounded-full w-full text-center font-semibold bg-gradient-to-tl from-transparent via-transparent to-black/50 shadow-black shadow-md lg:text-xs text-[10px]"
      >
        To
      </div>
      <div
        class="p-0.5 bg-zinc-700 rounded-full w-full text-center font-semibold bg-gradient-to-tl from-transparent via-transparent to-black/50 shadow-black shadow-md lg:text-xs text-[10px]"
      >
        Token
      </div>
      <div
        class="p-0.5 bg-zinc-700 rounded-full w-full text-center font-semibold bg-gradient-to-tl from-transparent via-transparent to-black/50 shadow-black shadow-md lg:text-xs text-[10px]"
      >
        Amount
      </div>
      <div
        class="hidden lg:block p-0.5 bg-zinc-700 rounded-full w-full text-center font-semibold bg-gradient-to-tl from-transparent via-transparent to-black/50 shadow-black shadow-md lg:text-xs text-[10px]"
      >
        Fee
      </div>
      <div
        class="p-0.5 bg-zinc-700 rounded-full w-full text-center font-semibold bg-gradient-to-tl from-transparent via-transparent to-black/50 shadow-black shadow-md lg:text-xs text-[10px]"
      >
        Status
      </div>
      <div
        class="col-span-full w-full lg:max-h-[320px] max-h-[280px] grid gap-2 overflow-y-scroll py-2"
      >
        <template v-for="challenge in data">
          <div
            class="col-span-full w-full h-full grid gap-2 lg:grid-cols-6 grid-cols-5 text-center font-mono text-white text-sm justify-items-center items-center shadow-black shadow-md p-1 rounded-full cursor-pointer hover:bg-neutral-800 transition-all duration-75 active:bg-neutral-900"
          >
            <div class="relative w-full flex justify-center items-center">
              <img :src="challenge.from" alt="" class="w-7 h-7" />
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
            <div><img :src="challenge.to" alt="" class="w-7 h-7" /></div>
            <div><img :src="challenge.token" alt="" class="w-7 h-7" /></div>
            <div class="text-[10px]">{{ challenge.amount }}</div>
            <div class="text-xs hidden lg:block">{{ challenge.fee }}</div>
            <div
              :class="{
                'outline outline-1 outline-zinc-900/50 bg-gradient-to-t to-white/10 via-transparent from-transparent hover:bg-black/50 active:bg-black shadow-sm shadow-black':
                  challenge.status.toLocaleLowerCase() !== 'pending',
              }"
              class="text-[10px] relative rounded-full w-full py-0.5 transition-all"
            >
              {{ challenge.status }}

              <div
                v-if="challenge.status.toLocaleLowerCase() !== 'pending'"
                :class="
                  challenge.status.toLocaleLowerCase() === 'withdraw'
                    ? 'bg-emerald-500'
                    : 'bg-amber-700'
                "
                class="absolute h-2 w-2 rounded-full top-0 right-0 translate-x-0.5 -translate-y-0.5"
              ></div>
              <div
                v-if="challenge.status.toLocaleLowerCase() !== 'pending'"
                :class="
                  challenge.status.toLocaleLowerCase() === 'withdraw'
                    ? 'bg-emerald-500'
                    : 'bg-amber-700'
                "
                class="absolute h-2 w-2 rounded-full top-0 right-0 translate-x-0.5 -translate-y-0.5 animate-ping origin-[25%_75%]"
              ></div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="p-6">
      <Documentation></Documentation>
    </div>
  </div>
</template>
<script setup lang="ts">
import { avalanche, ethereum, usdc } from "../../../../asset/images/images";
import Documentation from "../../../Buttons/Documentation.vue";

const data = [
  {
    from: ethereum,
    to: avalanche,
    token: usdc,
    amount: 10000,
    fee: 10,
    status: "Pending",
  },
  {
    from: ethereum,
    to: avalanche,
    token: usdc,
    amount: 10000,
    fee: 10,
    status: "Withdraw",
  },
  {
    from: ethereum,
    to: avalanche,
    token: usdc,
    amount: 10000,
    fee: 10,
    status: "Sign",
  },
  {
    from: ethereum,
    to: avalanche,
    token: usdc,
    amount: 10000,
    fee: 10,
    status: "Pending",
  },
  {
    from: ethereum,
    to: avalanche,
    token: usdc,
    amount: 10000,
    fee: 10,
    status: "Pending",
  },
  {
    from: ethereum,
    to: avalanche,
    token: usdc,
    amount: 10000,
    fee: 10,
    status: "Pending",
  },
  {
    from: ethereum,
    to: avalanche,
    token: usdc,
    amount: 10000,
    fee: 10,
    status: "Pending",
  },
  {
    from: ethereum,
    to: avalanche,
    token: usdc,
    amount: 10000,
    fee: 10,
    status: "Pending",
  },
  {
    from: ethereum,
    to: avalanche,
    token: usdc,
    amount: 10000,
    fee: 10,
    status: "Pending",
  },
  {
    from: ethereum,
    to: avalanche,
    token: usdc,
    amount: 10000,
    fee: 10,
    status: "Pending",
  },
];
</script>
