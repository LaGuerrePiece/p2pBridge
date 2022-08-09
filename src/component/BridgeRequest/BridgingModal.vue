<template>
    <div
        class="flex flex-col"
    >
        <div class="text-center">
            {{requestInfo.amount}} {{requestInfo.token}}
        </div>
        <div class="grid grid-cols-2 justify-items-center py-4">
            <div class="flex flex-row items-center">
                <div>
                    From 
                </div>
                <div class="rounded-full w-8 px-1">
                    <img
                        :src="chainDetails[requestInfo.fromNetwork].icon"
                        alt=""
                    />
                </div>
                <div>
                    {{chainDetails[requestInfo.fromNetwork].name}}
                </div>
            </div>
            <div class="flex flex-row items-center">
                <div>
                    To 
                </div>
                <div class="rounded-full w-8 px-1">
                    <img
                        :src="chainDetails[requestInfo.toNetwork].icon"
                        alt=""
                    />
                </div>
                <div>
                    {{chainDetails[requestInfo.toNetwork].name}}
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
import { chainDetails } from "../../composition/constants"
import { AllEvents } from "../../../types/truffle-contracts/ERC20";
import {
  BridgeDexInstance,
  ERC20Instance,
  LpFirstHtlcInstance
} from "../../../types/truffle-contracts";
import { Contractify, Web3ify } from "../../types/commons";
import { RequestInfo } from "../../types/bridgeRequests";
import erc20Abi from "../../abis/erc20Abi.json"
import bridgeAbi from "../../abis/bridgeAbi.json"
import { Web3Actions } from "../../types/web3";

const props = defineProps<{
  requestInfo: RequestInfo
}>();

const web3Store = useWeb3Store();
const step = ref<"approve" | "lock" | "wait" | "withdraw" | "final">("approve");
const loading = ref<boolean>(false);


onMounted(checkApproval)

async function checkApproval() {
    const erc20Contract = new web3Store.web3!.eth.Contract(
        erc20Abi as AbiItem[],
        chainDetails[web3Store.chainId].token[props.requestInfo.token].address,
        { from: web3Store.address }) as unknown as Contractify<ERC20Instance, AllEvents>;
    
    const allowance = await erc20Contract.methods.allowance(web3Store.address,
        chainDetails[web3Store.chainId].bridgeAddress).call()
    console.log("allowance", allowance, typeof allowance)
    // step.value = "lock"
    step.value = "withdraw"
}

function approve() {
    loading.value = true
    const erc20Contract = new web3Store.web3!.eth.Contract(
        erc20Abi as AbiItem[],
        chainDetails[web3Store.chainId].token[props.requestInfo.token].address,
        { from: web3Store.address }) as unknown as Contractify<ERC20Instance, AllEvents>;

    erc20Contract.methods.approve(
        chainDetails[web3Store.chainId].bridgeAddress,
        new BigNumber("1000e18").toFixed(),
        ).send().on("transactionHash", () => {
            step.value = 'lock'
            loading.value = false
        })
};


function lock() {
    loading.value = true

    const bridgeContract = new web3Store.web3!.eth.Contract(
        bridgeAbi as AbiItem[],
        chainDetails[web3Store.chainId].bridgeAddress,
        { from: web3Store.address }
        ) as unknown as Contractify<LpFirstHtlcInstance, AllEvents>;

    const { lpLockId, lpAddress }: {lpLockId: number, lpAddress: string} = getAutoLpLockIdAndAddress()

    const amountToSend = "500000000000000"
    //props.requestInfo.amount!
    bridgeContract.methods.createBridgerLock(
        amountToSend,
        props.requestInfo.toNetwork,
        chainDetails[web3Store.chainId].token[props.requestInfo.token].address,
        lpLockId,
        lpAddress
    ).send().on("transactionHash", async () => {
        step.value = 'wait'
        loading.value = false

        //get lock id
        const myBridgerLockId = bridgeContract.methods.bridgerNonce().call()

        const destinationBridgeContract = new web3Store.web3!.eth.Contract(
            bridgeAbi as AbiItem[],
            chainDetails[props.requestInfo.toNetwork].bridgeAddress,
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

    

    const bridgeContract = new web3Store.web3!.eth.Contract(
        bridgeAbi as AbiItem[],
        chainDetails[web3Store.chainId].bridgeAddress,
        { from: web3Store.address }
        ) as unknown as Contractify<LpFirstHtlcInstance, AllEvents>;
    
    const bridgerLockId = await bridgeContract.methods.bridgerNonce().call()

    await web3Store[Web3Actions.SwitchChain](parseInt(props.requestInfo.toNetwork));

    const destinationBridgeContract = new web3Store.web3!.eth.Contract(
        bridgeAbi as AbiItem[],
        chainDetails[props.requestInfo.toNetwork].bridgeAddress,
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

</script>

