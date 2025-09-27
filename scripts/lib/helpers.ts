import { keccak256, toUtf8Bytes } from "ethers";

// Código de elección desde un identificador legible
export const codeFromHuman = (humanId: string) =>
  keccak256(toUtf8Bytes(humanId)); // p.ej. "ES-GENERALES-2026"

// Hash del votante desde un secreto (mantén la lógica que decidas fuera de cadena)
export const voterHashFromSecret = (secret: string) =>
  keccak256(toUtf8Bytes(secret));  // p.ej. "dni|fecha|secreto"

// Normaliza textos para evitar "PSOE" vs "psoe "
export const canonicalize = (s: string) => s.trim().toLowerCase();

export const voteHashFromText = (text: string) =>
  keccak256(toUtf8Bytes(canonicalize(text)));
