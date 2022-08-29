<template>

    <!-- The button to open modal -->
    <label for="history-modal" class="btn modal-button flex h-10 hover:bg-secondary items-center p-0.5 lg:p-1 border border-primary rounded-lg cursor-pointer"><div class="rounded-full pl-1 hidden sm:flex">
      <img :src="radioactive" alt="" class="w-7 h-7"/>
    </div>
    <div
      class="px-2 flex grow justify-center font-mono font-bold text-sm text-white"
    >
    History
    </div>
    </label>


</template>

<script setup lang="ts">

import { radioactive, } from "../../asset/images/images";

</script>

