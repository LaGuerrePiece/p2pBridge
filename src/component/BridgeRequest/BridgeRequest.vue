<template>
  <div
    class="grid gap-1 items-center bg-zinc-800 rounded-lg max-w-xl p-2 border-2 border-white text-white h-72 w-[28rem]"
  >
    <div
      class="justify-self-center text-sm font-mono font-bold text-white px-5"
    >
      go nuclear
    </div>
    <div class="flex flex-row justify-evenly">
      <div class="flex items-center flex-row h-7">
        <div class="flex h-10 pr-2">
          <img
            :src="rocket2"
            alt=""
          />
        </div>
        <SelectElementSpan
          class="rounded-lg bg-black h-7"
          v-model:actualNetwork="fromNetwork"
        ></SelectElementSpan>
      </div>
      <div class="flex w-6">
        <img
          :src="arrowupdown"
          alt=""
        />
      </div>
      <div class="flex items-center flex-row h-7">
        <div class="flex h-10 pr-2">
          <img
            :src="flag2"
            alt=""
          />
        </div>
        <SelectElementSpan
          class="rounded-lg bg-black h-7"
          v-model:actualNetwork="toNetwork"
        ></SelectElementSpan>
      </div>
    </div>
    
    <div class="flex justify-between w-full h-16 border border-white rounded-lg bg-black">
      <div class="flex flex-col pl-2 pt-2">
        <div class="text-xs">
          Send
        </div>
        <input
            v-model.number="amount"
            type="number"
            placeholder="0.0"
            class="f bg-black text-lg w-40 outline-none"
          />
      </div>
      <div class="flex flex-col pr-2 pt-1 items-end">
        <div class="text-[10px] text-gray-400 pl-1 pt-1 pb-2">
          Balance : azeazeazeaze
        </div>
        <SelectTokenButton
        class="rounded-lg bg-black h-7"
        v-model:actualToken="token"
        />
      </div>
    </div>
    <div
      class="grid justify-items-center"
    >
      <div
        @click="send"
        class="flex w-36 h-10 items-center text-center text-md rounded-lg bg-black border border-white cursor-pointer"
      >
        <div class="flex grow justify-center font-mono font-bold text-lg text-white">
          Choose
        </div>
        <div class="rounded-full pr-3">
          <img
            class="h-8"
            :src="moneybag"
            alt=""
           />
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BigNumber from "bignumber.js";
import { ref } from "vue";
import {
  BridgeDexInstance,
  ERC20Instance,
} from "../../../types/truffle-contracts";
import { AllEvents } from "../../../types/truffle-contracts/ERC20";
import { useBridgesStore } from "../../store/bridges";
import { useWeb3Store } from "../../store/web3";
import { Contractify, Web3ify } from "../../types/commons";
import { Web3Actions } from "../../types/web3";
import SelectElementSpan from "./SelectElementSpan.vue";
import SelectTokenButton from "./SelectTokenButton.vue";
import {
  busd,
  tether,
  usdc,
  arrowupdown,
  rocket2,
  flag2,
  moneybag
} from "../../asset/images/images";

const bridgeStore = useBridgesStore();
const web3Store = useWeb3Store();

const fromNetwork = ref<number>(1)
const toNetwork = ref<number>(137)
const token = ref<string>("USDC");
const amount = ref<number>();
const maxFees = ref<number>();

const tokens: {[index: string]: any} = {
  "USDT": tether,
  "BUSD": busd,
  "USDC": usdc,
}

async function send() {
  const amount = new BigNumber("1000e18").toFixed();

  const contract = new web3Store.web3!.eth.Contract(
    web3Store.config.abi.ERC20Abi,
    "0x1719DED8e908d7b1fe54ba6c6fD280A605e977ee",
    { from: web3Store.address }
  ) as unknown as Contractify<ERC20Instance, AllEvents>;

  const bridgeA = new web3Store.web3!.eth.Contract(
    web3Store.config.abi.BridgeAbi,
    "0xe822b5A438634d6A172480d6E7493A353a8da1dC",
    { from: web3Store.address }
  ) as unknown as Contractify<BridgeDexInstance, AllEvents>;

  bridgeA.methods.lock(
    new BigNumber("1000e18").toFixed(),
    "0x1719DED8e908d7b1fe54ba6c6fD280A605e977ee"
  ).send().on("transactionHash", async () => {

    await web3Store[Web3Actions.SwitchChain](338);
  
    const bridgeB = new web3Store.web3!.eth.Contract(
      web3Store.config.abi.BridgeAbi,
      "0xe822b5A438634d6A172480d6E7493A353a8da1dC",
      { from: web3Store.address }
    ) as unknown as Contractify<BridgeDexInstance, AllEvents>;
  
    const date = Math.floor(Date.now() / 1000);
  
    const fees = "3";
    const chainBnonce = "2";
    const chainBId = "1";
    const chainANonce = "1";
    const chainAId = "1";
  
    const encodedParameters = web3Store.web3!.utils.encodePacked(
      { type: "uint256", value: chainBnonce },
      { type: "uint256", value: chainBId },
      { type: "uint256", value: chainANonce },
      { type: "uint256", value: chainAId }
    )!;
  
    const signature = await web3Store.web3!.eth.personal.sign(
      encodedParameters,
      web3Store.address,
      ""
    );
  
    // await bridgeB.methods.publishRequest(
    //   amount,
    //   amount,
    //   date,
    //   chainAId,
    //   chainANonce,
    //   signature,
    //   "0x1719DED8e908d7b1fe54ba6c6fD280A605e977ee",
    //   "0x1719DED8e908d7b1fe54ba6c6fD280A605e977ee",
    //   chainBnonce,
    //   fees
    // ).send();
  });

}
</script>
