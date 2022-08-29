<template>
  <div
    class="btn flex flex-col font-mono text-white mt-8 gap-3"
  >
    <template v-for="lock in props.locks[props.request.toNetwork]">
      <div
        class="btn grid grid-cols-2 text-xs relative rounded-lg justify-items-center p-3 gap-y-1.5 bg-secondary cursor-pointer"
        @click="
        $emit('providerChosen', props.locks[props.request.toNetwork].owner);
        $emit('close')"
      >
        <div
          class="col-span-2 px-5 p-1 bg-neutral rounded-full border border-primary text-white mb-2"
          @click="openEtherscan"
        >
          {{ trimAddress(props.locks[props.request.toNetwork].owner) }}
        </div>
        <div class="pl-3 w-full">
          <div class="grid grid-cols-2">
            <div class="">Total Locked:</div>
            <div class="pl-2">{{ Number(ethers.utils.formatUnits(props.locks[props.request.toNetwork].amount, "18")).toFixed(4)  }} {{request.token}}</div>
            <div class="">Fees:</div>
            <div class="pl-2">{{ props.locks[props.request.toNetwork].fees / 1000 }}%</div>
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
  locks: any
}>();

function openEtherscan () {
  window.open('https://etherscan.io/address/' + props.locks[props.request.toNetwork].owner, "blank")
}

</script>