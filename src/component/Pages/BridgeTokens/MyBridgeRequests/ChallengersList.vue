<template>
  <div
    class="grid sm:grid-cols-2 gap-y-5 items-center justify-evenly text-white justify-items-center mt-4 font-mono text-xs"
  >
    <div
      class="flex justify-center gap-4 rounded-full p-1 px-3 bg-stone-600 shadow-lg shadow-black/50 bg-gradient-to-r from-transparent via-transparent to-black/20 w-44 min-w-fit cursor-default"
    >
      <div>Requested:</div>
      <div>&nbsp;10000</div>
    </div>
    <div
      class="flex justify-center gap-4 rounded-full p-1 px-3 bg-stone-600 shadow-lg shadow-black/50 bg-gradient-to-r from-transparent via-transparent to-black/20 w-44 min-w-fit cursor-default"
    >
      <div>Selected:</div>
      <div>&nbsp;0</div>
    </div>
  </div>
  <div
    class="grid lg:grid-cols-3 xs:grid-cols-2 grid-cols-1 items-center font-mono text-white mt-8 gap-3"
  >
    <div
      class="col-span-full text-stone-200/70 justify-self-center text-[10px]"
    >
      (click to select offer)
    </div>
    <template v-for="(element, id) in data[0]">
      <div
        class="grid grid-cols-2 text-xs relative rounded-lg justify-items-center p-3 gap-y-1.5 shadow-md shadow-black bg-gradient-to-tl from-white/10 via-transparent to-black/10 active:bg-stone-700 transition-all cursor-pointer"
        :class="
          selectedIds.includes(id)
            ? 'bg-stone-600'
            : 'hover:bg-stone-600 bg-stone-500'
        "
        @click="
          selectedIds.includes(id)
            ? selectedIds.splice(
                selectedIds.findIndex((value) => value == id),
                1
              )
            : selectedIds.push(id)
        "
      >
        <img
          :src="tick"
          alt=""
          class="w-5 h-5 absolute top-4 right-4 animate-[appear_300ms]"
          v-if="selectedIds.includes(id)"
        />
        <div
          class="col-span-2 px-5 p-1 bg-stone-600 rounded-full outline outline-1 outline-white/80 bg-gradient-to-br from-transparent to-white/20 shadow-md shadow-black mb-4"
        >
          Offer: {{ id }}
        </div>
        <div class="w-1/2 self-start">Amount:</div>
        <div>{{ element.amount }}</div>
        <div class="w-1/2 self-start">Fees:</div>
        <div>{{ element.fee }}</div>
        <div class="w-1/2 self-start">From:</div>
        <div>{{ element.from }}</div>
        <div class="w-1/2 self-start">Points:</div>
        <div>{{ 245 }}</div>
      </div>
    </template>
    <div
      class="text-white justify-self-center col-span-full px-8 p-0.5 mt-2 rounded-full bg-stone-600 bg-gradient-to-r from-transparent via-transparent to-black/20 shadow-black shadow-lg -translate-y-1 text-md cursor-pointer transition-all hover:bg-stone-700 active:bg-stone-800 active:translate-y-0 active:shadow-none"
    >
      Submit
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { tick } from "../../../../asset/images/images";

const props = defineProps<{
  id: string;
}>();

const selectedIds = reactive<number[]>([]);

const data = [
  [
    {
      amount: 1000,
      fee: 3,
      from: "0xed12...47bfe"
    },
  ],
];
</script>
