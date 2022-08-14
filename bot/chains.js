module.exports = [
    {
      id: 4,
      name: "Rinkeby",
      rpcUrls: [
        "https://rinkeby.infura.io/v3/49f373294ecd4358abd6a39d55521529",
        "wss://rinkeby.infura.io/ws/v3/49f373294ecd4358abd6a39d55521529",
      ],
      bridgeAddress: "0x93f3C95bE7715E4df9790d861dC86D7550C35b07",
      token: {
        WETH: { address: "0xc778417E063141139Fce010982780140Aa0cD5Ab" },
        NUKE: { address: "0x8716004514B7c5eeC309df9d07bceD46dA24e43D" },

      },
    },
    {
      id: 42,
      name: "Kovan",
      rpcUrls: [
        "https://kovan.infura.io/v3/49f373294ecd4358abd6a39d55521529",
        "wss://kovan.infura.io/ws/v3/49f373294ecd4358abd6a39d55521529",
      ],
      bridgeAddress: "0xA854C7f5F07c4fF61288eBB37c4d054e47595ec2",
      token: {
        WETH: { address: "0xd0A1E359811322d97991E03f863a0C30C2cF029C" },
        NUKE: { address: "0x7Aa40C40E16364c0E8E700719533699A39e8AA43" },

      },
  }
]
