const fs = require("fs");
const walletConnectProvider = require("@walletconnect/web3-provider");
const coinbaseWalletSDK = require("@coinbase/wallet-sdk");

const chains = {
  1: {
    chainName: "Ethereum",
    rpcUrls: ["https://mainnet.infura.io/v3/fd5dad2d869c4b20a703ea9f100333f7"],
    bridgeAddress: "0x00",
    tokensAddress: {
      "USDT": "0x1234",
      "BUSD": "0x1234",
      "DAI": "0x1234",
      "ETH": "0x1234",
      "AVAX": "0x1234",
    }
  },
  56: {
    chainName: "BSC",
    rpcUrls: ["https://bsc-dataseed1.binance.org/"],
    bridgeAddress: "0x00",
    tokensAddress: {
      "USDT": "0x1234",
      "BUSD": "0x1234",
      "DAI": "0x1234",
      "ETH": "0x1234",
      "AVAX": "0x1234",
    }
  },
  137: {
    chainName: "Polygon",
    rpcUrls: ["https://polygon-rpc.com/"],
    bridgeAddress: "0x00",
    tokensAddress: {
      "USDT": "0x1234",
      "BUSD": "0x1234",
      "DAI": "0x1234",
      "ETH": "0x1234",
      "AVAX": "0x1234",
    }
  },
  1337: {
    chainName: "Ganache",
    rpcUrls: ["http://127.0.0.1:9545"],
    bridgeAddress: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7",
    tokensAddress: {
      "USDT": "0x1234",
      "BUSD": "0x1234",
      "DAI": "0x1234",
      "ETH": "0x1234",
      "AVAX": "0x1234",
    }
  },
  43114: {
    chainName: "Avalanche",
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    bridgeAddress: "0x00",
    tokensAddress: {
      "USDT": "0x1234",
      "BUSD": "0x1234",
      "DAI": "0x1234",
      "ETH": "0x1234",
      "AVAX": "0x1234",
    }
  },
};

const abi = {
  BridgeAbi: JSON.parse(fs.readFileSync("./build/contracts/BridgeDex.json"))[
    "abi"
  ],
  ERC20Abi: JSON.parse(fs.readFileSync("./build/contracts/ERC20.json"))["abi"],
};

const providerOptions = {
  walletConnect: {
    package: walletConnectProvider,
    options: {
      rpc: {
        1: chains[1].rpcUrls[0],
        56: chains[56].rpcUrls[0],
        137: chains[137].rpcUrls[0],
        1337: chains[1337].rpcUrls[0],
        43114: chains[43114].rpcUrls[0],
      },
    },
  },
  coinbaseWallet: {
    package: coinbaseWalletSDK,
    options: {
      appName: "BridgeDex",
      rpc: chains[1337].rpcUrls[0],
      chainId: 1337,
    },
  },
};

module.exports = {
  chains: chains,
  abi: abi,
  providerOptions: providerOptions,
};
