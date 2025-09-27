# Voting (by code)

MVP de votación on-chain donde cada elección está identificada por un **código legible** (p. ej. `ES-GENERALES-2026`) y cada voto es **texto libre**. En cadena **solo se almacena el hash** del texto, preservando la privacidad.

---

## Requisitos

- Node.js 22.x LTS o superior.
- npm / pnpm / yarn.
- Dependencias (en `package.json`): `hardhat`, `@nomicfoundation/hardhat-ethers`, `ethers@^6`, `@openzeppelin/contracts`.
- (Opcional) `dotenv` o `cross-env` para cargar variables de entorno.

---

## Estructura (resumen)

```
contracts/
  Voting.sol
scripts/
  create.ts
  enroll.ts
  vote.text.ts
  tally.hash.ts
  myvote.ts
  verify.myvote.ts    # Nuevo: verificación de voto por texto
  deploy.ts
  lib/helpers.ts
```

---

## Instalación y compilación

```bash
npm install
npm run build   # alias de: hardhat compile
```

---

## Nodo local y despliegue

En una terminal:

```bash
npm run node    # alias de: hardhat node
```

En otra terminal (misma carpeta):

```bash
npm run deploy  # ejecuta scripts/deploy.ts
```

La salida mostrará algo así:

```
Deployer: 0x...
Voting deployed at: 0xABCDEF...
```

Guarda la **dirección del contrato** para los siguientes pasos.

## Variables de entorno

Estas variables se leen vía `process.env.*` en los scripts.

| Variable        | ¿Qué es?                                                                | Ejemplo                         | Uso principal                                                                              |
|-----------------|--------------------------------------------------------------------------|---------------------------------|--------------------------------------------------------------------------------------------|
| `CONTRACT`      | Dirección del contrato `Voting` desplegado                               | `0xABCDEF...`                   | Interacción con el contrato                                                                |
| `CODE_HUMAN`    | Identificador legible de la elección                                     | `ELECCIONES GENERALES 2026`             | Se transforma a `bytes32` vía `keccak256(utf8(code))`                                      |
| `META`          | Descripción/metadatos de la elección                                     | `Elecciones Generales 2026`     | Información adicional al crear la elección                                                 |
| `START`         | Inicio de votación en **epoch segundos**                                 | `1730000000`                    | Límite inferior temporal                                                                   |
| `END`           | Fin de votación en **epoch segundos**                                    | `1730003600`                    | Límite superior temporal                                                                   |
| `ALLOW_CHANGE`  | Permitir cambio de voto (`true`/`false`)                                 | `true`                          | Parámetro opcional al crear la elección                                                    |
| `VOTER_SECRET`  | **Secreto del votante off-chain**. Cadena **estable** (mismo formato siempre) | `46455745V`             | Se hashea → `voterHash` para `enroll` y para consulta `myVoteHash`                         |
| `VOTE_TEXT`     | Texto exacto del voto                                                    | `PSOE`                          | Para votar (`vote.text.ts`) y verificar (`verify.myvote.ts`)                               |
| `OPTION_TEXT`   | Texto de la opción a consultar                                           | `PSOE`                          | Para recuento por opción (`tally.hash.ts`)                                                 |

**CMD**
```bat
set VOTER_SECRET=46455745V
```

**PowerShell**
```powershell
$env:VOTER_SECRET = "46455745V"
```

**bash/zsh**
```bash
export VOTER_SECRET=46455745V
```

---

## Crear una elección

Necesitas `CONTRACT`, `CODE_HUMAN`, `META`, `START`, `END` (opcional `ALLOW_CHANGE=true|false`, por defecto `true`).

```bash
npm run create
```

---

## Registrar votante (enroll)

Variables: `CONTRACT`, `CODE_HUMAN`, `VOTER_SECRET`.

```bat
set VOTER_SECRET=dni
npm run enroll
```

---

## Votar con texto libre

Variables: `CONTRACT`, `CODE_HUMAN`, `VOTER_SECRET`, `VOTE_TEXT`.

```bat
set VOTE_TEXT=PSOE
npm run vote:text
```

- El script normaliza el texto conforme al helper del proyecto (p. ej., trimming / case-fold) y calcula `keccak256(bytes(voteText))`.
- Si `ALLOW_CHANGE=true`, el último voto sustituye al anterior.

---

## Recuento por opción (texto)

Variables: `CONTRACT`, `CODE_HUMAN`, `OPTION_TEXT`.

```bat
set OPTION_TEXT=PSOE
npm run tally:hash
```

Consulta `tallyByHash(code, keccak256(normalized(OPTION_TEXT)))` con la misma normalización que al votar.

---

## Ver tu hash de voto

Variables: `CONTRACT`, `CODE_HUMAN`, `VOTER_SECRET`.

```bash
npm run myvote
```

Devuelve tu `myVoteHash` almacenado on-chain.

---

## Verificar tu voto (texto ↔ hash) ✅

Variables: `CONTRACT`, `CODE_HUMAN`, `VOTER_SECRET`, `VOTE_TEXT`.

```bat
set VOTE_TEXT=PSOE
npm run verify:myvote
```

El script:
1) Lee `myVoteHash` desde `Voting.myVoteHash(code, voterHash)`.
2) Normaliza y hashea `VOTE_TEXT` exactamente igual que al votar (usa el mismo helper).
3) Compara y muestra **MATCH / NO MATCH**.

Ejemplos de salida:

```
My vote hash on-chain: 0xabc...
Hash(text):           0xabc...
✅ MATCH: el texto coincide con tu hash almacenado
```

```
My vote hash on-chain: 0xabc...
Hash(text):           0xdef...
❌ NO MATCH: el texto NO coincide con tu hash
```

## Buenas prácticas

- **Roles**: creación de elecciones restringida con `AccessControl` (solo `ADMIN_ROLE`).
- **Privacidad**: se guarda **solo el hash** del voto (`keccak256`), nunca el texto.
- Si combinas múltiples valores dinámicos antes de hashear, usa `abi.encode(...)` → `keccak256(...)` para evitar colisiones sutiles.

---

## Referencias (documentación oficial)

- **Hardhat (Introducción / Ethers):** <https://hardhat.org/docs>
- **Ethers v6 (`keccak256`, UTF-8):** <https://docs.ethers.org/v6/>
- **OpenZeppelin AccessControl:** <https://docs.openzeppelin.com/contracts>
- **Variables de entorno en Node (`process.env`):** <https://nodejs.org/api/environment_variables.html>

---

## Licencia

MIT
