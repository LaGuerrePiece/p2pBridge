<template>
  <div class="flex justify-start sm:justify-center">
    <div
      class="flex items-center rounded-full bg-zinc-800 shadow-md p-0.5 lg:p-2 shadow-black bg-gradient-to-r from-transparent via-transparent to-white/10"
    >
      <div class="rounded-full">
        <img :src="nuclear" alt="" />
      </div>
      <div class="px-3 flex grow justify-center font-mono font-bold text-white">
        <span class="hidden sm:inline">Welcome to&nbsp;</span>
        Nuclear Bridge
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { nuclear } from "../../asset/images/images";
</script>
