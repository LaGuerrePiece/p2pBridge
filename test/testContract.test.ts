// import BigNumber from "bignumber.js";
// import { TestInstance } from "../types/truffle-contracts";

// const Test = artifacts.require("Test");

// contract("Test: Hello World", (accounts: Truffle.Accounts) => {
//   var test: TestInstance;

//   before(async () => {
//     test = await Test.deployed();
//   });

//   it("Checks the test contract is initialized with the right value", async () => {
//     const counter = await test.testCounter();

//     assert.equal(
//       new BigNumber(counter.toString()).toFixed(),
//       "18",
//       "The counter initial value should be 18"
//     );
//   });

//   it("Checks the test contract incrementation works", async () => {
//     await test.increment();
//     const counter = await test.testCounter();
    
//     assert.equal(
//       new BigNumber(counter.toString()).toFixed(),
//       "19",
//       "After the increment the counter should be 19"
//     );
//   });
// });
