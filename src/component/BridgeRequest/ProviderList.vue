<template>
  <div
    class="flex flex-col font-mono text-white mt-8 gap-3"
  >
    <template v-for="provider in data[0]">
      <div
        class="grid grid-cols-2 text-xs relative rounded-lg justify-items-center p-3 gap-y-1.5 bg-zinc-800 cursor-pointer"
        @click="
        $emit('providerChosen', provider.address);
        $emit('close')"
      >
        <div
          class="col-span-2 px-5 p-1 bg-black rounded-full border  border-teal-300 text-white mb-2"
        >
          {{ provider.address }}
        </div>
        <div class="pl-3 w-full">
          <div class="grid grid-cols-2">
            <div class="">Total Locked:</div>
            <div class="pl-2">{{ provider.totalLocked }} {{token}}</div>
            <div class="">Fees:</div>
            <div class="pl-2">{{ provider.fee }}%</div>
          </div>
        </div>
        <div class="pl-3 w-full">
          <div class="grid grid-cols-2 ">
            <div class="">Reactivity :</div>
            <div class="pl-2">{{ provider.reactivity }}m</div>
            <div class="">Success Rate:</div>
            <div class="pl-2">{{ provider.successRate }}%</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { trimAddress } from "../../composition/functions"


const props = defineProps<{
  from: string;
  to: string;
  token: string;
  amount: number;
}>();

const data = [
  [
    {
      address: "0xed12...47bfe",
      totalLocked: 1000,
      fee: 2,
      reactivity: 1,
      successRate: 98,
    },
    {
      address: "0x14f7...ae34fe",
      totalLocked: 500,
      fee: 3,
      reactivity: 3,
      successRate: 96,
    },
  ],
];
</script>