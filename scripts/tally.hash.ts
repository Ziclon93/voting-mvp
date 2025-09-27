import hre from "hardhat";
import { codeFromHuman, voteHashFromText } from "./lib/helpers.ts";

async function main() {
  const connection = await hre.network.connect();
  const { ethers } = connection;

  const ADDR   = process.env.CONTRACT!;
  const human  = process.env.CODE_HUMAN!;
  const option = process.env.OPTION_TEXT!;

  const code = codeFromHuman(human);
  const voteHash = voteHashFromText(option);

  const c = await ethers.getContractAt("Voting", ADDR);
  const n = await c.tallyByHash(code, voteHash);

  console.log(`Tally "${option}":`, Number(n));
}

main().catch((e) => { console.error(e); process.exit(1); });