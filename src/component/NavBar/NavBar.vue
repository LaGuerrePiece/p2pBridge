<template>
<div class="flex object-right w-screen h-24 ">
    <div class="py-1 flex pl-1 pr-1 text-3xl font-sans font-bold text-white cursor-pointer" @click="">
        <img class="h-16 pr-1" :src="radioactive" alt="" />
        <div class="mt-2.5 text-5xl">Nuclear</div>
    </div>
    <div class="py-1 flex flex-row-reverse pl-3 pr-1 text-3xl font-sans font-bold text-white grow items-center justify-right">
        <div class="shrink-0">
            <div class="p-1 flex items-center mr-5">
                <Metamask />
            </div>
        </div>
        <div class="shrink-0">
            <div class="p-1 flex items-center">
                <ChainInfo v-if="web3Store.chainId" />
            </div>
        </div>
        <div class="shrink-0">
            <div class="p-1 flex items-center">
                <Documentation />
            </div>
        </div>
    </div>
</div>
</template>


<script setup lang="ts">
import ChainInfo from "../ChainInfo/ChainInfo.vue";
import Metamask from "../Metamask/Metamask.vue";
import { useWeb3Store } from "../../store/web3";
import { radioactive, bridge4 } from "../../asset/images/images";
import Documentation from "../Buttons/Documentation.vue";


const web3Store = useWeb3Store();
</script>