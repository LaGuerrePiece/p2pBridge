<template>
  <div
    class="lg:col-span-3 grid gap-3 items-center bg-zinc-900 rounded-lg w-full max-w-2xl shadow-lg shadow-zinc-900/50 p-2 bg-gradient-to-tl from-transparent via-transparent to-black h-96"
  >
    <div
      class="justify-self-center rounded-full text-sm font-mono font-bold text-white px-5"
    >
      Request id: {{ props.id }}
    </div>
    <div class="w-1/2 m-auto h-px bg-white/10"></div>
    <div
      class="grid justify-self-center w-full grid-cols-2 gap-y-5 justify-items-center items-center font-mono text-white text-xs"
    >
      <div class="text-left w-20">From :</div>
      <div class="flex w-24 items-center gap-3">
        <img
          :src="chainDetails[77].icon"
          alt=""
          class="w-6 h-6"
        />
        <div class="whitespace-nowrap">{{ chainDetails[77].name }}</div>
      </div>
      <div class="text-left w-20">To :</div>
      <div class="flex w-24 items-center gap-3">
        <img
          :src="chainDetails[338].icon"
          alt=""
          class="w-6 h-6"
        />
        <div class="whitespace-nowrap">{{ chainDetails[338].name }}</div>
      </div>

      <div class="text-left w-20">Token :</div>
      <div class="flex w-24 justify-start items-center gap-3">
        <img
          :src="
            chainDetails[77].token[
              data[Number(props.id)].tokenAcontract
            ].icon
          "
          alt=""
          class="w-6 h-6"
        />
        <div>
          {{
            chainDetails[77].token[
              data[Number(props.id)].tokenAcontract
            ].name
          }}
        </div>
      </div>

      <div class="w-1/6 m-auto h-px bg-white/10 col-span-2"></div>
      <div class="text-left w-20">Amount :</div>
      <div>
        {{ data[Number(props.id)].amount }}
      </div>
      <div class="text-left w-20">Max fees :</div>
      <div>
        {{ data[Number(props.id)].fees }}
      </div>
      <div class="w-1/6 m-auto h-px bg-white/10 col-span-2"></div>
      <div
        class="col-span-2 rounded-full px-2 py-1 bg-zinc-700 w-2/3 sm:w-1/2 lg:w-1/3 text-center text-md bg-gradient-to-br from-white/20 via-transparent to-black/50 shadow-lg hover:shadow-md active:to-transparent active:from-transparent shadow-black cursor-pointer transition-all"
        @click="modalOpen = true"
      >
        Select Challengers
      </div>
      <div
        class="col-span-2 rounded-full px-2 py-1 animate-pulse bg-zinc-700 w-2/3 sm:w-1/2 lg:w-1/3 text-center text-md bg-gradient-to-br from-white/20 via-transparent to-black/50 shadow-lg hover:shadow-md active:to-transparent active:from-transparent shadow-black cursor-pointer transition-all"
        @click="withdrawOpen = true"
      >
        Withdraw Funds
      </div>
    </div>
    <teleport to="body">
      <transition name="fadeMod">
        <ModalFrame v-if="modalOpen" @close="modalOpen = false">
          <template #title>Challengers</template>
          <ChallengersList :id="props.id"></ChallengersList>
        </ModalFrame>
        <ModalFrame v-else-if="withdrawOpen" @close="withdrawOpen = false">
          <template #title>Withdraw</template>
          <WithdrawConfirmation
            :token="
              chainDetails[data[Number(props.id)].chainAId].token[
                data[Number(props.id)].tokenAcontract
              ].icon
            "
            :to="chainDetails[data[Number(props.id)].chainBId].icon"
            :amount="data[Number(props.id)].amount"
          ></WithdrawConfirmation>
        </ModalFrame>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { chainDetails } from "../../../../composition/constants";
import { useRequestStore } from "../../../../store/requests";
import { RequestGetters } from "../../../../types/requests";
import ModalFrame from "../../../Modals/ModalFrame.vue";
import ChallengersList from "./ChallengersList.vue";
import WithdrawConfirmation from "./WithdrawConfirmation.vue";

const props = defineProps<{
  id: string;
}>();

const modalOpen = ref<boolean>(false);
const withdrawOpen = ref<boolean>(false);
const requestStore = useRequestStore();

const data = requestStore[RequestGetters.MyRequests];
</script>
