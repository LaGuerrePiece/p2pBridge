var chainDetails = require("./chains.js");
const { ethers } = require("ethers");
require('dotenv').config()
var fs = require('fs');

const private_key = process.env.PRIVATE_KEY;
var jsonFile = "./abi.json";
var abi = JSON.parse(fs.readFileSync(jsonFile));
var wallet = [];
chainDetails.forEach(chain => {
    wallet.push(
    {
        name : chain["name"],
        id: chain["id"],
        provider : new ethers.providers.WebSocketProvider(chain["rpcUrls"][1]),
        signer : new ethers.Wallet(private_key, new ethers.providers.WebSocketProvider(chain["rpcUrls"][1])),
        contractAddress: chain["bridgeAddress"],
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
            if (chain["id"] == parseInt(chainWanted)){
                chainB = chain;
            } 
        });
        tx = chainB.contractW.authBridger(amount, bridger, 1, chain["id"], lpLockId, bridgerLockId);
        tx.then(function(tx) {
            console.log(tx.hash);
        });
    })
    chain.contract.on("Unlock", (lpLockId, signature, chainId, bridgerLockId, authIndex, event) => {
        console.log("Bridger secret received. Using it");
        //console.log(lpLockId, signature, chainId, bridgerLockId, authIndex);
        let chainB = {};
        wallet.forEach(chain => {
            if (chain["id"] == parseInt(chainId)){
                chainB = chain;
            } 
        });
        tx = chainB.contractW.lpUnlock(bridgerLockId, signature);
        tx.then(function(tx) {
            console.log(tx.hash);
        });   
    })
});

