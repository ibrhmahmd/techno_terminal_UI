# Research: Complete i18n Translations

**Date**: 2026-08-24
**Spec**: `071-i18n-complete-translations`

## Research Questions

### 1. How should new locale keys be organized within existing namespace files?

**Decision**: Add keys to existing namespace files following the established dot-notation convention. For new domains (courses), create new namespace files.

**Rationale**: The 13 existing namespaces already cover all feature domains. Most remaining strings fit naturally into existing namespaces:
- Auth pages → `common.json` (auth section)
- Detail pages → domain-specific files (competitions.json, groups.json)
- Common components → `common.json` (buttons, empty, pagination sections)
- Domain components → their respective namespace files

**Alternatives considered**:
- Creating a separate `detail.json` namespace — rejected, would fragment related keys
- Putting everything in `common.json` — rejected, would bloat the file further

### 2. Should components accept translated strings as props or use t() internally?

**Decision**: Components use `useTranslation()` internally. Parent pages pass no translated strings as props.

**Rationale**: This matches the existing pattern — every component that renders user-facing text calls `useTranslation()` with its domain namespace. This avoids prop-drilling translations and keeps each component self-contained.

**Alternatives considered**:
- Props-based translation — rejected, would require changing component APIs across 70+ files
- Context-based injection — rejected, over-engineering for this use case

### 3. How should the 273 dead keys be cleaned up?

**Decision**: Remove dead keys from locale files only after all active translations are complete (Batch 7). Verify by grepping for each key in the codebase before removal.

**Rationale**: Removing keys too early could break components that reference them with `defaultValue` fallbacks. The cleanup should be the final step after all translations are verified.

**Alternatives considered**:
- Removing dead keys immediately — rejected, risk of breaking `defaultValue` fallbacks
- Marking keys as deprecated — rejected, adds unnecessary complexity

### 4. How should the 11 missing common.navigation.* keys be handled?

**Decision**: Add the 11 keys to `common.json` under `navigation` section with EN values matching the existing `defaultValue` strings, and corresponding Egyptian AR translations.

**Rationale**: The SettingsPage already uses these keys with `defaultValue` fallbacks. Adding them to the locale files ensures they render correctly in Arabic mode.

**Alternatives considered**:
- Keeping the `defaultValue` approach — rejected, means Arabic users see English tab labels

### 5. Should courses get their own namespace or reuse an existing one?

**Decision**: Create `courses.json` namespace for courses-specific strings. Register it in `src/i18n/index.ts`.

**Rationale**: Courses have enough strings (~15 in CoursesPage + ~4 in CourseForm + ~4 in CoursesHeader) to justify a dedicated namespace. This follows the existing pattern (competitions, enrollments, etc. each have their own namespace).

**Alternatives considered**:
- Putting courses strings in `common.json` — rejected, would add unrelated keys
- Reusing `groups.json` — rejected, courses and groups are distinct domains
