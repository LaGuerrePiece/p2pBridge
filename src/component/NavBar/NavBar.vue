<template>
    <div class="py-1 flex pl-3 pr-1 text-3xl font-sans font-bold text-white">
        <!-- <span class="py-3">Welcome to&nbsp;</span> -->
        <img class="h-14 pr-1" :src="nuclear" alt="" />
        <img class="h-16" :src="bridge4" alt="" />
    </div>
    <div class="py-1 flex flex-row-reverse pl-3 pr-1 text-3xl font-sans font-bold text-white grow">
        <div class="shrink-0">
            <div class="p-1 flex items-center">
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
</template>


<script setup lang="ts">
import ChainInfo from "../ChainInfo/ChainInfo.vue";
import Metamask from "../Metamask/Metamask.vue";
import { useWeb3Store } from "../../store/web3";
import { nuclear, bridge4 } from "../../asset/images/images";
import Documentation from "../Buttons/Documentation.vue";


const web3Store = useWeb3Store();
</script>