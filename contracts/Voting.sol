// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Voting: elecciones por código, papeleta de texto (se guarda el hash)
contract Voting is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Election {
        bytes32 code;            // Código de la cuestión (p.ej. keccak256("ES-GENERALES-2026"))
        string  meta;            // Título/pregunta legible
        uint64  start;           // Ventana [start, end)
        uint64  end;
        bool    allowChange;     // ¿permitir cambiar el voto?
        bool    exists;

        // Estado por ELECCIÓN (clave = voterHash)
        mapping(bytes32 => bool)    registered;      // solicitud/registro
        mapping(bytes32 => bytes32) voteOf;          // último hash del texto votado
        mapping(bytes32 => uint256) tally;           // recuento por hash del texto
    }

    mapping(bytes32 => Election) private elections;

    event ElectionCreated(bytes32 indexed code, string meta, uint64 start, uint64 end, bool allowChange);
    event VoterEnrolled(bytes32 indexed code, bytes32 indexed voterHash);
    event VoteCast(bytes32 indexed code, bytes32 indexed voterHash, bytes32 voteHash, bool changed);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // ADMIN: crea una cuestión identificada por su "code"
    function createElection(
        bytes32 code,
        string calldata meta,
        uint64 start,
        uint64 end,
        bool allowChange
    ) external onlyRole(ADMIN_ROLE) {
        require(!elections[code].exists, "code exists");
        require(start < end, "invalid window");
        Election storage e = elections[code];
        e.code = code;
        e.meta = meta;
        e.start = start;
        e.end = end;
        e.allowChange = allowChange;
        e.exists = true;
        emit ElectionCreated(code, meta, start, end, allowChange);
    }

    // Registro: el votante se da de alta con su hash (no se expone su identidad)
    function enroll(bytes32 code, bytes32 voterHash) external {
        Election storage e = elections[code];
        require(e.exists, "unknown code");
        require(block.timestamp < e.end, "election ended");
        e.registered[voterHash] = true;
        emit VoterEnrolled(code, voterHash);
    }

    // Emite (o cambia) voto: el texto se hashea y sólo guardamos el hash
    function castVote(bytes32 code, bytes32 voterHash, string calldata voteText) external {
        Election storage e = elections[code];
        require(e.exists, "unknown code");
        require(block.timestamp >= e.start && block.timestamp < e.end, "not open");
        require(e.registered[voterHash], "not enrolled");

        // Guardamos únicamente el hash del texto (keccak256(bytes(voteText)))
        // Si en el futuro combinas múltiples dinámicos, usa abi.encode(...) para evitar colisiones.
        bytes32 newHash = keccak256(bytes(voteText));

        bytes32 oldHash = e.voteOf[voterHash];
        bool changed = false;

        if (oldHash != bytes32(0)) {
            require(e.allowChange, "changes disabled");
            uint256 prev = e.tally[oldHash];
            if (prev > 0) e.tally[oldHash] = prev - 1;
            changed = true;
        }

        e.voteOf[voterHash] = newHash;
        e.tally[newHash] += 1;

        emit VoteCast(code, voterHash, newHash, changed);
    }

    // Lecturas
    function getElection(bytes32 code)
        external
        view
        returns (string memory meta, uint64 start, uint64 end, bool allowChange, bool exists)
    {
        Election storage e = elections[code];
        return (e.meta, e.start, e.end, e.allowChange, e.exists);
    }

    function isEnrolled(bytes32 code, bytes32 voterHash) external view returns (bool) {
        return elections[code].registered[voterHash];
    }

    function myVoteHash(bytes32 code, bytes32 voterHash) external view returns (bytes32) {
        return elections[code].voteOf[voterHash];
    }

    function tallyByHash(bytes32 code, bytes32 voteHash) external view returns (uint256) {
        return elections[code].tally[voteHash];
    }
}
