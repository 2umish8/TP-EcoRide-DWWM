#!/usr/bin/env node

/**
 * Script pour convertir automatiquement les requêtes SQL brutes vers Prisma
 * dans tous les contrôleurs du projet EcoRide
 */

const fs = require("fs");
const path = require("path");

const controllersDir = path.join(__dirname, "controllers");

// Patterns de remplacement pour les requêtes SQL communes
const replacements = [
    // Requêtes SELECT simples
    {
        pattern:
            /const \[(\w+)\] = await db\.query\("SELECT \* FROM (\w+) WHERE (\w+) = \?", \[([^\]]+)\]\);/g,
        replacement: "const $1 = await db.$2.findMany({ where: { $3: $4 } });",
    },
    {
        pattern:
            /const \[\[(\w+)\]\] = await db\.query\("SELECT \* FROM (\w+) WHERE (\w+) = \?", \[([^\]]+)\]\);/g,
        replacement: "const $1 = await db.$2.findFirst({ where: { $3: $4 } });",
    },

    // Requêtes INSERT
    {
        pattern:
            /const \[(\w+)\] = await db\.query\("INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)", \[([^\]]+)\]\);/g,
        replacement:
            "const $1 = await db.$2.create({ data: { /* TODO: map fields */ } });",
    },

    // Requêtes UPDATE
    {
        pattern:
            /const \[(\w+)\] = await db\.query\("UPDATE (\w+) SET ([^"]+) WHERE (\w+) = \?", \[([^\]]+)\]\);/g,
        replacement:
            "const $1 = await db.$2.update({ where: { $4: /* TODO: add where value */ }, data: { /* TODO: map fields */ } });",
    },

    // Requêtes DELETE
    {
        pattern:
            /const \[(\w+)\] = await db\.query\("DELETE FROM (\w+) WHERE (\w+) = \?", \[([^\]]+)\]\);/g,
        replacement: "const $1 = await db.$2.delete({ where: { $3: $4 } });",
    },

    // Requêtes COUNT
    {
        pattern:
            /const \[\[(\w+)\]\] = await db\.query\("SELECT COUNT\(\*\) as count FROM (\w+) WHERE (\w+) = \?", \[([^\]]+)\]\);/g,
        replacement:
            "const $1Count = await db.$2.count({ where: { $3: $4 } }); const $1 = { count: $1Count };",
    },
];

function convertFile(filePath) {
    console.log(`Converting ${filePath}...`);

    let content = fs.readFileSync(filePath, "utf8");

    // Ajouter l'import PrismaClientKnownRequestError si nécessaire
    if (
        content.includes("db.query") &&
        !content.includes("PrismaClientKnownRequestError")
    ) {
        content = content.replace(
            'const db = require("../Config/db.js");',
            'const db = require("../Config/db.js");\nconst { PrismaClientKnownRequestError } = require("../generated/prisma");'
        );
    }

    // Appliquer les remplacements
    replacements.forEach(({ pattern, replacement }) => {
        content = content.replace(pattern, replacement);
    });

    // Remplacer les erreurs MySQL par Prisma
    content = content.replace(
        /error\.code === "ER_DUP_ENTRY"/g,
        "error instanceof PrismaClientKnownRequestError && error.code === 'P2002'"
    );

    // Remplacer result.affectedRows par des vérifications d'existence
    content = content.replace(/result\.affectedRows > 0/g, "result");

    // Ajouter des commentaires TODO pour les requêtes complexes
    content = content.replace(
        /db\.query\(/g,
        "// TODO: Convert to Prisma\n        db.query("
    );

    fs.writeFileSync(filePath, content);
    console.log(`✅ Converted ${filePath}`);
}

// Convertir tous les fichiers dans le dossier controllers
const controllerFiles = fs
    .readdirSync(controllersDir)
    .filter((file) => file.endsWith(".js"))
    .map((file) => path.join(controllersDir, file));

console.log("🔄 Starting conversion of controllers to Prisma...\n");

controllerFiles.forEach(convertFile);

console.log(
    "\n✨ Conversion completed! Please review the TODO comments and test thoroughly."
);
console.log("📝 Manual adjustments may be needed for complex queries.");
