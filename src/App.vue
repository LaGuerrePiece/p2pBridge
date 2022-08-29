<template>
  <div class="grid gap-9 w-screen">
      <NavBar />
    <div class="flex justify-center">
      <BridgeRequest />
    </div>
  </div>
</template>
<script setup lang="ts">
import NavBar from "./component/NavBar/NavBar.vue";
import { useWeb3Store } from "./store/web3";
import { Web3Actions } from "./types/web3";
import BridgeRequest from "./component/BridgeRequest/BridgeRequest.vue";

const web3Store = useWeb3Store();
web3Store[Web3Actions.CheckConnection]();

</script>