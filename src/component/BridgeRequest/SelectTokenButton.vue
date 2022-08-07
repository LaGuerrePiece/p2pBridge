<template>
  <div
    @click="displayModal = !displayModal"
    class="flex w-20 items-center p-0.5 border  border-yellow-400 cursor-pointer"
  > 
    <div class="rounded-full w-6 pl-0.5">
      <img
        :src="icons[actualToken]"
        alt=""
      />
    </div>
    <div
      class="px-1 flex grow justify-center font-mono font-bold text-xs text-white"
    >
      {{actualToken}}
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useWeb3Store } from "../../store/web3";
import {
  busd,
  tether,
  usdc,
} from "../../asset/images/images";

const props = defineProps<{
  actualToken: string;
}>();

const icons: {[index: string]: any} = {
  "USDT": tether,
  "BUSD": busd,
  "USDC": usdc,
}

const web3Store = useWeb3Store();

const displayModal = ref<Boolean>(false);

</script>
