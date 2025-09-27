import hre from "hardhat";
import { codeFromHuman } from "./lib/helpers.ts";

async function main() {
  const connection = await hre.network.connect();
  const { ethers } = connection;

  const ADDR = process.env.CONTRACT!;
  const human = process.env.CODE_HUMAN!;     // "ES-GENERALES-2026"
  const meta  = process.env.META || human;   // Título/pregunta
  const start = BigInt(process.env.START!);  // epoch secs
  const end   = BigInt(process.env.END!);    // epoch secs
  const allow = (process.env.ALLOW_CHANGE || "true") === "true";

  const code = codeFromHuman(human);
  const c = await ethers.getContractAt("Voting", ADDR);

  const tx = await c.createElection(code, meta, start, end, allow);
  await tx.wait();

  console.log("Election created:", human, code);
}

main().catch((e) => { console.error(e); process.exit(1); });