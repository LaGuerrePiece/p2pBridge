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
          Easy mode
        </div>
        <input type="checkbox" v-model="ezmode" class="toggle cursor-pointer" checked />
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
          : request.lp
          ? `provider : ${trimAddress(request.lp)}`
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
        v-else-if="ezmode"
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
            :locks="locks"
            @close="bridgingModalOpen = false">
          </BridgingModal>
        </ModalFrame>
      </transition>
      <transition name="fadeMod">
        <ModalFrame v-if="providerModalOpen" @close="providerModalOpen = false">
          <template #title>Providers</template>
          <ChooseProvider
            :request="request"
            :locks="locks"
            @provider-chosen="(n: string) => request.lp = n"
            @close="providerModalOpen = false">
          </ChooseProvider>
        </ModalFrame>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useWeb3Store } from "../../store/web3";
import ModalFrame from "../Modals/ModalFrame.vue";
import SelectChainSpan from "./SelectChainSpan.vue";
import ChooseProvider from "./ChooseProvider.vue";
import BridgingModal from "./BridgingModal.vue";
import { Web3Actions } from "../../types/web3";

import BigNumber from "bignumber.js";
import { trimAddress } from "../../composition/functions"
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
const bridgeStore = useBridgesStore();

const request = ref<RequestInfo>({
  fromNetwork: "42",
  toNetwork: "4",
  token: "NUKE",
  amount: null,
  lp: null,
  lpLockId: null,
  amountReceivedEst: null,
})

const providerModalOpen = ref<boolean>(false);
const bridgingModalOpen = ref<boolean>(false);

const ezmode= ref<boolean>(true);

const balance = ref<number>(0);

const locks = ref<{[chain: string]: any}>({
  "4" : {},
  "42": {}
})

watch(() => web3Store.connected,
  getLocks
)

watch([() => request.value.fromNetwork,
  () => request.value.token,
  () => request.value.amount], () => {
  getUserBalance(request.value.fromNetwork, request.value.token)
})

watch([() => request.value.amount,
  () => request.value.toNetwork,
  () => request.value.fromNetwork,
  () => request.value.token],
  computeBestLp
)

async function getUserBalance(chainid: string, tokenName: string) {
  if (!web3Store.connected) return
    const bridgeStore = useBridgesStore()
    const erc20Contract = new bridgeStore[chainid].web3.eth.Contract(
      erc20Abi as AbiItem[],
      chainDetails[chainid].token[tokenName].address,
      { from: web3Store.address }) as unknown as Contractify<ERC20Instance, AllEvents>;
    
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

async function computeBestLp() {
  if (!web3Store.connected || !request.value.amount) {
    console.log('return cause not connected or no amount');
    request.value.lp = null
    request.value.lpLockId = null
    request.value.amountReceivedEst = null
    return
  }
  // get providers that accept this trade

  const decimals = Number(await bridgeStore[request.value.toNetwork].token[request.value.token].methods.decimals().call())

  const lock = locks.value[request.value.toNetwork]
  
  if (Number(ethers.utils.formatUnits(lock[0], decimals)) < request.value.amount) {
    console.log('No valid LP detected')
    request.value.lp = null
    request.value.lpLockId = null
    request.value.amountReceivedEst = null
    return
  }

  // const validLpLocks = locks.filter(lock => 
  //   (Number(ethers.utils.formatUnits(lock.amount, decimals)) >= request.value.amount!)
  //   // && (lock.acceptedChains.includes(request.value.fromNetwork))
  //   //to-do check if auth amount in others is good
  //   //to-do check if it is the same token 
  // )
  // to do : compute reputation

  const estGasFees = 0
  const estAmountReceived = request.value.amount - (request.value.amount * lock[4]/1e6) - estGasFees

  request.value.amountReceivedEst = estAmountReceived
  request.value.lp = lock[1]
  request.value.lpLockId = 1
}

async function getLocks() {

  // In demo, the only lock available if the one run by our bot
  locks.value["4"] = await bridgeStore["4"].bridge.methods.getLpLockFromId(1).call()
  locks.value["42"] = await bridgeStore["42"].bridge.methods.getLpLockFromId(1).call()

  // const lpNonce = Number(await bridgeStore[request.value.toNetwork].bridge.methods.lpNonce().call())

  // console.log('lpNonce', lpNonce)

  // const promises: Array<Promise<any>> = [];
  // for (let i = 1; i <= lpNonce; i++) {
  //   promises.push(bridgeStore[request.value.toNetwork].bridge.methods.getLpLockFromId(i).call());
  // }
  // const lpLocks = await Promise.all(promises);

  // const authPromises: Array<Promise<any>> = [];
  // for (let i = 1; i <= lpNonce; i++) {
  //   authPromises.push(bridgeStore[request.value.toNetwork].bridge.methods.getAuthsFromLpLockId(i).call());
  // }
  // const auth = await Promise.all(authPromises);
  // console.log('auths', auth)
  // for (let i = 0; i < lpLocks.length; i++) {
  //   lpLocks[i].auths = auth[i]
  // }
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