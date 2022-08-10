<template>
    <div
        class="flex flex-col"
    >
        <div class="text-center">
            {{request.amount}} {{request.token}}
        </div>
        <div class="grid grid-cols-2 justify-items-center py-4">
            <div class="flex flex-row items-center">
                <div>
                    From 
                </div>
                <div class="rounded-full w-8 px-1">
                    <img
                        :src="chainDetails[request.fromNetwork.toString()].icon"
                        alt=""
                    />
                </div>
                <div>
                    {{chainDetails[request.fromNetwork.toString()].name}}
                </div>
            </div>
            <div class="flex flex-row items-center">
                <div>
                    To 
                </div>
                <div class="rounded-full w-8 px-1">
                    <img
                        :src="chainDetails[request.toNetwork.toString()].icon"
                        alt=""
                    />
                </div>
                <div>
                    {{chainDetails[request.toNetwork.toString()].name}}
                </div>
            </div>
        </div>
        <ul class="steps steps-vertical lg:steps-horizontal w-full my-4">
            <li data-content="" class="step" :class="[step === 'final' || step === 'withdraw' || step === 'wait' || step === 'lock' ? 'step-primary' : '']">Approve</li>
            <li data-content="" class="step" :class="[step === 'final' || step === 'withdraw' || step === 'wait' ? 'step-primary' : '']">Lock</li>
            <li data-content="" class="step" :class="[step === 'final' || step === 'withdraw' ? 'step-primary' : '']">Wait</li>
            <li data-content="" class="step" :class="[step === 'final' ? 'step-primary' : '']">Withdraw</li>
        </ul>
        <div
            class="grid justify-items-center m-2"
        >
            <button
                v-if="loading"
                class="btn btn-neutral loading normal-case border border-primary ">
                Loading
            </button>
            <button
                v-else-if="step === 'approve' && web3Store.chainId.toString() !== request.fromNetwork"
                @click="switchChain"
                class="btn btn-neutral normal-case border border-primary ">
                Switch chain
            </button>
            <button
                v-else-if="step === 'approve'"
                @click="approve"
                class="btn btn-neutral normal-case border border-primary ">
                Approve
            </button>
            <button
                v-else-if="step === 'lock'"
                @click="lock"
                class="btn btn-neutral normal-case border border-primary ">
                Lock
            </button>
            <button
                v-else-if="step === 'wait'"
                class="btn btn-neutral loading normal-case border border-primary ">
                Waiting for provider...
            </button>
            <button
                v-else-if="step === 'withdraw'"
                @click="withdraw"
                class="btn btn-neutral normal-case border border-primary ">
                Withdraw
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
import {
  ERC20Instance,
  LpFirstHtlcInstance
} from "../../../types/truffle-contracts";
import { Contractify, Web3ify } from "../../types/commons";
import { RequestInfo, RequestContracts } from "../../types/bridgeRequests";
import { Web3Actions } from "../../types/web3";
import { ethers } from "ethers"

const web3Store = useWeb3Store();

const props = defineProps<{
    request: RequestInfo
}>();
const step = ref<"approve" | "lock" | "wait" | "withdraw" | "final">("approve");
const loading = ref<boolean>(false);
const requestContracts = ref<RequestContracts>({
    originERC20: null,
    originBridge: null,
    destinationERC20: null,
    destinationBridge: null,
})

// async function test() {
//       const bridgeContract = new web3Store.web3!.eth.Contract(
//         bridgeAbi as AbiItem[],
//         chainDetails[web3Store.chainId].bridgeAddress,
//         { from: web3Store.address }
//         ) as unknown as Contractify<LpFirstHtlcInstance, AllEvents>;

//     console.log(bridgeContract)

//     const lpLockId = await bridgeContract.methods.nonce().call()
//     console.log(lpLockId)
//     const lpLock = (await bridgeContract.methods.idToLpLock(lpLockId).call())
//     console.log('lpLock', lpLock)
// }

onMounted(initOriginContracts)
// onMounted(test)

function initOriginContracts() {

    requestContracts.value.originBridge = new web3Store.web3!.eth.Contract(
        abis.bridgeAbi as AbiItem[],
        chainDetails[web3Store.chainId].bridgeAddress,
        { from: web3Store.address }
        ) as unknown as Contractify<LpFirstHtlcInstance, AllEvents>;
    requestContracts.value.originERC20 = new web3Store.web3!.eth.Contract(
        abis.erc20Abi as AbiItem[],
        chainDetails[web3Store.chainId].token[props.request.token].address,
        { from: web3Store.address }) as unknown as Contractify<ERC20Instance, AllEvents>;

    //test
    requestContracts.value.destinationBridge = new web3Store.web3!.eth.Contract(
        abis.bridgeAbi as AbiItem[],
        chainDetails[props.request.toNetwork].bridgeAddress,
        { from: web3Store.address }
        ) as unknown as Contractify<LpFirstHtlcInstance, AllEvents>;
    
    checkApproval()
}

function approve() {
    loading.value = true

    requestContracts.value.originERC20!.methods.approve(
        chainDetails[web3Store.chainId].bridgeAddress,
        new BigNumber("1000e18").toFixed(),
        ).send().on("transactionHash", () => {
            step.value = 'lock'
            loading.value = false
        })
};


function lock() {
    loading.value = true

    const { lpLockId, lpAddress }: {lpLockId: number, lpAddress: string} = getAutoLpLockIdAndAddress()

    const amountToSend = "500000000000000"
    //props.request.amount!
    requestContracts.value.originBridge!.methods.createBridgerLock(
        amountToSend,
        props.request.toNetwork,
        chainDetails[web3Store.chainId].token[props.request.token].address,
        lpLockId,
        lpAddress
    ).send({ from : web3Store.address }).on("transactionHash", async () => {
        step.value = 'wait'
        loading.value = false

        //get lock id
        const myBridgerLockId = requestContracts.value.originBridge!.methods.bridgerNonce().call()


        const destinationBridgeContract = new web3Store.web3!.eth.Contract(
            abis.bridgeAbi as AbiItem[],
            chainDetails[props.request.toNetwork].bridgeAddress,
            { from: web3Store.address }
            ) as unknown as Contractify<LpFirstHtlcInstance, AllEvents>;

        step.value = 'withdraw'
        // destinationBridgeContract.events.BridgerAuth({
        //     filter: {
        //         bridgerLockId : myBridgerLockId
        //     }
        // }).on('data', (e :any) => {
        //     console.log(e)
        //     //check if auth is correct
        // })

    })
}

async function withdraw() {
    loading.value = true

    const bridgerLockId = await requestContracts.value.originBridge!.methods.bridgerNonce().call()

    await web3Store[Web3Actions.SwitchChain](Number(props.request.toNetwork));

    const destinationBridgeContract = new web3Store.web3!.eth.Contract(
        abis.bridgeAbi as AbiItem[],
        chainDetails[props.request.toNetwork].bridgeAddress,
        { from: web3Store.address }
        ) as unknown as Contractify<LpFirstHtlcInstance, AllEvents>;


    const lpLockId = await destinationBridgeContract.methods.lpNonce().call()
    const authIndex = "4"
    
    // const lpLock = (await destinationBridgeContract.methods.idToLpLock(lpLockId).call())

    const encodedParameters = web3Store.web3!.utils.encodePacked(
        { type: "uint256", value: web3Store.chainId.toString() },
        { type: "uint256", value: bridgerLockId.toString() },
    )!;

    const signature = await web3Store.web3!.eth.personal.sign(
      encodedParameters,
      web3Store.address,
      ""
    );

    destinationBridgeContract.methods.bridgerUnlock(
        lpLockId,
        signature,
        web3Store.chainId.toString(),
        bridgerLockId,
        authIndex
    ).send().on("transactionHash", async (h: any) => {
        step.value = 'final'
        loading.value = false
        console.log('final', h)
    })


}

function getAutoLpLockIdAndAddress() {

    return {lpLockId: 1, lpAddress: "0x9b862973b13222968Cc90200995392896e001bfE"}

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
}

</script>

