import * as fs from "fs";

module.exports = (artifacts: Truffle.Artifacts, web3: Web3) => {
  return function (
    deployer: Truffle.Deployer,
    network: string,
    accounts: Truffle.Accounts
  ) {
    //if (network.includes("Mainnet") || network.includes("Testnet")) return;

    (deployer as any).then(async () => {
      const BridgeDex = artifacts.require("BridgeDex"); 
      const DummyERC20 = artifacts.require("DummyERC20"); 
      
      await deployer.deploy(BridgeDex, 1, accounts[9])
      await deployer.deploy(DummyERC20)
      console.log("Deployed Bridge contract : ", BridgeDex.address)
      console.log("Deployed ERC20 contract : ", DummyERC20.address)

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
