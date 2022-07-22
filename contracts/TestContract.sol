// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/// @author sylar123abc
/// @title A simple contract test 
contract Test {
    
    uint public testCounter = 24;

    constructor(){
        testCounter = 18;
    }

    function increment() external {
        ++testCounter;
    }
}