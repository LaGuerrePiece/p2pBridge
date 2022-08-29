import BigNumber from "bignumber.js";
// import * as fs from "fs";

module.exports = (artifacts: Truffle.Artifacts, web3: Web3) => {
  return function (
    deployer: Truffle.Deployer,
    network: string,
    accounts: Truffle.Accounts
  ) {
    //if (network.includes("Mainnet") || network.includes("Testnet")) return;

    (deployer as any).then(async () => {
      const BridgeDex = artifacts.require("BridgeDex");
      const NuclearToken = artifacts.require("NuclearToken");

      await deployer.deploy(BridgeDex);
      await deployer.deploy(NuclearToken);

      console.log("Deployed Bridge contract : ", BridgeDex.address);
      console.log("Deployed ERC20 contract : ", NuclearToken.address);

      let bridgeContract = await BridgeDex.deployed();
      let tokenContract = await NuclearToken.deployed();

      //create first locks :
      await tokenContract.approve(bridgeContract.address, "1000000000000000000000000");
      console.log("Approved bridge to spend our tokens");

      await bridgeContract.lock("1000000000000000000000000", tokenContract.address, [42, 4], 300);
      console.log("Created LP lock");

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
