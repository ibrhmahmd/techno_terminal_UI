# Research: Arabic i18n/RTL Support

**Date**: 2026-08-24
**Feature**: Arabic i18n/RTL Support
**Spec**: [spec.md](./spec.md)

## Research Questions

### 1. i18n Library Selection

**Question**: Which i18n library best fits a React 19 SPA with Vite?

**Decision**: `react-i18next` + `i18next` + `i18next-browser-languagedetector`

**Rationale**:
- Most popular React i18n solution (16k+ GitHub stars, massive ecosystem)
- Hooks-based API (`useTranslation`) — natural for React 19 functional components
- Lazy namespace loading — translation files loaded on demand, no bundle bloat
- Built-in fallback chain — missing keys fall back to English automatically
- `i18next-browser-languagedetector` handles localStorage, navigator, and html tag detection
- Well-documented, active maintenance, large community

**Alternatives Considered**:
- `react-intl` (FormatJS): ICU message format is powerful for complex plurals/gender, but heavier and more verbose for this use case. Overkill for EN/AR bilingual.
- `lingui`: Excellent forExtractor CLI and compile-time optimization, but requires build pipeline changes. Better for greenfield projects.
- Manual approach (context + hooks): No dependencies, but reinvents fallback, pluralization, detection. Not worth it.

### 2. RTL Layout Strategy

**Question**: How to convert ~267 physical directional Tailwind classes to support RTL?

**Decision**: Use Tailwind v3.4's native logical properties (`ms-*`, `ps-*`, `start-*`, `end-*`)

**Rationale**:
- Tailwind 3.4 has first-class support for logical properties — no plugin needed
- Logical properties are the W3C CSS standard for bidirectional layouts
- Zero additional dependencies
- `ms-*` (margin-inline-start) replaces `ml-*` in LTR and `mr-*` in RTL automatically
- `start-*` replaces `left-*` and flips to `right-*` in RTL
- `text-start` replaces `text-left` and flips to `text-right` in RTL
- Already works with JIT mode (default in Vite)

**Alternatives Considered**:
- `tailwindcss-rtl` plugin: Provides `rtl:` variant prefix. Adds a dependency. Less standard than native logical properties. The `rtl:ml-4` pattern is more verbose than `ms-4`.
- `postcss-rtlcss`: PostCSS plugin that auto-converts. Heavy, transforms at build time. Harder to debug.
- Manual CSS overrides per element: `dir="rtl"` + `[dir="rtl"] .ml-4 { margin-left: 0; margin-right: 1rem }`. Messy, error-prone, not scalable.

### 3. Font Loading Strategy

**Question**: How to load Noto Sans Arabic for Arabic text rendering?

**Decision**: Google Fonts via `<link>` in `index.html`, with font-family fallback chain

**Rationale**:
- Consistent with existing pattern (Space Grotesk and Inter already loaded via Google Fonts in `index.html`)
- No self-hosted infrastructure needed
- Font-family fallback: `['Inter', 'Noto Sans Arabic', 'system-ui', 'sans-serif']`
- In LTR mode: Inter renders Latin text, Noto Sans Arabic is dormant
- In RTL mode: Noto Sans Arabic renders Arabic glyphs, Inter is fallback for Latin characters
- Google Fonts CDN handles subsetting, caching, and cross-browser compatibility

**Alternatives Considered**:
- Self-hosted fonts: More control, but requires hosting infrastructure and font file management. Overkill for this.
- System fonts only: Arabic system fonts vary wildly across OS. Inconsistent rendering.
- `font-display: swap`: Already default in Google Fonts. No action needed.

### 4. Cross-Tab Sync Pattern

**Question**: How to sync language preference across browser tabs?

**Decision**: localStorage `storage` event listener (same pattern as existing `authStore`)

**Rationale**:
- Already implemented in `src/store/authStore.ts` — proven pattern in this codebase
- `window.addEventListener('storage', ...)` fires when another tab modifies localStorage
- No polling, no BroadcastChannel, no service worker needed
- Simple, reliable, zero additional dependencies
- The `settingsStore` will use the same pattern: persist to `settings-storage`, listen for `storage` events

**Alternatives Considered**:
- BroadcastChannel API: More modern, but not needed for simple key-value sync. localStorage is sufficient.
- Service Worker communication: Overkill for this use case.
- URL params: Doesn't persist across sessions.

### 5. Zustand Store vs Extending authStore

**Question**: Should locale state live in `authStore` or a new `settingsStore`?

**Decision**: Create a new `src/store/settingsStore.ts`

**Rationale**:
- Constitution Principle III: "Zustand is reserved for truly global UI state"
- Locale is global UI state (affects every component), but it's conceptually separate from auth
- `authStore` has auth concerns (token, refresh, user profile) — adding locale violates single responsibility
- Separate store allows independent persistence key (`settings-storage` vs `auth-storage`)
- Separate store allows independent cross-tab sync
- Clean separation: auth changes don't affect locale, locale changes don't affect auth

**Alternatives Considered**:
- Extending `authStore`: Simpler, but couples unrelated concerns. Auth logout shouldn't reset language preference.
- React Context: Not persisted, not cross-tab synced. Doesn't meet requirements.
- URL-based locale: Doesn't persist across sessions. Doesn't meet FR-002.

### 6. Translation File Organization

**Question**: How to structure translation JSON files?

**Decision**: Flat files per namespace, nested keys by feature

**Structure**:
```json
{
  "common": {
    "buttons": { "save": "Save", "cancel": "Cancel" },
    "labels": { "name": "Name", "email": "Email" }
  },
  "finance": {
    "receipt": {
      "create": "Create Receipt",
      "slide_to_confirm": "Slide to confirm"
    }
  }
}
```

**Rationale**:
- Namespaces allow lazy loading (load `finance` namespace only when finance components mount)
- Nested keys provide logical grouping without deep nesting (max 3 levels)
- `common` namespace loaded eagerly (buttons, labels, messages used everywhere)
- Feature namespaces loaded lazily (finance, groups, dashboard, etc.)
- Key naming: `feature.section.key` — predictable, grep-friendly

**Alternatives Considered**:
- Single flat file: Simpler, but loads all ~1,490 strings upfront. Bundle bloat.
- File-per-component: Too granular, hard to maintain, too many HTTP requests.
- YAML: More readable, but requires parser. JSON is native to i18next.

## Summary of Decisions

| Decision | Choice | Key Benefit |
|----------|--------|-------------|
| i18n library | react-i18next | Most popular, hooks-based, lazy loading |
| RTL strategy | Tailwind logical properties | Native, no plugin, W3C standard |
| Font loading | Google Fonts (Noto Sans Arabic) | Consistent with existing pattern |
| Cross-tab sync | localStorage storage event | Proven pattern in codebase |
| State management | New settingsStore (Zustand) | Clean separation from auth |
| Translation structure | Namespace files, nested keys | Lazy loading, logical grouping |
