<template>
  <div
    class="grid sm:grid-cols-2 m-3 md:mt-5 items-center justify-items-center gap-5 text-xs font-mono text-white font-bold"
  >
    <router-link
      :to="{ name: RouteNames.BridgeTokensRequest }"
      class="rounded-full bg-sky-900/20 hover:bg-sky-600/20 transition-all group w-3/4 max-w-4xl flex items-center gap-5 bg-gradient-to-r from-transparent via-transparent to-black/20 shadow-lg shadow-black active:shadow-none cursor-pointer"
      :class="{
        'outline outline-2 outline-offset-4 outline-amber-400': bridgeActive,
      }"
      @click="bridgeActive = true"
    >
      <div class="rounded-full bg-sky-500/20 p-1">
        <img
          :src="bridge2"
          alt=""
          class="w-12 h-12 group-hover:animate-bounce"
        />
      </div>
      <div class="grow text-center text-base">Bridge Tokens</div>
    </router-link>
    <router-link
      :to="{ name: RouteNames.ProvideBridge }"
      class="rounded-full bg-sky-900/20 hover:bg-sky-600/20 transition-all group w-3/4 max-w-4xl flex items-center gap-5 bg-gradient-to-r from-transparent via-transparent to-black/20 shadow-lg shadow-black active:shadow-none cursor-pointer"
      :class="{
        'outline outline-2 outline-offset-4 outline-amber-400': !bridgeActive,
      }"
      @click="bridgeActive = false"
    >
      <div class="rounded-full bg-sky-500/20 p-1">
        <img
          :src="dollars"
          alt=""
          class="w-12 h-12 group-hover:animate-bounce"
        />
      </div>
      <div class="grow text-center text-base">Provide Bridge</div>
    </router-link>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { bridge2, dollars } from "../../asset/images/images";
import { RouteNames } from "../../router";

const route = useRoute()
const bridgeActive = ref<boolean>(true);

onMounted(() => {
  setTimeout(() => { //settime out 0 to push to the next event loop update
    if(route.name == RouteNames.ProvideBridge){
      bridgeActive.value = false;
    }
  }, 0);
})
</script>
