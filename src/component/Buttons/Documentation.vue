<template>
  <div
    class="flex h-10 hover:bg-secondary items-center p-0.5 lg:p-1 border  border-primary rounded-lg cursor-pointer"
  >
    <div class="rounded-full pl-1">
      <img :src="documentation" alt="" class="w-7 h-7"/>
    </div>
    <div
      class="px-3 flex grow justify-center font-mono font-bold text-xs text-white"
    >
    Docs
    </div>
  </div>
</template>
<script setup lang="ts">
import { documentation } from '../../asset/images/images';
</script>