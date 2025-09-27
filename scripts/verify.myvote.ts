import hre from "hardhat";
import { codeFromHuman, voterHashFromSecret, voteHashFromText } from "./lib/helpers";

async function main() {
  const connection = await hre.network.connect();
  const { ethers } = connection;

  const ADDR   = process.env.CONTRACT!;
  const human  = process.env.CODE_HUMAN!;
  const secret = process.env.VOTER_SECRET!;
  const text   = process.env.VOTE_TEXT!;  // el texto que dices haber votado

  const code = codeFromHuman(human);
  const vh   = voterHashFromSecret(secret);
  const expected = voteHashFromText(text);

  const c = await ethers.getContractAt("Voting", ADDR);
  const onchain = await c.myVoteHash(code, vh);

  console.log("expected:", expected);
  console.log("onchain :", onchain);
  console.log("match   :", expected.toLowerCase() === onchain.toLowerCase());
}

main().catch((e) => { console.error(e); process.exit(1); });
