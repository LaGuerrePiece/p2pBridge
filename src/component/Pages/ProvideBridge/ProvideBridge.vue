<template>
  <PageFrame>
    <div class="grid grid-cols-5 gap-4 gap-x-10 grid-rows-[auto_1fr] h-full">
      <MyChallenges></MyChallenges>
      <div class="bg-red-500 col-span-2 rounded-lg p-3">a</div>
      <div class="bg-red-500 col-span-2 rounded-lg p-3">a</div>
    </div>
  </PageFrame>
</template>
<script setup lang="ts">
import PageFrame from "../PageFrame.vue";
import MyChallenges from "./MyChallenges.vue/MyChallenges.vue";
</script>
