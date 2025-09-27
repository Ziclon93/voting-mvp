// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    // JSON-RPC local (Hardhat node o cualquier RPC local)
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
    },

     // Ejemplo para L1 pública (usando Secrets Manager de Hardhat 3)
    // sepolia: {
    //   type: "http",
    //   chainType: "l1",
    //   url: configVariable("SEPOLIA_RPC_URL"),
    //   accounts: "remote", // o HD Wallet/clave via configVariable(...)
    // },
  },
};

export default config;