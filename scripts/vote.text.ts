import hre from "hardhat";
import { codeFromHuman, voterHashFromSecret } from "./lib/helpers.ts";

async function main() {
  const connection = await hre.network.connect();
  const { ethers } = connection;

  const ADDR   = process.env.CONTRACT!;
  const human  = process.env.CODE_HUMAN!;
  const secret = process.env.VOTER_SECRET!;
  const vote   = process.env.VOTE_TEXT!;   // "PSOE", "PP", "Sí reforma", etc.

  const code = codeFromHuman(human);
  const voterHash = voterHashFromSecret(secret);

  const c = await ethers.getContractAt("Voting", ADDR);
  const tx = await c.castVote(code, voterHash, vote);
  await tx.wait();

  console.log("Voted:", { human, code, voterHash, vote });
}

main().catch((e) => { console.error(e); process.exit(1); });
