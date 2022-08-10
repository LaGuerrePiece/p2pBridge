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
      <button
        class="btn btn-xs btn-outline normal-case rounded-lg h-7">
        {{chainDetails[request.fromNetwork].name}}
      </button>
      </div>
      <div class="flex flex-row">
        <div class="flex items-center text-xs pl-2 pr-3">
          Easy mode
        </div>
        <input type="checkbox" v-model="ezmode" class="toggle cursor-pointer" checked />
      </div>
    </div>
    
    <div class="flex justify-between w-full h-16 p-1 border border-primary rounded-lg bg-neutral">
      <div class="flex flex-col justify-between p-1">
        <div class="text-xs">
          Send
        </div>
        <input
            class="bg-neutral border-0 focus:ring-0 outline:none text-lg w-52"
            v-model.number="request.amount"
            type="number"
            placeholder="0.0"
          />
      </div>
      <div class="flex flex-col justify-between p-1 items-end">
        <div class="flex flex-row items-center">
          <button
            @click="maximizeAmount"
            class="btn-primary ptit-btn btn-xs text-[10px] normal-case rounded-lg border border-primary">
              MAX
          </button>
          <div class="text-[10px] pl-1.5 text-gray-400">
            Balance : {{balance.toFixed(4)}}
          </div>
        </div>
        <SelectTokenButton
        class="rounded-lg bg-neutral h-7"
        v-model:actualToken="request.token"
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
      <button
        class=" btn btn-xs btn-outline normal-case rounded-lg h-7">
        {{chainDetails[request.toNetwork].name}}
      </button>
    </div>

    <div
      class="flex justify-between w-full h-16 p-1 border border-primary rounded-lg bg-neutral">
      <div class="flex flex-col justify-between p-1">
        <div class="text-xs">
          Receive
        </div>
        <input
            class="bg-neutral border-0 focus:ring-0 focus:outline:none text-lg w-52"
            v-model.number="request.amountReceivedEst"
            type="number"
            placeholder="0.0"
          />
      </div>
      <div class="flex flex-col p-1 items-end">
        <div class="text-[10px] text-gray-400">
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
        class="btn normal-case btn-wide border border-primary">
          Connect
      </button>
      <button
        v-else-if="ezmode || request.provider"
        @click="openBridgingModal"
        class="btn normal-case btn-wide border border-primary">
          Bridge
      </button>
      <button
        v-else
        @click="providerModalOpen = true"
        class="btn normal-case border btn-wide border-primary">
          Choose Provider
      </button>
    </div>
    <teleport to="body">
      <transition name="fadeMod">
        <ModalFrame v-if="bridgingModalOpen" @close="bridgingModalOpen = false">
          <template #title>Bridging</template>
          <BridgingModal
            :request="request"
            @close="bridgingModalOpen = false">
          </BridgingModal>
        </ModalFrame>
      </transition>
      <transition name="fadeMod">
        <ModalFrame v-if="providerModalOpen" @close="providerModalOpen = false">
          <template #title>Providers</template>
          <ChooseProvider
            :request="request"
            @provider-chosen="(n: string) => request.provider = n"
            @close="providerModalOpen = false">
          </ChooseProvider>
        </ModalFrame>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
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
import { ERC20Instance } from "../../../types/truffle-contracts";
import { Contractify, Web3ify } from "../../types/commons";
import { RequestInfo } from "../../types/bridgeRequests";

import erc20Abi from "../../abis/erc20Abi.json"
import { arrowupdown } from "../../asset/images/images";
import { ethers } from "ethers";
import { useBridgesStore } from "../../store/bridges";
import { notify } from "@kyvg/vue3-notification";

const web3Store = useWeb3Store();

const request = ref<RequestInfo>({
  fromNetwork: "42",
  toNetwork: "4",
  token: "WETH",
  amount: null,
  provider: null,
  amountReceivedEst: null,
})

const providerModalOpen = ref<boolean>(false);
const bridgingModalOpen = ref<boolean>(false);

const ezmode= ref<boolean>(true);

const balance = ref<number>(0);

watch([() => request.value.fromNetwork,
  () => request.value.token], () => {
  getUserBalance(request.value.fromNetwork, request.value.token)
})

watch([() => request.value.amount,
  () => request.value.toNetwork,
  () => request.value.fromNetwork,
  () => request.value.token],
  computeBestProvider
)

async function getUserBalance(chainid: string, tokenName: string) {
  const bridgeStore = useBridgesStore()
    const erc20Contract = new bridgeStore[chainid].web3.eth.Contract(
      erc20Abi as AbiItem[],
      chainDetails[chainid].token[tokenName].address,
      { from: web3Store.address }) as unknown as Contractify<ERC20Instance, AllEvents>;
    
    const rawBalance = (await erc20Contract.methods.balanceOf(web3Store.address).call()).toString()
    const decimals = Number(await erc20Contract.methods.decimals().call())
    balance.value = Number(ethers.utils.formatUnits(rawBalance, decimals))
    
    console.log("balance", balance.value, typeof balance.value)
}

function openBridgingModal() {
  if (request.value.amount == null) {
    notify({
      title: "Important message",
      text: "Amount input null",
      type: "warn",
    });
    console.log('lalal')
  } else {
    computeBestProvider()
    bridgingModalOpen.value = true
  }
}

function computeBestProvider() {
  // get providers that accept this trade

  // To do : compute reputation

  // select the best one
  


  return 'lalala'
}

function rotateNetworks() {
    const from = request.value.fromNetwork
    request.value.fromNetwork = request.value.toNetwork
    request.value.toNetwork = from
}

function maximizeAmount() {
  request.value.amount = balance.value
}

</script>