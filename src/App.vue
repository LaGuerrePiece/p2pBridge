<template>
  <div class="m-2 grid gap-6 w-screen">
      <NavBar />
    <div class="relative flex justify-center">
      <BridgeRequest />
    </div>
  </div>
  <!-- <notifications position="bottom right" classes="my-notification" /> -->
</template>
<script setup lang="ts">
import { Suspense as suspense_, SuspenseProps, VNodeProps } from "vue";
import NavBar from "./component/NavBar/NavBar.vue";
import { useWeb3Store } from "./store/web3";
import { Web3Actions } from "./types/web3";
import BridgeRequest from "./component/BridgeRequest/BridgeRequest.vue";
const web3Store = useWeb3Store();
web3Store[Web3Actions.CheckConnection]();

const Suspense = suspense_ as {
  new (): {
    $props: VNodeProps & SuspenseProps;
  };
};
</script>
