<template>
  <TestComponent></TestComponent>
</template>
<script setup lang="ts">
import TestComponent from "./component/TestComponent.vue";
import { Suspense as suspense_, SuspenseProps, VNodeProps } from "vue";

const Suspense = suspense_ as {
  new (): {
    $props: VNodeProps & SuspenseProps;
  };
};
</script>
