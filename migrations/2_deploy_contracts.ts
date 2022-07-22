import * as fs from "fs";

module.exports = (artifacts: Truffle.Artifacts, web3: Web3) => {
  return function (
    deployer: Truffle.Deployer,
    network: string,
    accounts: Truffle.Accounts
  ) {
    if (network.includes("Mainnet") || network.includes("Testnet")) return;

    (deployer as any).then(async () => {
      const Test = artifacts.require("Test");
      
      await deployer.deploy(Test)
      console.log("Deployed test contract : ", Test.address)

      const config = require("../dev.config.js");
      try {
        fs.writeFileSync(
          "./dev.config.js",
          `module.exports = ${JSON.stringify(config)}`
        );
      } catch (e: any) {
        console.log(e);
      }
    });
  };
};
