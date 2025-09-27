import hre from "hardhat";
import { codeFromHuman, voterHashFromSecret, canonicalize } from "./lib/helpers.ts";

async function main() {
  const connection = await hre.network.connect();
  const { ethers } = connection;

  const ADDR   = process.env.CONTRACT!;
  const human  = process.env.CODE_HUMAN!;
  const secret = process.env.VOTER_SECRET!;
  const voteRaw = process.env.VOTE_TEXT!;

  const code = codeFromHuman(human);
  const voterHash = voterHashFromSecret(secret);
  const vote = canonicalize(voteRaw);

  const c = await ethers.getContractAt("Voting", ADDR);
  const tx = await c.castVote(code, voterHash, vote);
  await tx.wait();

  console.log("Voted:", { human, code, voterHash, vote });
}

main().catch((e) => { console.error(e); process.exit(1); });