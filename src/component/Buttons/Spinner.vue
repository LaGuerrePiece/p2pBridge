<template>
<div class="top-1/2 bottom-1/2">
    <svg :class="$attrs.props" class="animate-spin " viewBox="0 0 50 50">
      <circle
        :class="props.primaryClass"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-width="6"
        stroke-dasharray="90"
        stroke-dashoffset="90"
      ></circle>
      <circle
        :class="props.secondaryClass"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-dasharray="90, 150"
        stroke-width="7"
      ></circle>
    </svg>
</div>
</template>
<script setup lang="ts">
const props = defineProps<{
  primaryClass: string;
  secondaryClass: string;
}>();
</script>
