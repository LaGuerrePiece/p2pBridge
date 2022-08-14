<template>
    <div
        class="flex flex-col"
    >
        <div class="text-center">
            {{props.request.amount}} {{props.request.token}}
        </div>
        <div class="grid grid-cols-2 justify-items-center py-4">
            <div class="flex flex-row items-center">
                <div>
                    From 
                </div>
                <div class="rounded-full w-8 px-1">
                    <img
                        :src="chainDetails[props.request.fromNetwork].icon"
                        alt=""
                    />
                </div>
                <div>
                    {{chainDetails[props.request.fromNetwork].name}}
                </div>
            </div>
            <div class="flex flex-row items-center">
                <div>
                    To 
                </div>
                <div class="rounded-full w-8 px-1">
                    <img
                        :src="chainDetails[props.request.toNetwork].icon"
                        alt=""
                    />
                </div>
                <div>
                    {{chainDetails[props.request.toNetwork].name}}
                </div>
            </div>
        </div>
        <ul class="steps steps-horizontal w-full my-4">
            <li data-content="" class="step" :class="[step === 'final' || step === 'withdraw' || step === 'wait' || step === 'lock' ? 'step-primary' : '']">Approve</li>
            <li data-content="" class="step" :class="[step === 'final' || step === 'withdraw' || step === 'wait' ? 'step-primary' : '']">Lock</li>
            <li data-content="" class="step" :class="[step === 'final' || step === 'withdraw' ? 'step-primary' : '']">Wait</li>
            <li data-content="" class="step" :class="[step === 'final' ? 'step-primary' : '']">Withdraw</li>
        </ul>
        <div class="grid justify-items-center m-2">
            <button
                v-if="loading"
                class="btn btn-neutral loading static normal-case border border-primary w-32">
                Loading
            </button>
            <button
                v-else-if="step === 'approve' && web3Store.chainId.toString() !== props.request.fromNetwork"
                @click="switchChain"
                class="btn btn-neutral normal-case border border-primary">
                Switch chain
            </button>
            <button
                v-else-if="step === 'approve'"
                @click="approve"
                class="btn btn-neutral normal-case border border-primary">
                Approve
            </button>
            <button
                v-else-if="step === 'lock'"
                @click="lock"
                class="btn btn-neutral normal-case border border-primary">
                Lock
            </button>
            <button
                v-else-if="step === 'wait'"
                class="btn btn-neutral loading static normal-case border border-primary w-48">
                Waiting for provider...
            </button>
            <button
                v-else-if="step === 'withdraw'"
                @click="withdraw"
                class="btn btn-neutral normal-case border border-primary">
                Withdraw
            </button>
            <button
                v-else-if="step === 'final'"
                @click="$emit('close')"
                class="btn btn-neutral normal-case border border-primary">
                Bridge Successful !
            </button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useWeb3Store } from "../../store/web3";
import { trimAddress } from "../../composition/functions"
import BigNumber from "bignumber.js";
import { chainDetails, abis } from "../../composition/constants"
import { AllEvents } from "../../../types/truffle-contracts/ERC20";
import { BridgerAuth } from "../../../types/truffle-contracts/LpFirstHtlc";
import {
  ERC20Instance,
  LpFirstHtlcInstance
} from "../../../types/truffle-contracts";
import { Contractify } from "../../types/commons";
import { RequestInfo, RequestContracts } from "../../types/bridgeRequests";
import { Web3Actions } from "../../types/web3";
import { ethers } from "ethers"
import { useBridgesStore } from "../../store/bridges";
import { request } from "http";


const web3Store = useWeb3Store();

const props = defineProps<{
    request: RequestInfo,
    locks: any
}>();
const step = ref<"approve" | "lock" | "wait" | "withdraw" | "final">("approve");
const loading = ref<boolean>(false);

const requestContracts = ref<RequestContracts>({
    originERC20: null,
    originBridge: null,
    destinationERC20: null,
    destinationBridge: null,
})

onMounted(initContracts)

function initContracts() {

    requestContracts.value.originBridge = new web3Store.web3!.eth.Contract(
        abis.bridgeAbi as AbiItem[],
        chainDetails[web3Store.chainId].bridgeAddress,
        { from: web3Store.address }
        ) as unknown as Contractify<LpFirstHtlcInstance, BridgerAuth>;
    requestContracts.value.originERC20 = new web3Store.web3!.eth.Contract(
        abis.erc20Abi as AbiItem[],
        chainDetails[web3Store.chainId].token[props.request.token].address,
        { from: web3Store.address }) as unknown as Contractify<ERC20Instance, AllEvents>;

    requestContracts.value.destinationBridge = new web3Store.web3!.eth.Contract(
        abis.bridgeAbi as AbiItem[],
        chainDetails[props.request.toNetwork].bridgeAddress,
        { from: web3Store.address }
        ) as unknown as Contractify<LpFirstHtlcInstance, BridgerAuth>;
    requestContracts.value.destinationERC20 = new web3Store.web3!.eth.Contract(
        abis.erc20Abi as AbiItem[],
        chainDetails[props.request.toNetwork].bridgeAddress,
        { from: web3Store.address }
        ) as unknown as Contractify<ERC20Instance, AllEvents>;
    
    checkApproval()
}

function approve() {
    loading.value = true

    requestContracts.value.originERC20!.methods.approve(
        chainDetails[web3Store.chainId].bridgeAddress,
        new BigNumber("1000e18").toFixed(),
        ).send().on("receipt", () => {
            step.value = 'lock'
            loading.value = false
        })
};


function lock() {
    loading.value = true

    console.log("props.locks[props.request.toNetwork]", props.locks[props.request.toNetwork])

    const amountToSend = (ethers.utils.parseUnits(props.request.amount!.toString(), "18")).toString()
    const lpLockId = 1 //In demo, lpLockId is always 1
    const lpAddress = props.locks[props.request.toNetwork].owner

    const deadline = (Date.now() + 10000).toString()
    
    requestContracts.value.originBridge!.methods.createBridgerLock(
        amountToSend,
        props.request.toNetwork,
        chainDetails[web3Store.chainId].token[props.request.token].address,
        lpLockId,
        lpAddress,
        deadline
    ).send({ from : web3Store.address }).on("transactionHash", async () => {
        step.value = 'wait'
        loading.value = false
        console.log('locked, waiting for event')

        // const bridgesStore = useBridgesStore()
        // requestContracts.value.destinationBridge!.events.BridgerAuth()
        // .on('data', function(event){
        //     console.log(event);
        // })
        
        const provider = new ethers.providers.WebSocketProvider(chainDetails[props.request.toNetwork].rpcUrls[1])
        const contract = new ethers.Contract(chainDetails[props.request.toNetwork].bridgeAddress, abis.bridgeAbi, provider)
        contract.on("BridgerAuth", (amount, bridger, deadline, chainId, lpLockId, bridgerLockId, event) => {
            console.log("amount", amount, "bridger", bridger, "deadline", deadline, "chainId", chainId, "lpLockId", lpLockId, "bridgerLockId", bridgerLockId, "event", event);

            // TO DO checks

            step.value = 'withdraw'


        })
    })}


async function withdraw() {
    loading.value = true

    const bridgerLockId = await requestContracts.value.originBridge!.methods.bridgerNonce().call()
    const lpLockId = "1" // In demo, lpLockId is one

    await web3Store[Web3Actions.SwitchChain](Number(props.request.toNetwork));

    const auth = await requestContracts.value.destinationBridge!.methods.getAuthsFromLpLockId(lpLockId).call()
    console.log("auth", auth)
    const authIndex = auth.length - 1
    console.log("props.request.fromNetwork", props.request.fromNetwork, "bridgerLockId", bridgerLockId, )

    const encodedParameters = web3Store.web3!.utils.encodePacked(
        { type: "uint256", value: props.request.fromNetwork },
        { type: "uint256", value: bridgerLockId.toString() },
    )!;

    console.log("encodedParameters", encodedParameters)

    const signature = await web3Store.web3!.eth.personal.sign(
      encodedParameters,
      web3Store.address,
      ""
    );

    requestContracts.value.destinationBridge!.methods.bridgerUnlock(
        lpLockId,
        authIndex,
        props.request.fromNetwork,
        bridgerLockId,
        signature
    ).send().on("receipt", async () => {
        step.value = 'final'
        loading.value = false
        window.alert('Success !')
    })

}



async function checkApproval() {
    const rawAllowance = (await requestContracts.value.originERC20!
        .methods.allowance(web3Store.address, chainDetails[web3Store.chainId].bridgeAddress).call()).toString()

    const decimals = Number(await requestContracts.value.originERC20!.methods.decimals().call())
    const allowance = Number(ethers.utils.formatUnits(rawAllowance, decimals))

    console.log("allowance", allowance)
    console.log("props.request.amount", props.request.amount)
    if (allowance >= (props.request.amount as number)) {
        console.log('skipping approve')
        step.value = "lock"
    }
}

async function switchChain() {
    loading.value = true
    await web3Store[Web3Actions.SwitchChain](Number(props.request.fromNetwork))
    loading.value = false
    checkApproval()
}

</script>

