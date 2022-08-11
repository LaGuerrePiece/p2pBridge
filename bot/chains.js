module.exports = [
    {
      id: 4,
      name: "Rinkeby",
      rpcUrls: [
        "https://rinkeby.infura.io/v3/49f373294ecd4358abd6a39d55521529",
        "wss://rinkeby.infura.io/ws/v3/49f373294ecd4358abd6a39d55521529",
      ],
      bridgeAddress: "0x12e567f179c4fAa810f235fc73C9874B356c829E",
      token: {
        WETH: { address: "0xc778417E063141139Fce010982780140Aa0cD5Ab" },
      },
    },
    {
      id: 42,
      name: "Kovan",
      rpcUrls: [
        "https://kovan.infura.io/v3/49f373294ecd4358abd6a39d55521529",
        "wss://kovan.infura.io/ws/v3/49f373294ecd4358abd6a39d55521529",
      ],
      bridgeAddress: "0x47bfCBfBFE9654248D5B55E85fAF9bFE00194E60",
      token: {
        WETH: { address: "0xd0A1E359811322d97991E03f863a0C30C2cF029C" },

      },
  }
]
