<template>
  <div
    class="grid gap-1 items-center rounded-lg max-w-xl p-2 bg-secondary border-2 border-primary text-white h-96 w-[28rem]"
  >
    <div
      class="justify-self-center text-sm font-mono font-bold text-white px-5"
    >
      go nuclear
    </div>
    <div class="flex flex-row justify-between">
      <div class="flex flex-row">
        <div class="flex items-center pl-2 pr-3">
          From
        </div>
        <SelectChainSpan
          class="rounded-lg bg-neutral h-7"
          v-model:actualNetwork="requestInfo.fromNetwork"
        ></SelectChainSpan>
      </div>
      <div class="flex flex-row">
        <div class="flex items-center text-xs pl-2 pr-3">
          Easy mode
        </div>
        <input type="checkbox" v-model="ezmode" class="toggle cursor-pointer" checked />
      </div>
    </div>
    
    <div class="flex justify-between w-full h-16 border border-primary rounded-lg bg-neutral">
      <div class="flex flex-col pl-2 pt-2">
        <div class="text-xs">
          Send
        </div>
        <input
            class="bg-neutral border-0 focus:ring-0 outline:none text-lg w-52 p-0"
            v-model.number="requestInfo.amount"
            type="number"
            placeholder="0.0"
          />
      </div>
      <div class="flex flex-col pr-2 pt-1 items-end">
        <div class="text-[10px] text-gray-400 pl-1 pt-1 pb-2">
          Balance : 100
        </div>
        <SelectTokenButton
        class="rounded-lg bg-neutral h-7"
        v-model:actualToken="requestInfo.token"
        />
      </div>
    </div>

    <div class="flex h-6 justify-self-center cursor-pointer">
      <img
        @click="rotateNetworks"
        :src="arrowupdown"
        alt=""
      />
    </div>

    <div class="flex items-center flex-row h-7">
      <div class="flex justify-items-center pl-2 pr-3 py-1">
        To
      </div>
      <SelectChainSpan
        class="rounded-lg bg-neutral h-7"
        v-model:actualNetwork="requestInfo.toNetwork"
      ></SelectChainSpan>
    </div>

    <div
      class="flex justify-between w-full h-16 border border-primary rounded-lg bg-neutral">
      <div class="flex flex-col pl-2 pt-2">
        <div class="text-xs">
          Receive
        </div>
        <input
            class="bg-neutral border-0 focus:ring-0 focus:outline:none text-lg w-52 p-0"
            v-model.number="requestInfo.amount"
            type="number"
            placeholder="0.0"
          />
      </div>
      <div class="flex flex-col pr-2 pt-1 items-end">
        <div class="text-[10px] text-gray-400 pl-1 pt-1 pb-2">
          184.095 (-3.12%)
        </div>
      </div>
    </div>

    <div
      class="grid justify-items-center"
    >
      <button
        v-if="web3Store.chainId == 0"
        @click="web3Store[Web3Actions.Connect]()"
        class="btn btn-neutral normal-case border border-primary ">
          Connect
      </button>
      <button
        v-else-if="ezmode || providerChosen"
        @click="bridgingModalOpen = true"
        class="btn btn-neutral normal-case border border-primary ">
          Bridge
      </button>
      <button
        v-else
        @click="providerModalOpen = true"
        class="btn btn-neutral normal-case border border-primary ">
          Choose Provider
      </button>
    </div>
    <teleport to="body">
      <transition name="fadeMod">
        <ModalFrame v-if="bridgingModalOpen" @close="bridgingModalOpen = false">
          <template #title>Bridging</template>
          <BridgingModal
            :requestInfo="requestInfo"
            @close="bridgingModalOpen = false">
          </BridgingModal>
        </ModalFrame>
      </transition>
      <transition name="fadeMod">
        <ModalFrame v-if="providerModalOpen" @close="providerModalOpen = false">
          <template #title>Providers</template>
          <ChooseProvider
            :requestInfo="requestInfo"
            @provider-chosen="(n: string) => providerChosen = n"
            @close="providerModalOpen = false">
          </ChooseProvider>
        </ModalFrame>
      </transition>
    </teleport>




  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useWeb3Store } from "../../store/web3";
import ModalFrame from "../Modals/ModalFrame.vue";
import SelectChainSpan from "./SelectChainSpan.vue";
import SelectTokenButton from "./SelectTokenButton.vue";
import ChooseProvider from "./ChooseProvider.vue";
import BridgingModal from "./BridgingModal.vue";
import { Web3Actions } from "../../types/web3";

import BigNumber from "bignumber.js";
import { chainDetails } from "../../composition/constants"
import { AllEvents } from "../../../types/truffle-contracts/ERC20";
import {
  BridgeDexInstance,
  ERC20Instance,
} from "../../../types/truffle-contracts";
import { Contractify, Web3ify } from "../../types/commons";


import erc20Abi from "../../abis/erc20abi.json"
import {
  arrowupdown,
  rocket2,
  flag2
} from "../../asset/images/images";

const web3Store = useWeb3Store();

const requestInfo = ref({
  fromNetwork: "1",
  toNetwork: "137",
  token: "USDC",
  amount: null,
})
const providerChosen = ref<string>();

const providerModalOpen = ref<boolean>(false);
const bridgingModalOpen = ref<boolean>(false);

const ezmode= ref<boolean>(true);

function rotateNetworks() {
    const from = requestInfo.value.fromNetwork
    requestInfo.value.fromNetwork = requestInfo.value.toNetwork
    requestInfo.value.toNetwork = from
}



function lock() {
  
}

</script>