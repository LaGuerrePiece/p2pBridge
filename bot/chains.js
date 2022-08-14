module.exports = [
    {
      id: 4,
      name: "Rinkeby",
      rpcUrls: [
        "https://rinkeby.infura.io/v3/49f373294ecd4358abd6a39d55521529",
        "wss://rinkeby.infura.io/ws/v3/49f373294ecd4358abd6a39d55521529",
      ],
      bridgeAddress: "0xe805Ee75a511427F56A1F851859aF98290608316",
      token: {
        WETH: { address: "0xc778417E063141139Fce010982780140Aa0cD5Ab" },
        NUKE: { address: "0x35C5d2EDef97edcb682eCa2D168F325c8AE1fD22" },

      },
    },
    {
      id: 42,
      name: "Kovan",
      rpcUrls: [
        "https://kovan.infura.io/v3/49f373294ecd4358abd6a39d55521529",
        "wss://kovan.infura.io/ws/v3/49f373294ecd4358abd6a39d55521529",
      ],
      bridgeAddress: "0x1ea0da6c3d97a6f69d5a0ebc6c618fd146bef44a",
      token: {
        WETH: { address: "0xd0A1E359811322d97991E03f863a0C30C2cF029C" },
        NUKE: { address: "0x8900B2DA7aE751CA6780d9C0B09B165eBC9d80F4" },

      },
  }
]
