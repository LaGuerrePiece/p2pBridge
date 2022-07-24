const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");
const Web3 = require("web3");
const BigNumber = require("bignumber.js");

const mnemonic = fs.readFileSync("mnemonic.txt").toString().trim();
let bridgeAbi = JSON.parse(
  fs.readFileSync("build/contracts/BridgeDex.json").toString().trim()
)["abi"];
let erc20Abi = JSON.parse(
  fs.readFileSync("build/contracts/BridgeDex.json").toString().trim()
)["abi"];

const web3a = new Web3(
  new HDWalletProvider({
    mnemonic: mnemonic,
    providerOrUrl: `https://rpc.ankr.com/polygon_mumbai`,
    chainId: 77,
  })
);
const web3b = new Web3(
  new HDWalletProvider({
    mnemonic: mnemonic,
    providerOrUrl: `https://rpc.ankr.com/polygon_mumbai`,
    chainId: 338,
  })
);

const bridgeContract = new web3.eth.Contract(
  gameAbi,
  "0x1a152ac0E31A8b9784AF8cC6C65Bf1C0aD3a33bf"
);
web3.eth.getAccounts().then((accounts) => {
  console.log(accounts);
  gameContract.methods
    .addBalances(7, new BigNumber("2000e18").toFixed(), 2)
    //.addDefense(0, 2, 40)
    .send({ from: accounts[0] })
    .on("sent", (obj) => {
      console.log(obj, " was sent");
    })
    .on("transactionHash", (string) => {
      console.log("hash ", string);
    })
    .on("receipt", (receipt) => {
      console.log(receipt);
    });
});
