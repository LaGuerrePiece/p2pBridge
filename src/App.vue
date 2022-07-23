<template>
<div class="m-4 grid gap-6">
  <div class="flex">
    <Logo class="grow" />
    <Metamask/>
  </div>
  <Navigation />
  <div class="relative">
    <router-view v-slot="{ Component }: { Component: Object }">
        <transition name="fadeNav">
          <component :is="Component" />
        </transition>
      </router-view>
  </div>
</div>
</template>
<script setup lang="ts">
import { Suspense as suspense_, SuspenseProps, VNodeProps } from "vue";
import Metamask from "./component/Metamask/Metamask.vue";
import Logo from "./component/Logo/Logo.vue";
import Navigation from "./component/Navigation/Navigation.vue";
import { RouterView } from "vue-router";

const Suspense = suspense_ as {
  new (): {
    $props: VNodeProps & SuspenseProps;
  };
};
</script>
