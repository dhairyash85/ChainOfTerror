require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks:{
    holesky:{
      url:"https://1rpc.io/holesky",
      accounts:["0x58d660e77e4ed1057937d8813155347e0b967fbd5197150f264191ec8fc2876a"]
    }
  }
};
