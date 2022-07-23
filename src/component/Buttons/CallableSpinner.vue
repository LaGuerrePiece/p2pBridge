<template>
  <div
    @click="trigger"
    class="flex relative justify-center items-center w-full h-full transition-all"
    :class="{...$attrs, ...{'cursor-not-allowed':props.disabled, 'cursor-pointer': !props.disabled}}"
  >
    <template v-if="!connecting"><slot></slot></template>
    <template v-else>
      <Spinner
        :primary-class="primary"
        :secondary-class="secondary"
        :class="spinnerClass"
      ></Spinner>
    </template>
  </div>
</template>
<script setup lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { ref } from "vue";
import Spinner from "./Spinner.vue";

const connecting = ref(false);

const props = defineProps<{
  function: Function;
  primary: string;
  spinnerClass: string;
  secondary: string;
  disabled?: boolean;
}>();

async function trigger() {
  if (connecting.value || props.disabled) return;
  connecting.value = true;

  try {
    await props.function()
    connecting.value = false;
  } catch (e: any) {
    connecting.value = false;
    console.log("An error occured during contract call: ", e);
    notify({
      text: "An error occured during contract call, check connection and retry",
      type: "warn",
    });
  }
}
</script>
