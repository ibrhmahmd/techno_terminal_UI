# Quickstart: Arabic i18n/RTL Support

**Date**: 2026-08-24
**Feature**: Arabic i18n/RTL Support

## Overview

This feature adds bilingual (EN/AR) support to the Techno Terminal UI. Users toggle language in Settings — the UI re-renders instantly in the selected language with correct RTL layout.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
# Install i18n dependencies
npm install react-i18next i18next i18next-browser-languagedetector

# No other dependencies needed — Tailwind 3.4 has native logical property support
```

## Architecture

```
src/
├── i18n/
│   ├── index.ts              # i18next configuration
│   └── locales/
│       ├── en/common.json    # English translations
│       └── ar/common.json    # Arabic translations
├── store/
│   └── settingsStore.ts      # Locale state (Zustand)
└── components/
    └── settings/
        └── LanguageSettings.tsx  # Language switcher UI
```

## Key Files

| File | Purpose |
|------|---------|
| `src/i18n/index.ts` | i18next initialization, namespace config, fallback |
| `src/store/settingsStore.ts` | Locale state, persistence, cross-tab sync |
| `src/locales/en/common.json` | English translations (all namespaces) |
| `src/locales/ar/common.json` | Arabic translations (all namespaces) |
| `src/App.tsx` | HTML `lang`/`dir` sync, Suspense boundary |
| `src/main.tsx` | Import i18n config |
| `index.html` | Noto Sans Arabic font loading |
| `tailwind.config.js` | Font fallback for Arabic |

## Usage Pattern

```tsx
// In any component:
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation('finance')  // namespace
  return <h1>{t('receipt.create')}</h1>    // key
}
```

## RTL Conversion

Convert physical → logical Tailwind classes:

| Physical | Logical |
|----------|---------|
| `ml-*` | `ms-*` |
| `mr-*` | `me-*` |
| `pl-*` | `ps-*` |
| `pr-*` | `pe-*` |
| `left-*` | `start-*` |
| `right-*` | `end-*` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `border-l-*` | `border-s-*` |
| `border-r-*` | `border-e-*` |
| `rounded-l-*` | `rounded-s-*` |
| `rounded-r-*` | `rounded-e-*` |

## Phases

1. **Phase 0: Infrastructure** — i18n config, settingsStore, language switcher, font loading
2. **Phase 1: Finance/Receipts** — Extract ~34 strings, convert RTL, remove ad-hoc `dir="rtl"`
3. **Phase 2: Bulk Extraction** — Extract ~1,490 strings across all pages/components
4. **Phase 3: RTL CSS** — Convert remaining ~267 directional classes
5. **Phase 4: Icons & Keyboards** — Flip directional icons, swap keyboard handlers

## Testing

```bash
# Run tests
npm run test

# Run single test file
npm run test -- src/tests/MyTest.test.tsx

# Lint
npm run lint

# Build
npm run build
```

## Manual Testing Checklist

- [ ] Toggle EN ↔ AR in Settings
- [ ] Verify all finance receipt strings translate
- [ ] Verify RTL layout mirrors (sidebar right, text right-aligned)
- [ ] Verify language persists across browser sessions
- [ ] Verify cross-tab sync works
- [ ] Verify no hardcoded English strings in Arabic mode
- [ ] Verify directional icons flip
- [ ] Verify keyboard arrow keys swap in RTL
