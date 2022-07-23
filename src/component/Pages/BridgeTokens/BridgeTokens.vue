<template>
  <PageFrame>
    <div
      class="grid grid-cols-1 lg:grid-cols-5 lg:gap-4 gap-8 justify-items-center"
    >
    <div class="lg:col-span-3 w-full relative">
      <router-view v-slot="{ Component }: { Component: Object }">
        <transition name="fadeNest">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
      <MyBridgeRequests />
      <Documentation />
    </div>
  </PageFrame>
</template>
<script setup lang="ts">
import PageFrame from "../PageFrame.vue";
import MyBridgeRequests from "./MyBridgeRequests/MyBridgeRequestsList.vue";
import Documentation from "../../Buttons/Documentation.vue";
import { RouterView } from "vue-router";
</script>
