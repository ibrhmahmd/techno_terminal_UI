# Translation Key Contract

**Date**: 2026-08-24
**Feature**: Arabic i18n/RTL Support

## Overview

This document defines the contract for translation keys — naming conventions, structure, and usage patterns that all components must follow.

## Key Naming Convention

### Format
```
<namespace>.<section>.<key>
```

- **namespace**: Top-level feature area (loaded lazily except `common`)
- **section**: Sub-feature or UI element group
- **key**: Specific text string

### Rules
1. Max 3 levels deep (namespace.section.key)
2. Use snake_case for multi-word segments: `slide_to_confirm`
3. Use lowercase only: `Create Group` → `groups.form.title.create`
4. Avoid abbreviations: `delete` not `del`, `description` not `desc`
5. Brand names remain untranslated: `Techno Terminal`, `instaPay`

### Examples

| Key | EN | AR |
|-----|----|----|
| `common.buttons.save` | Save | حفظ |
| `common.buttons.cancel` | Cancel | إلغاء |
| `common.labels.name` | Name | الاسم |
| `common.messages.confirm_delete` | Are you sure? | هل أنت متأكد؟ |
| `finance.receipt.create` | Create Receipt | إنشاء فاتوره |
| `finance.receipt.slide_to_confirm` | Slide to confirm | اسحب للتأكيد |
| `groups.form.title.create` | Create Group | إنشاء مجموعة |
| `dashboard.no_groups` | No groups scheduled | لا توجد مجموعات مجدولة |

## Usage Contract

### Component Usage
```tsx
// Correct — useTranslation hook
const { t } = useTranslation('finance')
return <h1>{t('receipt.create')}</h1>

// Correct — with interpolation
return <p>{t('messages.try_again', { seconds: 5 })}</p>

// Wrong — hardcoded string
return <h1>Create Receipt</h1>

// Wrong — inline translation key
return <h1>{t('finance.receipt.create')}</h1>  // redundant namespace
```

### Namespace Loading
```tsx
// Eager — common namespace (loaded on app start)
import '../i18n'

// Lazy — feature namespace (loaded on demand)
const { t } = useTranslation('finance')  // loads finance namespace on first use
```

### Fallback Behavior
- Missing key → English fallback (never blank)
- Missing namespace → empty object (no crash)
- Missing Arabic value → English value displayed

## Scope

This contract covers:
- ✅ Translation key naming and structure
- ✅ Component usage patterns (`useTranslation` hook)
- ✅ Namespace loading strategy
- ✅ Fallback behavior

This contract does NOT cover:
- ❌ API response translation (server returns English only)
- ❌ URL/routing changes (no localized routes)
- ❌ Date/number formatting (uses `Intl` API directly)
