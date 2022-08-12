const Migrations = artifacts.require("Migrations");

module.exports = function (deployer, network) {
  if (network.includes("Mainnet") || network.includes("Testnet")) return;
//   deployer.deploy(Migrations);
};