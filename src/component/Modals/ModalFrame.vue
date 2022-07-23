<template>
  <div
    class="fixed inset-0 backdrop-blur-lg flex"
    @click="$emit('close')"
  >
    <div
      class="absolute lg:top-36 top-20 left-1/2 lg:w-2/3 w-5/6 max-w-5xl lg:h-2/3 h-3/4 bg-neutral-800 -translate-x-1/2 p-4 rounded-xl shadow-lg shadow-black/50 overflow-y-scroll"
      @click.stop=""
    >
      <div
        class="flex relative justify-center items-center text-white font-semibold font-mono p-3"
      >
        <div><slot name="title"></slot></div>
        <div class="absolute right-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 stroke-white/80 hover:stroke-white active:stroke-neutral-300 cursor-pointer transition-all"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            @click="$emit('close')"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>
      <div class="h-px w-1/4 bg-white/20 m-auto">

      </div>
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const emit = defineEmits<{
  (e: "close"): void;
}>();

onMounted(() => {
    document.getElementsByTagName("body")[0].style.overflow = "hidden" 
})
onUnmounted(() => {
    document.getElementsByTagName("body")[0].style.overflow = "auto" 
})
</script>
