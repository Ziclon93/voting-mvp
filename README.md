# Voting (by code)

MVP de sistema de votación *on-chain* donde **cada elección** está identificada por un **código** (p. ej. `ES-GENERALES-2026`) y **cada voto es texto libre** (partido/opción/decisión). En cadena sólo se almacena el **hash** del texto para preservar la privacidad.

---

## 🧱 Requisitos

* **Node.js ≥ 22.10.0** (Hardhat 3). Ver: [Hardhat – Node.js support](https://hardhat.org/docs/reference/nodejs-support) y [Getting started](https://hardhat.org/docs/getting-started).
* **npm** o **pnpm/yarn**.
* Dependencias (ya en `package.json`): `hardhat`, `@nomicfoundation/hardhat-ethers`, `ethers@^6`, `@openzeppelin/contracts`.
* Opcional para variables: `dotenv` o `cross-env`.

> Documentación oficial útil
>
> * Hardhat: [Getting started](https://hardhat.org/docs/getting-started), [Ignition + Ethers](https://hardhat.org/ignition/docs/guides/ethers)
> * Ethers v6 (hashing): [Cryptographic Functions](https://docs.ethers.org/v6/api/crypto/)
> * OpenZeppelin AccessControl: [docs](https://docs.openzeppelin.com/contracts/4.x/access-control)
> * Variables de entorno: [PowerShell](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables), [CMD `set`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/set_1), [Node `process.env`](https://nodejs.org/api/environment_variables.html)

---

## 📁 Estructura relevante

```
contracts/
  Voting.sol
scripts/
  deploy.ts
  create.ts
  enroll.ts
  vote.text.ts
  tally.hash.ts
  myvote.ts
  lib/helpers.ts
test/
  voting.test.ts
```

---

## 1) Instalar & compilar

```bash
npm install
npm run build   # alias de: hardhat compile
```

**Si ves un aviso de Node no soportado**, instala Node ≥ 22.10.0 y vuelve a intentar.

---

## 2) Levantar nodo local y desplegar

En **terminal 1**:

```bash
npm run node    # alias de: hardhat node
```

En **terminal 2** (misma carpeta del proyecto):

```bash
npm run deploy  # ejecuta scripts/deploy.ts --network localhost
```

La salida mostrará algo como:

```
Deployer: 0x...
Voting deployed at: 0xABCDEF...
```

Copia esa **dirección de contrato** para los pasos siguientes.

---

## 3) Variables de entorno (elige tu shell)

Estas variables son leídas por los scripts (`process.env.*`).

### Windows — **CMD**

```bat
set CONTRACT=0xABCDEF...
set CODE_HUMAN=ES-GENERALES-2026
set META=Elecciones Generales 2026
set START=1730000000
set END=1730003600
```

### Windows — **PowerShell**

```powershell
$env:CONTRACT = "0xABCDEF..."
$env:CODE_HUMAN = "ES-GENERALES-2026"
$env:META       = "Elecciones Generales 2026"
$env:START      = "1730000000"
$env:END        = "1730003600"
```

### macOS/Linux — **bash/zsh**

```bash
export CONTRACT=0xABCDEF...
export CODE_HUMAN=ES-GENERALES-2026
export META="Elecciones Generales 2026"
export START=1730000000
export END=1730003600
```

> Alternativas:
>
> * `.env` con `dotenv` (añade `import "dotenv/config"` al inicio de cada script)
> * `cross-env` en scripts de `package.json`.

---

## 4) Crear una elección (registrar la cuestión)

Necesitas tener `CONTRACT`, `CODE_HUMAN`, `META`, `START`, `END` (y opcional `ALLOW_CHANGE=true|false`, por defecto `true`).

```bash
npm run create --network localhost
```

Este script llama a `Voting.createElection(code, meta, start, end, allowChange)`.

**Notas**

* `CODE_HUMAN` es cualquier identificador legible (p.ej. `ES-GENERALES-2026`). En el script se convierte a `bytes32` con `keccak256(toUtf8Bytes(humanId))` (Ethers v6).
* `START` / `END` son **epoch (segundos)**.

---

## 5) Registrar votante en esa elección (enroll)

Variables requeridas: `CONTRACT`, `CODE_HUMAN`, `VOTER_SECRET` (tu secreto fuera de cadena). El script lo hashea como `voterHash`.

```bash
# Definir el secreto
# CMD
set VOTER_SECRET=dni|fecha|secreto
# PowerShell
# $env:VOTER_SECRET = "dni|fecha|secreto"
# bash/zsh
# export VOTER_SECRET="dni|fecha|secreto"

npm run enroll --network localhost
```

Esto invoca `Voting.enroll(code, voterHash)`.

---

## 6) Votar con **texto libre**

Variables: `CONTRACT`, `CODE_HUMAN`, `VOTER_SECRET`, `VOTE_TEXT` (p.ej. `"PSOE"`, `"PP"`, `"Sí reforma"`).

```bash
# CMD
set VOTE_TEXT=PSOE
npm run vote:text --network localhost
```

El contrato calcula `keccak256(bytes(voteText))` y actualiza el recuento por **hash**. Si la elección permite cambio (`allowChange=true`), el **último voto** sustituye al anterior.

---

## 7) Recuento por opción (texto)

Variables: `CONTRACT`, `CODE_HUMAN`, `OPTION_TEXT`.

```bash
# CMD
set OPTION_TEXT=PSOE
npm run tally:hash --network localhost
```

El script hashea `OPTION_TEXT` con la misma normalización (minúsculas + trim) y consulta `Voting.tallyByHash(code, voteHash)`.

---

## 8) Verificar tu propio voto (hash)

Variables: `CONTRACT`, `CODE_HUMAN`, `VOTER_SECRET`.

```bash
npm run myvote --network localhost
```

Devuelve tu **hash de voto** almacenado (`Voting.myVoteHash(code, voterHash)`).

---

## 9) Ejecutar tests

```bash
npm test
```

El test `test/voting.test.ts` cubre: crear elección, enroll, votar texto, cambiar voto, lecturas.

---

## 🔐 Seguridad y buenas prácticas

* **Roles**: la creación de elecciones está protegida por `AccessControl` (sólo `ADMIN_ROLE`). Ver [OpenZeppelin – AccessControl](https://docs.openzeppelin.com/contracts/4.x/access-control).
* **Privacidad**: no se guarda el texto del voto, sólo su **hash** (`keccak256`). Ethers v6: [Cryptographic Functions](https://docs.ethers.org/v6/api/crypto/).
* **Hash de múltiples dinámicos**: si en el futuro combinas varios strings/bytes para el hash (p. ej. *commit–reveal*), usa `abi.encode(...)` antes de `keccak256(...)` para evitar colisiones de `abi.encodePacked(...)` con tipos dinámicos (ver notas de la especificación ABI de Solidity).

---

## 🛠️ Solución de problemas

* **"export no se reconoce" en Windows** → usa `set` (CMD) o `$env:` (PowerShell). Ver: [CMD set](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/set_1), [PowerShell env](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables).
* **`Cannot find module './lib/helpers.js'`** → estás importando con `.js` pero el archivo es TS. En los scripts usa `import ... from "./lib/helpers"` (sin extensión) o `"./lib/helpers.ts"`.
* **`getSigners is not a function/undefined`** → en Hardhat 3 usa el patrón `const connection = await hre.network.connect(); const { ethers } = connection; const [signer] = await ethers.getSigners();`.
* **Node no soportado / errores extraños** → asegúrate de usar Node ≥ 22.10.0. Ver: [Node.js support](https://hardhat.org/docs/reference/nodejs-support).

---

## 📜 Licencia

MIT (o la que definas para tu proyecto).
