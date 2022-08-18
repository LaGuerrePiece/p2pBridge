
var chainDetails = require("./chains.js");
const { ethers } = require("ethers");
const Web3WsProvider = require("web3-providers-ws");

require('dotenv').config()
var fs = require('fs');

const private_key = process.env.PRIVATE_KEY;
var jsonFile = "../src/abis/bridgeAbi.json";
var abi = JSON.parse(fs.readFileSync(jsonFile));
var wallet = [];
chainDetails.forEach(chain => {
    const provider = new ethers.providers.Web3Provider(
        new Web3WsProvider(chain.rpcUrls[1], {
          clientConfig: {
            keepalive: true,
            keepaliveInterval: 600000,
          },
          reconnect: {
            auto: true,
            delay: 60000,
            maxAttempts: 5,
            onTimeout: false
          }
        })
      )
    wallet.push(
    {
        name : chain.name,
        id: chain.id,
        provider : provider,
        signer : new ethers.Wallet(private_key, provider),
        contractAddress: chain.bridgeAddress,
        contract: null,
        contractW: null
    })
});

wallet.forEach(chain => {
    chain.contract = new ethers.Contract(chain.contractAddress, abi, chain.provider);
    chain.contractW = new ethers.Contract(chain.contractAddress, abi, chain.signer);
});

wallet.forEach(chain => {
    chain.contract.on("Request", (bridger, amount, chainWanted, token, bridgerLockId, lpLockId, lp, event) => {
        console.log("Bridger request received. Authorizing it");
        //console.log(bridger, amount, chainWanted, token, bridgerLockId, lpLockId);
        let chainB = {};
        wallet.forEach(chain => {
            if (chain.id == parseInt(chainWanted)){
                chainB = chain;
            } 
        });
        tx = chainB.contractW.authBridger(amount, bridger, chain.id, lpLockId, bridgerLockId, Date.now() + 1000000);
        tx.then(function(tx) {
            console.log(tx.hash);
        });
    })
    chain.contract.on("Unlock", (lpLockId, authIndex, chainId, bridgerLockId, signature, event) => {
        console.log("Bridger secret received. Using it");
        //console.log(lpLockId, signature, chainId, bridgerLockId, authIndex);
        let chainB = {};
        wallet.forEach(chain => {
            if (chain.id == parseInt(chainId)){
                chainB = chain;
            } 
        });
        tx = chainB.contractW.lpUnlock(bridgerLockId, signature);
        tx.then(function(tx) {
            console.log(tx.hash);
        });   
    })
});
console.log('bot running...')

