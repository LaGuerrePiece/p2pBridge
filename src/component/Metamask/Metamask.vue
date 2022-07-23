<template>
  <div class="flex items-center shrink-0 absolute right-0 sm:right-5">
    <div class="p-2 flex justify-end items-center">
      <div
        class="flex items-center rounded-full bg-slate-400 shadow-md shadow-white/20 p-0.5 lg:p-2 cursor-pointer hover:shadow-xl hover:shadow-black transition-all active:shadow-none bg-gradient-to-r from-transparent via-transparent to-black/30"
      >
        <div class="rounded-full">
          <img :src="metamask" alt="" />
        </div>
        <div
          class="px-3 flex grow justify-center font-mono font-bold text-xs text-white"
        >
          Connect
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { metamask } from "../../asset/images/images";
</script>
