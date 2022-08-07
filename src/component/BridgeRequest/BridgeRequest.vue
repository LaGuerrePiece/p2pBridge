<template>
  <div
    class="grid gap-1 items-center rounded-lg max-w-xl p-2 border-2 border-primary text-white h-96 w-[28rem]"
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
        <SelectElementSpan
          class="rounded-lg bg-black h-7"
          v-model:actualNetwork="fromNetwork"
        ></SelectElementSpan>
      </div>
      <div class="flex flex-row justify-end">
        <div class="flex items-center text-xs pl-2 pr-3">
          Easy mode
        </div>
        <label for="default-toggle" class="inline-flex relative items-center cursor-pointer">
          <input type="checkbox" id="ezmode" v-model="ezmode" checked="true" class="sr-only peer">
          <div class="w-11 h-6 rounded-full peer bg-secondary peer-checked:after:translate-x-full after:absolute after:top-[4px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
    
    <div class="flex justify-between w-full h-16 border border-primary rounded-lg bg-black">
      <div class="flex flex-col pl-2 pt-2">
        <div class="text-xs">
          Send
        </div>
        <input
            class="bg-black border-0 focus:ring-0 text-lg w-52 p-0"
            v-model.number="amount"
            type="number"
            placeholder="0.0"
          />
      </div>
      <div class="flex flex-col pr-2 pt-1 items-end">
        <div class="text-[10px] text-gray-400 pl-1 pt-1 pb-2">
          Balance : 100
        </div>
        <SelectTokenButton
        class="rounded-lg bg-black h-7"
        v-model:actualToken="token"
        />
      </div>
    </div>

    <div class="flex h-6 justify-self-center cursor-pointer">
      <img
        @click="rotateNetworks"
        :src="arrow"
        alt=""
      />
    </div>

    <div class="flex items-center flex-row h-7">
      <div class="flex justify-items-center pl-2 pr-3 py-1">
        To
      </div>
      <SelectElementSpan
        class="rounded-lg bg-black h-7"
        v-model:actualNetwork="toNetwork"
      ></SelectElementSpan>
    </div>

    <div
      class="flex justify-between w-full h-16 border border-primary rounded-lg bg-black">
      <div class="flex flex-col pl-2 pt-2">
        <div class="text-xs">
          Receive
        </div>
        <input
            class="bg-black border-0 focus:ring-0 text-lg w-52 p-0"
            v-model.number="amount"
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
      <div
        v-if="ezmode"
        @click="modalOpen = true"
        class="flex w-36 h-10 items-center rounded-lg bg-black border  border-teal-300 cursor-pointer"
      >
        <div class="flex grow justify-end font-mono font-bold text-lg text-white pr-2">
          Bridge
        </div>
        <div class="flex grow font-mono font-bold text-3xl text-white">
          💰
        </div>
      </div>
      <div
        v-else-if="!providerChosen"
        @click="modalOpen = true"
        class="flex w-36 h-10 items-center rounded-lg bg-black border  border-primary cursor-pointer"
      >
        <div class="flex grow justify-end font-mono font-bold text-lg text-white pr-2">
          Choose
        </div>
        <div class="flex grow font-mono font-bold text-3xl text-white">
          💰
        </div>
      </div>
      <div
        v-else
        @click="approve"
        class="flex w-48 h-10 items-center rounded-lg bg-black border  border-primary cursor-pointer"
      >
        <div class="flex grow justify-end font-mono font-bold text-lg text-white pr-2">
          Approve
        </div>
        <div class="flex grow font-mono font-bold text-2xl text-white">
          📜
        </div>
      </div>
    </div>
    <!-- 🤝 -->
    <teleport to="body">
      <transition name="fadeMod">
        <ModalFrame v-if="modalOpen" @close="modalOpen = false">
          <template #title>Providers</template>
          <ProviderList
            :from="fromNetwork"
            :to="toNetwork"
            :token="token"
            :amount="(amount as number)"
            @provider-chosen="(n: string) => providerChosen = n"
            @close="modalOpen = false">
          </ProviderList>
        </ModalFrame>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useWeb3Store } from "../../store/web3";
import ModalFrame from "../Modals/ModalFrame.vue";
import SelectElementSpan from "./SelectElementSpan.vue";
import SelectTokenButton from "./SelectTokenButton.vue";
import ProviderList from "./ProviderList.vue";
import BigNumber from "bignumber.js";
import { chainDetails } from "../../composition/constants"
import { AllEvents } from "../../../types/truffle-contracts/ERC20";
import {
  BridgeDexInstance,
  ERC20Instance,
} from "../../../types/truffle-contracts";
import { Contractify, Web3ify } from "../../types/commons";


import erc20Abi from "../../abis/erc20Abi.json"
import {
  arrow,
  rocket2,
  flag2
} from "../../asset/images/images";

const web3Store = useWeb3Store();

const fromNetwork = ref<string>("1");
const toNetwork = ref<string>("137");
const token = ref<string>("USDC");
const amount = ref<number>();
const providerChosen = ref<string>();

const modalOpen = ref<boolean>(false);
const checked = ref<boolean>(false);

const ezmode= ref<boolean>(true);

function rotateNetworks() {
    const from = fromNetwork.value
    fromNetwork.value = toNetwork.value
    toNetwork.value = from
}

function approve() {
    const erc20Contract = new web3Store.web3!.eth.Contract(
    erc20Abi as AbiItem[],
    "0x1719DED8e908d7b1fe54ba6c6fD280A605e977ee",
    { from: web3Store.address }
  ) as unknown as Contractify<ERC20Instance, AllEvents>;

  // erc20Contract.methods.approve(
  //   "0x1719DED8e908d7b1fe54ba6c6fD280A605e977ee"
  //   new BigNumber("1000e18").toFixed(),
  // ).send().on("transactionHash", async () => {

};

function lock() {
  
}

</script>

<!-- #01FDFC
#02D8D9
#02C0C0
#009D9D
#017F80 -->