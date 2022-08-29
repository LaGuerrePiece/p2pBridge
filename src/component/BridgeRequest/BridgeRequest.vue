<template>
  <div
    class="grid gap-1 items-center rounded-lg max-w-[28rem] min-w-[14rem] p-2 mx-2 bg-secondary border-2 border-primary text-white h-96"
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
          Auto mode
        </div>
        <input type="checkbox" v-model="autoMode" class="toggle cursor-pointer"/>
      </div>
    </div>
    
    <div class="flex justify-between h-16 p-1 border border-primary rounded-lg bg-neutral">
      <div class="flex flex-col justify-between p-1">
        <div class="text-xs">
          Send
        </div>
        <input
            class="bg-neutral border-0 focus:ring-0 outline:none w-[70px] sm:w-[200px]"
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
        <button
          class="btn btn-xs btn-outline normal-case rounded-lg">
          {{request.token}}
        </button>
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
      class="flex justify-between h-16 p-1 border border-primary rounded-lg bg-neutral">
      <div class="flex flex-col justify-between p-1">
        <div class="text-xs">
          Receive
        </div>
        <input
            class="bg-neutral border-0 focus:ring-0 focus:outline:none text-lg"
            :value="(!request.amountReceivedEst || request.amountReceivedEst < 0)
                      ? 0
                      : request.amountReceivedEst.toFixed(6)"
            type="number"
            placeholder="0.0"
          />
      </div>
      <div class="flex flex-col p-1 items-end">
        <div class="text-[10px] text-gray-400">
          {{request.amount === null
          ? ""
          : request.bestLock
          ? `provider : ${trimAddress(request.bestLock.owner)}`
          : "No valid LP detected"}}
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
        v-else-if="autoMode"
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
            @lock-chosen="(lock: Lock) => {request.bestLock = lock; request.amountReceivedEst = computeAmountReceived(lock)}"
            @close="providerModalOpen = false">
          </ChooseProvider>
        </ModalFrame>
      </transition>
    </teleport>
  </div>

<!-- The history modal -->

<input type="checkbox" id="history-modal" class="modal-toggle" />
<div class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="font-bold text-lg">History</h3>
    <p class="py-4">Your past bridges and locks</p>
    <div class="modal-action">
      <label for="history-modal" class="btn">Close</label>
    </div>
  </div>
</div>

</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useWeb3Store } from "../../store/web3";
import ModalFrame from "../Modals/ModalFrame.vue";
import ChooseProvider from "./ChooseProvider.vue";
import BridgingModal from "./BridgingModal.vue";
import { Web3Actions } from "../../types/web3";

import BigNumber from "bignumber.js";
import { trimAddress } from "../../composition/functions"
import { chainDetails } from "../../composition/constants"

import { RequestInfo } from "../../types/bridgeRequests";
import { Lock } from "../../types/locks";

import { arrowupdown } from "../../asset/images/images";
import { ethers } from "ethers";
import { useBridgesStore } from "../../store/bridges";
import { useRequestStore } from "../../store/requests";
import { useLockStore } from "../../store/locks";
import { notify } from "@kyvg/vue3-notification";


const web3Store = useWeb3Store();
const bridgeStore = useBridgesStore();
const requestsStore = useRequestStore();
const lockStore = useLockStore();

const providerModalOpen = ref<boolean>(false);
const bridgingModalOpen = ref<boolean>(false);

const autoMode= ref<boolean>(true);

const balance = ref<number>(0);

const request = ref<RequestInfo>({
  fromNetwork: "42",
  toNetwork: "4",
  token: "NUKE",
  amount: null,
  validLocks: null,
  bestLock: null,
  amountReceivedEst: null,
})

watch([() => request.value.fromNetwork,
  () => request.value.token,
  () => request.value.amount], () => {
  getUserBalance(request.value.fromNetwork, request.value.token)
})

watch([() => request.value.amount,
  () => request.value.toNetwork,
  () => request.value.fromNetwork,
  () => request.value.token],
  updateBestLp
)

async function getUserBalance(chainid: string, tokenName: string) {
  if (!web3Store.connected) return
    const erc20Contract = bridgeStore[Number(chainid)].tokenContracts[tokenName]
    const rawBalance = (await erc20Contract.methods.balanceOf(web3Store.address).call()).toString()
    const decimals = Number(await erc20Contract.methods.decimals().call())
    balance.value = Number(ethers.utils.formatUnits(rawBalance, decimals))
    console.log('rawBalance', rawBalance)
    console.log("balance", balance.value, typeof balance.value)
}

function openBridgingModal() {
  if (request.value.amount == null) {
    // notify({
    //   title: "Important message",
    //   text: "Amount input null",
    //   type: "warn",
    // });
    console.log('no input amount')
  } else {
    bridgingModalOpen.value = true
  }
}

async function updateBestLp() {
  if (!web3Store.connected || !request.value.amount) {
    console.log('return cuz not connected or no amount');
    request.value.validLocks = null
    request.value.bestLock = null
    request.value.amountReceivedEst = null
    return
  }

  const locks = await getValidLocks()
  request.value.validLocks = locks

  if (locks.length === 0) {
    console.log('No valid LP detected')
    request.value.validLocks = null
    request.value.bestLock = null
    request.value.amountReceivedEst = null
    return
  }
  
  const bestLock = computeBestLock(locks)


  request.value.bestLock = bestLock
  request.value.amountReceivedEst = computeAmountReceived(bestLock)
}

function computeAmountReceived(lock: Lock) {
  const estGasFees = 0
  const estimation = request.value.amount! - (request.value.amount! * lock.fees/1e6) - estGasFees

  return estimation
}


function computeBestLock(locks: Lock[]) {
  // to do : compute reputation
  return locks[0]
}

async function getValidLocks() {
  // get providers that accept this trade
  const toNetwork = request.value.toNetwork
  const token = request.value.token
  const fromNetwork = request.value.fromNetwork
  const decimals = Number(await bridgeStore[Number(toNetwork)].tokenContracts[token].methods.decimals().call())
  
  let locks = lockStore[toNetwork][token]
  locks = locks.filter(lock => lock.acceptedChains.includes(Number(fromNetwork)))
  locks = locks.filter(lock => Number(ethers.utils.formatUnits(lock.amount - lock.accepted, decimals)) >= request.value.amount!)

  return locks
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