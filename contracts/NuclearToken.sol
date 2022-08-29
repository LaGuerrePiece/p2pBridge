// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NuclearToken is ERC20 {
    constructor() ERC20("Nuclear Token", "NUKE")
    {
        _mint(msg.sender, 100000e18);
    } 
    function faucet() public {
        _mint(msg.sender, 100e18);
    }
}