# Data Model: Arabic i18n/RTL Support

**Date**: 2026-08-24
**Feature**: Arabic i18n/RTL Support

## Entities

### LocaleSetting

The user's language and direction preference. Client-side only (localStorage).

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `locale` | `'en' \| 'ar'` | `'en'`, `'ar'` | Active language |
| `direction` | `'ltr' \| 'rtl'` | `'ltr'`, `'rtl'` | Computed from locale |

**Storage**: `localStorage` key `settings-storage` (Zustand persist)
**Sync**: Cross-tab via `window.addEventListener('storage', ...)` on `settings-storage` key
**Default**: `{ locale: 'en', direction: 'ltr' }`

**State Transitions**:
```
[en, ltr] ←→ [ar, rtl]
```
Direction is always derived from locale: `locale === 'ar' ? 'rtl' : 'ltr'`

### TranslationKey

A structured identifier mapping to a text string in each language.

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Dot-separated path (e.g., `finance.receipt.create`) |
| `namespace` | `string` | Top-level segment (e.g., `finance`) |
| `en` | `string` | English translation |
| `ar` | `string` | Arabic translation |

**Naming Convention**: `feature.section.key` (max 3 levels deep)
**Examples**:
- `common.buttons.save` → EN: "Save", AR: "حفظ"
- `finance.receipt.slide_to_confirm` → EN: "Slide to confirm", AR: "اسحب للتأكيد"
- `groups.form.title.create` → EN: "Create Group", AR: "إنشاء مجموعة"

### TranslationNamespace

Logical grouping of translation keys for lazy loading.

| Namespace | Loading | Contents |
|-----------|---------|----------|
| `common` | Eager | Buttons, labels, messages, validation, navigation |
| `finance` | Lazy | Receipt creation, payments, reports |
| `groups` | Lazy | Group list, detail, forms, attendance |
| `dashboard` | Lazy | Overview cards, schedule |
| `directory` | Lazy | Student/parent lists, search |
| `staff` | Lazy | Employee list, forms |
| `reports` | Lazy | Charts, summaries |
| `competitions` | Lazy | Competition management |
| `tasks` | Lazy | Task management |
| `notifications` | Lazy | Notification admin |
| `settings` | Lazy | Settings page |
| `certificates` | Lazy | Certificate management |
| `auth` | Lazy | Login, register, password reset |

## Relationships

```
LocaleSetting (1) ←→ (1) TranslationNamespace (loaded per locale)
TranslationNamespace (1) ←→ (N) TranslationKey
```

## Validation Rules

- `locale` must be one of `['en', 'ar']`
- `direction` is computed, never set directly
- Translation keys must be dot-separated, max 3 levels
- Missing Arabic keys fall back to English (FR-007)
- Empty string values are treated as missing (fallback triggered)

## Migration Notes

- FR-013: Existing localStorage data must not be lost
- New `settings-storage` key is independent of existing `auth-storage`
- No migration needed — new feature, new storage key
