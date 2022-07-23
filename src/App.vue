<template>
  <div class="m-4 grid gap-6">
    <div class="flex">
      <Logo class="grow" />
      <div class="flex items-center shrink-0">
        <div class="p-2 flex justify-end items-center">
          <ChainInfo v-if="web3Store.chainId" />
        </div>
      </div>
      <div class="flex items-center shrink-0">
        <div class="p-2 flex justify-end items-center">
          <Metamask />
        </div>
      </div>
    </div>
    <Navigation />
    <div class="relative flex justify-center">
      <router-view v-slot="{ Component }: { Component: Object }">
        <transition name="fadeNav">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
  <notifications position="bottom right" classes="my-notification" />
</template>
<script setup lang="ts">
import { Suspense as suspense_, SuspenseProps, VNodeProps } from "vue";
import Metamask from "./component/Metamask/Metamask.vue";
import ChainInfo from "./component/ChainInfo/ChainInfo.vue";
import Logo from "./component/Logo/Logo.vue";
import Navigation from "./component/Navigation/Navigation.vue";
import { RouterView } from "vue-router";
import { useBridgesStore } from "./store/bridges";
import { useWeb3Store } from "./store/web3";
import { BridgesActions } from "./types/bridges";
const web3Store = useWeb3Store();

const Suspense = suspense_ as {
  new (): {
    $props: VNodeProps & SuspenseProps;
  };
};
</script>
