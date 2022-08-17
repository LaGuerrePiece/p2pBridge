const fs = require("fs");
const walletConnectProvider = require("@walletconnect/web3-provider");
const coinbaseWalletSDK = require("@coinbase/wallet-sdk");

const chains = {
  1337: {
    chainName: "Ganache",
    rpcUrls: ["http://127.0.0.1:8545", "wss://127.0.0.1:8545"],
    bridgeAddress: "0x0E492C37FDe1b467559f498014A344e5Fb8dC4F7",
    tokensAddress: {
      USDT: "0x1234",
      BUSD: "0x1234",
      DAI: "0x1234",
      ETH: "0x1234",
      AVAX: "0x1234",
    },
  },
};
// };

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
        1337: chains[1337].rpcUrls[0],
      },
    },
  },
};

module.exports = {
  chains: chains,
  abi: abi,
  providerOptions: providerOptions,
};
