// import * as fs from "fs";

module.exports = (artifacts: Truffle.Artifacts, web3: Web3) => {
  return function (
    deployer: Truffle.Deployer,
    network: string,
    accounts: Truffle.Accounts
  ) {
    //if (network.includes("Mainnet") || network.includes("Testnet")) return;

    (deployer as any).then(async () => {
      const LpFirstHtlc = artifacts.require("LpFirstHtlc");
      // const DummyERC20 = artifacts.require("DummyERC20"); 
      
      const owner = "0x86c01DD169aE6f3523D1919cc46bc224E733127F"
      await deployer.deploy(LpFirstHtlc, owner)
      // await deployer.deploy(DummyERC20)
      console.log("Deployed Bridge contract : ", LpFirstHtlc.address)
      // console.log("Deployed ERC20 contract : ", DummyERC20.address)

      // const config = require("../dev.config.js");
      // try {
      //   fs.writeFileSync(
      //     "./dev.config.js",
      //     `module.exports = ${JSON.stringify(config)}`
      //   );
      // } catch (e: any) {
      //   console.log(e);
      // }
    });
  };
};
