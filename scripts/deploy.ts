import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();
  const { ethers } = connection;

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", await deployer.getAddress());

  const F = await ethers.getContractFactory("Voting");
  const c = await F.deploy();
  await c.waitForDeployment();

  console.log("Voting deployed at:", await c.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });