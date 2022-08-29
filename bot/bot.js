
var chainDetails = require("./chains.js");
const { ethers } = require("ethers");

require('dotenv').config()
var fs = require('fs');

const private_key = process.env.PRIVATE_KEY;
var jsonFile = "../src/abis/bridgeAbi.json";
var abi = JSON.parse(fs.readFileSync(jsonFile));

// reloader

const WEBSOCKET_PING_INTERVAL = 10000;
const WEBSOCKET_PONG_TIMEOUT = 5000;
const WEBSOCKET_RECONNECT_DELAY = 100;

const WebSocketProviderClass = () => (class {});

class WebSocketProvider extends WebSocketProviderClass() {
  provider;
  events = [];
  requests = {};

  handler = {
    get(target, prop, receiver) {
      const value = target.provider && Reflect.get(target.provider, prop, receiver);

      return value instanceof Function ? value.bind(target.provider) : value;
    },
  };

  constructor(providerUrl) {
    super();
    this.create(providerUrl);

    return new Proxy(this, this.handler);
  }

  create(providerUrl) {
    if (this.provider) {
      this.events = [...this.events, ...this.provider._events];
      this.requests = { ...this.requests, ...this.provider._requests };
    }
    console.log('this provider', providerUrl)
    const provider = new ethers.providers.WebSocketProvider(providerUrl);
    let pingInterval;
    let pongTimeout;

    provider._websocket.on('open', () => {
      pingInterval = setInterval(() => {
        provider._websocket.ping();
        // console.log('ping')

        pongTimeout = setTimeout(() => { provider._websocket.terminate(); }, WEBSOCKET_PONG_TIMEOUT);
      }, WEBSOCKET_PING_INTERVAL);

      let event;
      while ((event = this.events.pop())) {
        provider._events.push(event);
        provider._startEvent(event);
      }

      for (const key in this.requests) {
        provider._requests[key] = this.requests[key];
        provider._websocket.send(this.requests[key].payload);
        delete this.requests[key];
      }
    });

    provider._websocket.on('pong', () => {
      // console.log('pong')
      if (pongTimeout) clearTimeout(pongTimeout);
    });

    provider._websocket.on('close', (code) => {
      provider._wsReady = false;

      if (pingInterval) clearInterval(pingInterval);
      if (pongTimeout) clearTimeout(pongTimeout);

      if (code !== 1000) {
        setTimeout(() => this.create(), WEBSOCKET_RECONNECT_DELAY);
      }
    });

    this.provider = provider;
  }
}


async function startBot() {
    var wallet = [];
    
    chainDetails.forEach(chain => {
        const provider = new WebSocketProvider(chain.rpcUrls[1])

        wallet.push({
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
            console.log("sending Unlck")
            tx = chainB.contractW.lpUnlock(bridgerLockId, signature);
            tx.then(function(tx) {
                console.log(tx.hash);
            });   
        })
    });
    
    console.log('bot running...')
}

startBot()
