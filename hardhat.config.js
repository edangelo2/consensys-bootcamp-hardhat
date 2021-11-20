/* hardhat.config.js */
require("@nomiclabs/hardhat-waffle")

// Configure here the privateKeys by using dotEnv
const fs = require('fs')
const privateKey = fs.readFileSync(".secret").toString().trim() || "01234567890123456789"

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: "https://rpc-mumbai.matic.today",
      accounts: [privateKey]
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/06c84759610c49f29afcb6351a413f63",
      accounts: [privateKey]
    }
  },
  solidity: {
    version: "0.8.3",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}