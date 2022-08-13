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
      const NuclearToken = artifacts.require("NuclearToken"); 
      
      await deployer.deploy(LpFirstHtlc)
      await deployer.deploy(NuclearToken)
      console.log("Deployed Bridge contract : ", LpFirstHtlc.address)
      console.log("Deployed ERC20 contract : ", NuclearToken.address)



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
