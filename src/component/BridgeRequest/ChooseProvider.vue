<template>
  <div
    class="flex flex-col font-mono text-white mt-8 gap-3"
  >
    <template v-for="lock in props.request.validLocks">
      <div
        class="grid grid-cols-2 text-xs relative rounded-lg justify-items-center p-3 gap-y-1.5 bg-secondary cursor-pointer"
        @click="
        $emit('lockChosen', lock);
        $emit('close')"
      >
        <div
          class="col-span-2 px-5 p-1 bg-neutral rounded-full border border-primary text-white mb-2"
          @click="openEtherscan(lock.owner)"
        >
          {{ trimAddress(lock.owner) }}
        </div>
        <div class="pl-3 w-full">
          <div class="grid grid-cols-2">
            <div class="">Total Locked:</div>
            <div class="pl-2">{{Number(ethers.utils.formatUnits(lock.amount, "18")).toFixed(4)}} {{request.token}}</div>
            <div class="">Fees:</div>
            <div class="pl-2">{{ lock.fees / 1000 }}%</div>
          </div>
        </div>
        <div class="pl-3 w-full">
          <div class="grid grid-cols-2 ">
            <div class="">Reactivity :</div>
            <div class="pl-2">1m</div>
            <div class="">Success Rate:</div>
            <div class="pl-2">98%</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { trimAddress } from "../../composition/functions"
import { RequestInfo } from "../../types/bridgeRequests";
import { ethers } from 'ethers'

const props = defineProps<{
  request: RequestInfo,
}>();

function openEtherscan(owner: string) {
  window.open('https://etherscan.io/address/' + owner, "blank")
}

</script>