import {
  avalanche,
  bsc,
  busd,
  cronos,
  ethereum,
  gnosis,
  polygon,
  tether,
  usdc,
  ganache,
  weth
} from "../asset/images/images";
import { ChainDetails } from "../types/constants";
import erc20Abi from "../abis/erc20Abi.json"
import bridgeAbi from "../abis/bridgeAbi.json"

export const chainDetails: ChainDetails = {
  "1": {
    name: "Ethereum",
    icon: ethereum,
    enable: true,
    rpcUrls: [
      "https://mainnet.infura.io/v3/fd5dad2d869c4b20a703ea9f100333f7",
      "wss://mainnet.infura.io/v3/fd5dad2d869c4b20a703ea9f100333f7",
    ],
    bridgeAddress: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7",
    token: {
      WETH: { name: "WETH", icon: weth, address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
      USDT: { name: "USDT", icon: tether, address: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      BUSD: { name: "BUSD", icon: busd, address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53" },
      USDC: { name: "USDC", icon: usdc, address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
    },
  },
  "4": {
    name: "Rinkeby",
    icon: ethereum,
    enable: true,
    rpcUrls: [
      "https://rinkeby.infura.io/v3/49f373294ecd4358abd6a39d55521529",
      "wss://rinkeby.infura.io/ws/v3/49f373294ecd4358abd6a39d55521529",
    ],
    bridgeAddress: "0x12e567f179c4fAa810f235fc73C9874B356c829E",
    token: {
      WETH: { name: "WETH", icon: weth, address: "0xc778417E063141139Fce010982780140Aa0cD5Ab" },
      USDT: { name: "USDT", icon: tether, address: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      BUSD: { name: "BUSD", icon: busd, address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53" },
      USDC: { name: "USDC", icon: usdc, address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
    },
  },
  "42": {
    name: "Kovan",
    icon: ethereum,
    enable: true,
    rpcUrls: [
      "https://kovan.infura.io/v3/49f373294ecd4358abd6a39d55521529",
      "wss://kovan.infura.io/ws/v3/49f373294ecd4358abd6a39d55521529",
    ],
    bridgeAddress: "0x47bfCBfBFE9654248D5B55E85fAF9bFE00194E60",
    token: {
      WETH: { name: "WETH", icon: weth, address: "0xd0A1E359811322d97991E03f863a0C30C2cF029C" },
      USDT: { name: "USDT", icon: tether, address: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
      BUSD: { name: "BUSD", icon: busd, address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53" },
      USDC: { name: "USDC", icon: usdc, address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
    },
  },
  "56": {
    name: "BSC",
    icon: bsc,
    enable: false,
    rpcUrls: [
      "https://bsc-dataseed1.binance.org/",
      "wss://bsc-dataseed1.binance.org/",
    ],
    bridgeAddress: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7",
    token: {
      USDT: { name: "USDT", icon: tether, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
      BUSD: { name: "BUSD", icon: busd, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
      USDC: { name: "USDC", icon: usdc, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
    },
  },
  "338": {
    name: "Cronos Test",
    icon: cronos,
    enable: false,
    rpcUrls: ["https://evm-t3.cronos.org/", "wss://evm-t3.cronos.org/"],
    bridgeAddress: "0xe822b5A438634d6A172480d6E7493A353a8da1dC",
    token: {
      USDT: { name: "USDT", icon: tether, address: "0x1719DED8e908d7b1fe54ba6c6fD280A605e977ee" },
      BUSD: { name: "BUSD", icon: busd, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
      USDC: { name: "USDC", icon: usdc, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
    },
  },
  "77": {
    name: "Gnosis Test",
    icon: gnosis,
    enable: false,
    rpcUrls: ["https://sokol.poa.network/", "wss://sokol.poa.network/"],
    bridgeAddress: "0xe822b5A438634d6A172480d6E7493A353a8da1dC",
    token: {
      USDT: { name: "USDT", icon: tether, address: "0x1719DED8e908d7b1fe54ba6c6fD280A605e977ee" },
      BUSD: { name: "BUSD", icon: busd, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
      USDC: { name: "USDC", icon: usdc, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
    },
  },
  "43114": {
    name: "Avalanche",
    icon: avalanche,
    enable: false,
    rpcUrls: [
      "https://api.avax.network/ext/bc/C/rpc",
      "wss://api.avax.network/ext/bc/C/rpc",
    ],
    bridgeAddress: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7",
    token: {
      USDT: { name: "USDT", icon: tether, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
      BUSD: { name: "BUSD", icon: busd, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
      USDC: { name: "USDC", icon: usdc, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
    },
  },
  "137": {
    name: "Polygon",
    icon: polygon,
    enable: false,
    rpcUrls: ["https://polygon-rpc.com/", "wss://polygon-rpc.com/"],
    bridgeAddress: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7",
    token: {
      USDT: { name: "USDT", icon: tether, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
      BUSD: { name: "BUSD", icon: busd, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
      USDC: { name: "USDC", icon: usdc, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
    },
  },
  "1337": {
    name: "Ganache",
    icon: ganache,
    enable: false,
    rpcUrls: ["http://127.0.0.1:8545", "wss://127.0.0.1:8545"],
    bridgeAddress: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7",
    token: {
      USDT: { name: "USDT", icon: tether, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
      BUSD: { name: "BUSD", icon: busd, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
      USDC: { name: "USDC", icon: usdc, address: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7" },
    },
  },
}

export const abis ={
  erc20Abi: erc20Abi,
  bridgeAbi: bridgeAbi
}