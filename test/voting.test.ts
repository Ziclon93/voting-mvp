import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { keccak256, toUtf8Bytes } from "ethers";

const codeFromHuman = (s: string) => keccak256(toUtf8Bytes(s));
const voterHash = (s: string) => keccak256(toUtf8Bytes(s));
const voteHash = (s: string) => keccak256(toUtf8Bytes(s.trim().toLowerCase()));

describe("Voting", () => {
  async function deployFixture(connection: any) {
    const F = await connection.ethers.getContractFactory("Voting");
    const c = await F.deploy();
    await c.waitForDeployment();
    return { c, ethers: connection.ethers };
  }

  it("registro, voto de texto y cambio", async () => {
    const connection = await hre.network.connect();
    const { c } = await loadFixture(deployFixture.bind(null, connection));

    const code = codeFromHuman("ES-GENERALES-2026");
    const now = Math.floor(Date.now() / 1000);
    await (await c.createElection(code, "Generales", BigInt(now - 5), BigInt(now + 3600), true)).wait();

    const vh = voterHash("dni|fecha|secreto");
    await (await c.enroll(code, vh)).wait();

    await (await c.castVote(code, vh, "PSOE")).wait();
    expect(await c.tallyByHash(code, voteHash("PSOE"))).to.equal(1n);

    await (await c.castVote(code, vh, "PP")).wait();
    expect(await c.tallyByHash(code, voteHash("PSOE"))).to.equal(0n);
    expect(await c.tallyByHash(code, voteHash("PP"))).to.equal(1n);

    expect(await c.myVoteHash(code, vh)).to.equal(voteHash("PP"));
  });
});