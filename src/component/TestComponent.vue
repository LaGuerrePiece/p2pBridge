<template>
  <div
    class="p-10 flex justify-between w-10/12 shadow-lg shadow-black m-auto rounded-lg mt-5"
  >
    <div
      class="h-16 w-44 bg-gray-300 shadow-lg shadow-gray-800 rounded-lg flex items-center justify-center"
      data-testid="counter"
    >
      Counter value : {{ testStore.test }}
    </div>
    <div
      class="h-16 w-44 bg-gray-300 shadow-lg shadow-gray-800 rounded-lg flex items-center justify-center"
      data-testid="getter"
    >
      Getter value : {{ testStore[TestGetters.Test] }}
    </div>
    <div
        @click="testStore[TestActions.Increment]"
      class="cursor-pointer h-16 w-24 bg-gray-600 shadow-lg shadow-black rounded-lg flex items-center justify-center active:shadow-none hover:shadow-black/50 transition-all"
      data-testid="increment"

    >
      + (increment)
    </div>
  </div>
</template>
<script setup lang="ts">
import { useTestStore } from "../store/test";
import { TestActions, TestGetters } from "../types/test";
const testStore = useTestStore();
</script>
