<template>
    <div class="pr-3 self-center rounded-full bg-neutral-800/50 active:bg-neutral-900/50 active:shadow-none active:translate-y-0 hover:bg-neutral-700/50 bg-gradient-to-r from-white/10 via-transparent to-black/10 shadow-lg shadow-neutral-900 font-mono text-white lg:col-span-3 flex gap-2 items-center text-sm font-semibold cursor-pointer -translate-y-1 transition-all">
        <div class="p-2 rounded-full">
            <img :src="documentation" alt="" class="w-5 h-5">
        </div>
        <div>Documentation</div>
    </div>
</template>
<script setup lang="ts">
import { documentation } from '../../../asset/images/images';
</script>