<template>
<div class="flex w-screen flex-col md:flex-row justify-between h-24 pb-2">
    <div class="flex p-1 font-sans items-center font-bold text-white cursor-pointer" @click="">
        <img class="h-16 pr-1" :src="radioactive" />
        <div class="lg:text-5xl text-4xl">Nuclear</div>
    </div>
    <div class="flex flex-row py-1 px-1 text-3xl font-sans font-bold text-white items-center">
        <div class="shrink-0">
            <div class="p-1 flex items-center">
                <Documentation />
            </div>
        </div>
        <div class="shrink-0">
            <div class="p-1 flex items-center">
                <ChainInfo v-if="web3Store.chainId" />
            </div>
        </div>
        <div class="shrink-0">
            <div class="p-1 flex items-center mr-1">
                <Metamask />
            </div>
        </div>
        <div class="shrink-0">
            <div class="p-1 flex items-center mr-2">
                <Faucet />
            </div>
        </div>
    </div>
</div>
</template>


<script setup lang="ts">
import Faucet from "../Buttons/Faucet.vue";
import ChainInfo from "../ChainInfo/ChainInfo.vue";
import Metamask from "../Metamask/Metamask.vue";
import { useWeb3Store } from "../../store/web3";
import { radioactive, bridge4 } from "../../asset/images/images";
import Documentation from "../Buttons/Documentation.vue";


const web3Store = useWeb3Store();
</script>