import hre from "hardhat";
import { codeFromHuman, voterHashFromSecret } from "./lib/helpers.ts";

async function main() {
  const connection = await hre.network.connect();
  const { ethers } = connection;

  const ADDR   = process.env.CONTRACT!;
  const human  = process.env.CODE_HUMAN!;
  const secret = process.env.VOTER_SECRET!;

  const code = codeFromHuman(human);
  const voterHash = voterHashFromSecret(secret);

  const c = await ethers.getContractAt("Voting", ADDR);
  const h = await c.myVoteHash(code, voterHash);

  console.log("MyVoteHash:", h);
}

main().catch((e) => { console.error(e); process.exit(1); });