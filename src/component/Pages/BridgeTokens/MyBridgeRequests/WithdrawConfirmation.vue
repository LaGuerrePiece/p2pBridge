<template>
  <div class="flex justify-center items-center font-mono text-white m-3 text-sm gap-2">
    <span class="whitespace-nowrap">Withdraw {{props.amount}}</span>
    <img :src="props.token" class="w-5 h-5" />
    <span> on</span>
    <img :src="props.to" class="w-5 h-5" />
    <span>?</span>
  </div>
  <PrimaryButton class="mx-auto max-w-xs">
    Confirm
  </PrimaryButton>
</template>
<script setup lang="ts">
import PrimaryButton from "../../../Buttons/PrimaryButton.vue";
const props = defineProps<{
  token: string;
  to: string;
  amount: number;
}>();
console.log(props.token, props.to);
</script>
