<template>
  <div
    :class="$attrs"
    class="flex gap-3 cursor-pointer relative items-center"
    @click="expandSpan = !expandSpan"
  >
    <svg
      viewBox="0 0 384 512"
      class="w-3 transition-all"
      :class="expandSpan ? '' : '-rotate-90'"
    >
      <path
        fill="#ffffffb7"
        d="M192 384c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L192 306.8l137.4-137.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-160 160C208.4 380.9 200.2 384 192 384z"
      />
    </svg>
    <div class="flex items-center gap-2">
      <img
        :src="actualValue.icon"
        alt=""
        class="w-6 h-6 transition-all"
        :class="actualValue.name == 'Select' ? 'opacity-0' : ''"
      />
      <div>{{ actualValue.name }}</div>
    </div>
    <template v-for="(network, id) in data" :key="id">
      <div
        class="absolute w-36 transition-all flex items-center gap-2 bg-neutral-600 hover:bg-stone-700 active:bg-stone-800 bg-gradient-to-r from-transparent via-transparent to-black/30 shadow-lg shadow-black pr-2 p-1 rounded-full"
        :class="expandSpan ? 'opacity-1 z-20' : 'opacity-0 top-0 z-10'"
        :style="{ top: expandSpan ? (id + 1) * 40 - 5 + 'px' : '' }"
        @click.capture="updateActiveElement(network)"
      >
        <img :src="network.icon" alt="" class="w-6 h-6" />
        <div>
          {{ network.name }}
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  actualValue: { name: string; icon: any, id?: number };
  data: Array<{ name: string; icon: any, id?: number }>;
}>();

const emits = defineEmits<{
  (e: "update:actualValue", element: { name: string; icon: any }): void;
}>();

const expandSpan = ref<Boolean>(false);

function updateActiveElement(element: { name: string; icon: any }) {
  if (!expandSpan.value) return;
  emits("update:actualValue", element);
}
</script>
