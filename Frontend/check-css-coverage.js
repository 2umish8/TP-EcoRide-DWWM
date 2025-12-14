#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendPath = __dirname
const cssPath = path.join(frontendPath, 'src/assets/css')
const srcPath = path.join(frontendPath, 'src')

console.log('\n📊 Analyse de couverture CSS - Phase 1.2\n')

// Extraire les classes CSS disponibles
const cssClasses = new Set()
const cssFiles = globSync(`${cssPath}/**/*.css`)

cssFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8')
  const matches = content.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)\s*[\s{:,>+~[]/g)
  for (const match of matches) {
    cssClasses.add(match[1])
  }
})

// Extraire les classes utilisées dans les templates
const usedClasses = new Map()
const vueFiles = globSync(`${srcPath}/**/*.vue`)

vueFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8')
  const matches = content.matchAll(/class="([^"]+)"/g)
  for (const match of matches) {
    const classes = match[1].split(/\s+/)
    classes.forEach((cls) => {
      if (cls && !cls.match(/[{}()\$:;,]/)) {
        usedClasses.set(cls, (usedClasses.get(cls) || 0) + 1)
      }
    })
  }
})

// Identifier les classes manquantes
const prefixPattern =
  /^(col|btn|mt|mb|pt|pb|px|py|mx|my|ml|mr|pl|pr|text|bg|border|gap|w|h|d|m|p|me|ms)/
const missing = Array.from(usedClasses.keys())
  .filter((cls) => !cssClasses.has(cls) && !prefixPattern.test(cls))
  .sort()

const coverage =
  Math.round(((usedClasses.size - missing.length) / usedClasses.size) * 100 * 10) / 10

console.log(`   Classes CSS disponibles: ${cssClasses.size}`)
console.log(`   Classes utilisées: ${usedClasses.size}`)
console.log(`   Classes manquantes: ${missing.length}`)
console.log(`   Couverture: ${coverage}%\n`)

if (missing.length > 0) {
  console.log(`   Top 20 classes manquantes:\n`)
  missing.slice(0, 20).forEach((cls) => {
    console.log(`     ❌ ${cls}`)
  })
  console.log('')
}
