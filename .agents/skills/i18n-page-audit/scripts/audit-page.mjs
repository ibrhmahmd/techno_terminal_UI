#!/usr/bin/env node

/**
 * Universal i18n Page & Component Auditor
 * 
 * Zero-dependency Node.js script for auditing localization in React / Next.js / Vite / SPA projects.
 * 
 * Features:
 *  1. Hardcoded string detection in JSX elements & common string props
 *  2. Unwired component detection (missing useTranslation or similar i18n hook)
 *  3. Per-component namespace key resolution
 *  4. Missing translation keys (in code vs source/target locale JSON files)
 *  5. Interpolation variable mismatches ({{var}} differences between languages)
 *  6. Directional CSS / BiDi layout checks (flags physical classes like ml-, mr-, left- in favor of ms-, me-, start-)
 *  7. Directional icon flipping checks (flags chevron/arrow icons without RTL flip class)
 */

import fs from 'fs'
import path from 'path'

// --- Configuration & CLI Args ---

const args = process.argv.slice(2)

function getArg(name, defaultValue = null) {
  const idx = args.indexOf(`--${name}`)
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1]
  }
  return defaultValue
}

const hasFlag = (name) => args.includes(`--${name}`)

const PAGE_ARG = getArg('page')
const LOCALE_DIR_ARG = getArg('locale-dir')
const SOURCE_LANG = getArg('source-lang', 'en')
const TARGET_LANG = getArg('target-lang', 'ar')
const NAMESPACE_ARG = getArg('namespace')
const OUTPUT_JSON = hasFlag('json')
const OUTPUT_MD = hasFlag('markdown')

// --- Auto-Detection Helpers ---

function findProjectRoot(startDir = process.cwd()) {
  let current = path.resolve(startDir)
  while (current !== path.parse(current).root) {
    if (fs.existsSync(path.join(current, 'package.json'))) {
      return current
    }
    current = path.dirname(current)
  }
  return process.cwd()
}

const ROOT_DIR = findProjectRoot()

function detectLocaleDir() {
  if (LOCALE_DIR_ARG) {
    const p = path.resolve(ROOT_DIR, LOCALE_DIR_ARG)
    if (fs.existsSync(p)) return p
  }

  const candidates = [
    'src/locales',
    'locales',
    'public/locales',
    'src/assets/locales',
    'messages',
    'src/messages',
    'lang',
    'src/lang'
  ]

  for (const candidate of candidates) {
    const full = path.join(ROOT_DIR, candidate)
    if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
      return full
    }
  }
  return null
}

function loadJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch (err) {
    return null
  }
}

function flattenObject(obj, prefix = '') {
  const result = {}
  if (!obj || typeof obj !== 'object') return result

  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], fullKey))
    } else {
      result[fullKey] = obj[key]
    }
  }
  return result
}

// --- Component Tree Traversal ---

function resolveImportPath(currentFile, importSpecifier) {
  if (!importSpecifier.startsWith('.')) {
    return null
  }

  const dir = path.dirname(currentFile)
  const basePath = path.resolve(dir, importSpecifier)

  const extensions = ['.tsx', '.jsx', '/index.tsx', '/index.jsx']
  for (const ext of extensions) {
    const candidate = basePath + ext
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate
    }
  }
  return null
}

function getImportedLocalComponents(entryFile, visited = new Set()) {
  const files = []
  if (/\.(tsx|jsx)$/.test(entryFile)) {
    files.push(entryFile)
  }
  visited.add(entryFile)

  try {
    const content = fs.readFileSync(entryFile, 'utf-8')
    const importRegex = /(?:import\s+(?:[\w*\s{},]+)\s+from\s+['"]([^'"]+)['"])|(?:import\(['"]([^'"]+)['"]\))/g
    let match

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2]
      if (importPath && importPath.startsWith('.')) {
        const resolved = resolveImportPath(entryFile, importPath)
        if (resolved && !visited.has(resolved)) {
          files.push(...getImportedLocalComponents(resolved, visited))
        }
      }
    }
  } catch (err) {
    // ignore read errors
  }

  return Array.from(new Set(files))
}

// Known icon tokens to ignore in JSX text
const ICON_TOKENS = new Set([
  'arrow_forward', 'arrow_back', 'arrow_upward', 'arrow_downward', 'chevron_right', 'chevron_left',
  'close', 'check', 'check_circle', 'cancel', 'menu', 'menu_book', 'person', 'person_add', 'people',
  'group', 'groups', 'calendar_today', 'event', 'event_note', 'event_busy', 'how_to_reg', 'refresh',
  'save', 'edit', 'delete', 'restore', 'add', 'remove', 'payments', 'payment', 'analytics', 'error',
  'warning', 'info', 'help', 'search', 'filter_list', 'expand_more', 'expand_less', 'more_vert',
  'more_horiz', 'logout', 'login', 'lock', 'visibility', 'visibility_off', 'notifications',
  'school', 'history', 'file_download', 'download', 'upload', 'settings', 'trending_up', 'trending_down'
])

const STRING_PROPS = ['placeholder', 'title', 'aria-label', 'alt', 'label', 'helperText']
const DIRECTIONAL_CLASSES = [
  { pattern: /\bml-(\d+|px|auto)\b/g, suggestion: 'ms-$1' },
  { pattern: /\bmr-(\d+|px|auto)\b/g, suggestion: 'me-$1' },
  { pattern: /\bpl-(\d+|px)\b/g, suggestion: 'ps-$1' },
  { pattern: /\bpr-(\d+|px)\b/g, suggestion: 'pe-$1' },
  { pattern: /\bleft-(\d+|px|auto|full)\b/g, suggestion: 'start-$1' },
  { pattern: /\bright-(\d+|px|auto|full)\b/g, suggestion: 'end-$1' },
  { pattern: /\btext-left\b/g, suggestion: 'text-start' },
  { pattern: /\btext-right\b/g, suggestion: 'text-end' }
]

const DIRECTIONAL_ICONS = ['arrow_forward', 'arrow_back', 'chevron_right', 'chevron_left', 'navigate_next', 'navigate_before']

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const relativePath = path.relative(ROOT_DIR, filePath)

  const isJsxFile = /\.(tsx|jsx)$/.test(filePath)

  const findings = {
    file: relativePath,
    isJsx: isJsxFile,
    hasI18nHook: /useTranslation\s*\(/g.test(content) || /useI18n\s*\(/g.test(content),
    detectedNamespaces: [],
    hardcodedStrings: [],
    usedKeysWithNs: [],
    directionalCssWarnings: [],
    unflippedIcons: []
  }

  // Detect namespaces from useTranslation('ns')
  const nsRegex = /useTranslation\s*\(\s*(?:['"]([^'"]+)['"]|\[([^\]]+)\])/g
  let nsMatch
  while ((nsMatch = nsRegex.exec(content)) !== null) {
    if (nsMatch[1]) {
      findings.detectedNamespaces.push(nsMatch[1])
    } else if (nsMatch[2]) {
      const list = nsMatch[2].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean)
      findings.detectedNamespaces.push(...list)
    }
  }

  const defaultNs = findings.detectedNamespaces[0] || NAMESPACE_ARG || 'common'

  // Detect used keys: t('some.key') or t('ns:some.key')
  const tKeyRegex = /\bt\(\s*['"]([^'"]+)['"]/g
  let keyMatch
  while ((keyMatch = tKeyRegex.exec(content)) !== null) {
    const rawKey = keyMatch[1]
    let ns = defaultNs
    let cleanKey = rawKey

    if (rawKey.includes(':')) {
      const parts = rawKey.split(':')
      ns = parts[0]
      cleanKey = parts.slice(1).join(':')
    }

    findings.usedKeysWithNs.push({
      key: cleanKey,
      rawKey,
      namespace: ns
    })
  }

  if (!isJsxFile) return findings

  lines.forEach((line, idx) => {
    const lineNum = idx + 1
    const trimmed = line.trim()

    if (trimmed.startsWith('import ') || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('console.')) {
      return
    }

    // 1. String Props
    for (const prop of STRING_PROPS) {
      const propRegex = new RegExp(`\\b${prop}=["']([^"'{}>]+)["']`, 'g')
      let pMatch
      while ((pMatch = propRegex.exec(line)) !== null) {
        const val = pMatch[1].trim()
        if (val && !val.startsWith('{') && !val.includes('{{') && !/^[0-9\-_./:#]+$/.test(val) && val.length > 1 && !ICON_TOKENS.has(val)) {
          findings.hardcodedStrings.push({
            line: lineNum,
            type: `prop:${prop}`,
            text: val,
            snippet: trimmed
          })
        }
      }
    }

    // 2. Raw JSX Text
    const jsxTextRegex = />\s*([A-Za-z][A-Za-z0-9\s,.'!?:;()\-_/]+)\s*</g
    let textMatch
    while ((textMatch = jsxTextRegex.exec(line)) !== null) {
      const rawText = textMatch[1].trim()
      if (rawText.length > 2 && !ICON_TOKENS.has(rawText) && !rawText.startsWith('&') && !/^[0-9\s.:\-_/]+$/.test(rawText) && !['div', 'span', 'svg', 'path', 'button', 'input', 'null', 'undefined', 'true', 'false'].includes(rawText.toLowerCase())) {
        findings.hardcodedStrings.push({
          line: lineNum,
          type: 'jsx-text',
          text: rawText,
          snippet: trimmed
        })
      }
    }

    // 3. Directional CSS
    for (const { pattern, suggestion } of DIRECTIONAL_CLASSES) {
      pattern.lastIndex = 0
      if (pattern.test(line)) {
        findings.directionalCssWarnings.push({
          line: lineNum,
          match: line.match(pattern)?.[0],
          suggestion,
          snippet: trimmed
        })
      }
    }

    // 4. Directional Icons
    for (const icon of DIRECTIONAL_ICONS) {
      if (line.includes(icon) && !line.includes('icon-flip-rtl') && !line.includes('rtl:rotate') && !line.includes('rtl:scale') && !line.includes('scaleX(-1)')) {
        findings.unflippedIcons.push({
          line: lineNum,
          icon,
          snippet: trimmed
        })
      }
    }
  })

  return findings
}

// --- Runner ---

function runAudit() {
  const localeDir = detectLocaleDir()

  let targetFiles = []
  if (PAGE_ARG) {
    const resolvedPage = path.resolve(ROOT_DIR, PAGE_ARG)
    if (!fs.existsSync(resolvedPage)) {
      console.error(`Error: Specified page file not found: ${PAGE_ARG}`)
      process.exit(1)
    }
    targetFiles = getImportedLocalComponents(resolvedPage)
  } else {
    const pagesDir = path.join(ROOT_DIR, 'src', 'pages')
    if (fs.existsSync(pagesDir)) {
      targetFiles = fs.readdirSync(pagesDir)
        .filter(f => /\.(tsx|jsx)$/.test(f))
        .map(f => path.join(pagesDir, f))
    } else {
      console.error('Error: No --page specified and src/pages directory not found.')
      process.exit(1)
    }
  }

  const fileReports = targetFiles.map(analyzeFile)

  const allNamespaces = new Set()
  fileReports.forEach(r => {
    r.detectedNamespaces.forEach(ns => allNamespaces.add(ns))
    r.usedKeysWithNs.forEach(item => allNamespaces.add(item.namespace))
  })

  if (NAMESPACE_ARG) {
    allNamespaces.add(NAMESPACE_ARG)
  }

  const flatLocales = { source: {}, target: {} }

  if (localeDir) {
    for (const ns of allNamespaces) {
      const srcFile = path.join(localeDir, SOURCE_LANG, `${ns}.json`)
      const tgtFile = path.join(localeDir, TARGET_LANG, `${ns}.json`)

      flatLocales.source[ns] = flattenObject(loadJsonSafe(srcFile) || {})
      flatLocales.target[ns] = flattenObject(loadJsonSafe(tgtFile) || {})
    }
  }

  const missingKeys = []
  const checkedKeySet = new Set()

  fileReports.forEach(file => {
    file.usedKeysWithNs.forEach(({ key, namespace }) => {
      const uniqueId = `${namespace}:${key}`
      if (checkedKeySet.has(uniqueId)) return
      checkedKeySet.add(uniqueId)

      const srcMap = flatLocales.source[namespace] || {}
      const tgtMap = flatLocales.target[namespace] || {}

      const inSrc = srcMap[key] !== undefined
      const inTgt = tgtMap[key] !== undefined

      if (!inSrc) {
        missingKeys.push({ namespace, key, file: file.file, missingIn: SOURCE_LANG })
      }
      if (!inTgt) {
        missingKeys.push({ namespace, key, file: file.file, missingIn: TARGET_LANG })
      }
    })
  })

  const interpolationMismatches = []
  for (const ns of allNamespaces) {
    const srcMap = flatLocales.source[ns] || {}
    const tgtMap = flatLocales.target[ns] || {}

    for (const key of Object.keys(srcMap)) {
      if (tgtMap[key] !== undefined) {
        const srcVars = (String(srcMap[key]).match(/\{\{([^}]+)\}\}/g) || []).sort()
        const tgtVars = (String(tgtMap[key]).match(/\{\{([^}]+)\}\}/g) || []).sort()

        if (srcVars.join(',') !== tgtVars.join(',')) {
          interpolationMismatches.push({
            namespace: ns,
            key,
            sourceVars: srcVars,
            targetVars: tgtVars,
            sourceValue: srcMap[key],
            targetValue: tgtMap[key]
          })
        }
      }
    }
  }

  const summary = {
    target: PAGE_ARG || 'All Pages',
    scannedFilesCount: fileReports.length,
    localesDirectory: localeDir ? path.relative(ROOT_DIR, localeDir) : 'Not found',
    sourceLanguage: SOURCE_LANG,
    targetLanguage: TARGET_LANG,
    detectedNamespaces: Array.from(allNamespaces),
    totalHardcodedStrings: fileReports.reduce((sum, f) => sum + f.hardcodedStrings.length, 0),
    totalMissingKeys: missingKeys.length,
    totalInterpolationMismatches: interpolationMismatches.length,
    totalDirectionalWarnings: fileReports.reduce((sum, f) => sum + f.directionalCssWarnings.length, 0),
    totalUnflippedIcons: fileReports.reduce((sum, f) => sum + f.unflippedIcons.length, 0),
    files: fileReports,
    missingKeys,
    interpolationMismatches
  }

  if (OUTPUT_JSON) {
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  if (OUTPUT_MD) {
    printMarkdownReport(summary)
    return
  }

  printCliReport(summary)
}

function printCliReport(s) {
  console.log('\n======================================================')
  console.log(' 🌐  UNIVERSAL i18n PAGE & COMPONENT AUDIT REPORT')
  console.log('======================================================')
  console.log(` Target:              ${s.target}`)
  console.log(` Scanned Files:       ${s.scannedFilesCount}`)
  console.log(` Locales Directory:   ${s.localesDirectory}`)
  console.log(` Languages:           ${s.sourceLanguage} (Source) -> ${s.targetLanguage} (Target)`)
  console.log(` Namespaces:          ${s.detectedNamespaces.join(', ') || 'None'}`)
  console.log('------------------------------------------------------')
  console.log(` 🔴 Hardcoded Strings:          ${s.totalHardcodedStrings}`)
  console.log(` 🟡 Missing Translation Keys:   ${s.totalMissingKeys}`)
  console.log(` 🟣 Interpolation Mismatches:   ${s.totalInterpolationMismatches}`)
  console.log(` 🔵 Directional (BiDi) CSS:     ${s.totalDirectionalWarnings}`)
  console.log(` 🟢 Directional Icons Unflipped:${s.totalUnflippedIcons}`)
  console.log('======================================================\n')

  s.files.forEach(f => {
    if (f.hardcodedStrings.length > 0 || (!f.hasI18nHook && f.isJsx) || f.directionalCssWarnings.length > 0 || f.unflippedIcons.length > 0) {
      console.log(`📄 \x1b[1m${f.file}\x1b[0m ${!f.hasI18nHook && f.isJsx ? '\x1b[31m[UNWIRED - Missing useTranslation]\x1b[0m' : ''}`)

      if (f.hardcodedStrings.length > 0) {
        console.log('   \x1b[33mHardcoded Strings:\x1b[0m')
        f.hardcodedStrings.slice(0, 10).forEach(h => {
          console.log(`     L${h.line} [${h.type}] "${h.text}"`)
        })
        if (f.hardcodedStrings.length > 10) {
          console.log(`     ...and ${f.hardcodedStrings.length - 10} more`)
        }
      }

      if (f.directionalCssWarnings.length > 0) {
        console.log('   \x1b[36mDirectional CSS (prefer logical ms-/me-/start-):\x1b[0m')
        f.directionalCssWarnings.slice(0, 5).forEach(d => {
          console.log(`     L${d.line} \x1b[31m${d.match}\x1b[0m -> suggest \x1b[32m${d.suggestion}\x1b[0m`)
        })
      }

      if (f.unflippedIcons.length > 0) {
        console.log('   \x1b[35mDirectional Icons missing RTL flip class:\x1b[0m')
        f.unflippedIcons.forEach(i => {
          console.log(`     L${i.line} Icon: "${i.icon}" (add .icon-flip-rtl or rtl:rotate-180)`)
        })
      }
      console.log('')
    }
  })

  if (s.missingKeys.length > 0) {
    console.log('\x1b[31m❌ MISSING KEYS IN LOCALE JSON:\x1b[0m')
    s.missingKeys.forEach(m => {
      console.log(`   - [${m.namespace}] "${m.key}" (missing in ${m.missingIn}) [${m.file}]`)
    })
    console.log('')
  }

  if (s.interpolationMismatches.length > 0) {
    console.log('\x1b[35m⚠️  INTERPOLATION VARIABLE MISMATCHES:\x1b[0m')
    s.interpolationMismatches.forEach(m => {
      console.log(`   - [${m.namespace}] "${m.key}"`)
      console.log(`       ${s.sourceLanguage}: ${m.sourceValue} (Vars: ${m.sourceVars.join(', ')})`)
      console.log(`       ${s.targetLanguage}: ${m.targetValue} (Vars: ${m.targetVars.join(', ')})`)
    })
    console.log('')
  }
}

function printMarkdownReport(s) {
  console.log(`# i18n Audit Report: ${s.target}\n`)
  console.log(`- **Scanned Files**: ${s.scannedFilesCount}`)
  console.log(`- **Locales Directory**: \`${s.localesDirectory}\``)
  console.log(`- **Languages**: \`${s.sourceLanguage}\` (Source) -> \`${s.targetLanguage}\` (Target)`)
  console.log(`- **Namespaces**: ${s.detectedNamespaces.map(n => `\`${n}\``).join(', ')}\n`)
  console.log('## Summary of Findings\n')
  console.log('| Category | Count |')
  console.log('|----------|-------|')
  console.log(`| 🔴 Hardcoded Strings | ${s.totalHardcodedStrings} |`)
  console.log(`| 🟡 Missing Keys | ${s.totalMissingKeys} |`)
  console.log(`| 🟣 Interpolation Mismatches | ${s.totalInterpolationMismatches} |`)
  console.log(`| 🔵 Directional CSS | ${s.totalDirectionalWarnings} |`)
  console.log(`| 🟢 Unflipped Directional Icons | ${s.totalUnflippedIcons} |\n`)

  console.log('## File Details\n')
  s.files.forEach(f => {
    if (f.hardcodedStrings.length > 0 || !f.hasI18nHook || f.directionalCssWarnings.length > 0) {
      console.log(`### \`${f.file}\` ${!f.hasI18nHook ? '*(Unwired)*' : ''}\n`)
      if (f.hardcodedStrings.length > 0) {
        console.log('**Hardcoded Strings:**')
        f.hardcodedStrings.forEach(h => console.log(`- L${h.line} \`[${h.type}]\`: "${h.text}"`))
        console.log('')
      }
      if (f.directionalCssWarnings.length > 0) {
        console.log('**Directional CSS Suggestions:**')
        f.directionalCssWarnings.forEach(d => console.log(`- L${d.line}: replace \`${d.match}\` with \`${d.suggestion}\``))
        console.log('')
      }
    }
  })
}

runAudit()
