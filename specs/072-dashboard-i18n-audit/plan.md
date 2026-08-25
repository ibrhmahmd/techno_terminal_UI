# Spec 072: Dashboard Page i18n Audit & Finalization

**Date**: 2026-08-25 | **Status**: ✅ IMPLEMENTED

## Goal

Finalize the localization of the Dashboard page and all its component dependencies.

---

## Affected Files

### Pages
- `src/pages/DashboardPage.tsx` — no changes needed (already fully wired)

### Components Modified
- `src/components/dashboard/MobileDashboardFAB.tsx` — added i18n wiring
- `src/components/dashboard/DaySelectorBar.tsx` — replaced hardcoded day arrays
- `src/components/dashboard/InstructorSelectorBar.tsx` — wired "All" and aria-label

### Locale Files Modified
- `src/locales/en/dashboard.json` — added `fab`, `days`, `instructor_filter` sections
- `src/locales/ar/dashboard.json` — added + corrected translations
- `src/locales/ar/layout.json` — fixed `sign_out`

---

## Decisions Made (Grilling Session 2026-08-25)

| Key | Old AR | New AR | Reason |
|-----|--------|--------|--------|
| `empty.no_groups` | `"مفيش مجموعات النهاردة"` | `"مفيش مجموعات"` | Mobile should be shorter |
| `empty.no_groups_today` | same | kept | Desktop stays same |
| `quick_actions.create_payment` | `"إنشاء فاتورة"` | `"فاتورة جديدة"` | User preference |
| `layout.sign_out` | `"اطلع"` | `"تسجيل خروج"` | More standard Arabic |

## New Keys Added

### `dashboard.json` — `fab` section
```json
"fab": {
  "open_actions": "افتح",
  "close_actions": "اقفل",
  "quick_register": "سجّل طالب",
  "create_payment": "فاتورة جديدة"
}
```

### `dashboard.json` — `days` section
```json
"days": {
  "saturday": "السبت",      "saturday_short": "سبت",
  "sunday": "الأحد",        "sunday_short": "أحد",
  "monday": "الاثنين",      "monday_short": "اتنين",
  "tuesday": "الثلاثاء",    "tuesday_short": "ثلاتاء",
  "wednesday": "الأربعاء",  "wednesday_short": "أربعاء",
  "thursday": "الخميس",     "thursday_short": "خميس",
  "friday": "الجمعة",       "friday_short": "جمعة",
  "select_day": "اختر يوم"
}
```

### `dashboard.json` — `instructor_filter` section
```json
"instructor_filter": {
  "all": "الكل",
  "filter_by_instructor": "تصفية حسب المهندس"
}
```

---

## Remaining Items (Not Implemented — Low Priority)

| Item | Reason |
|------|--------|
| `StatWidget` sr-only trend labels ("Upward trend" etc.) | Screen-reader only, not visible — low impact |
| `MobileTopBar` brand name "TechnoTerminal" | Intentionally not translated (brand identity) |

---

## Confirmed OK Translations

| Key | AR | Status |
|-----|-----|--------|
| `scheduled_groups` | `"المجموعات النهاردة"` | ✅ Intentional (dashboard is always day-focused) |
| `fallbacks.tba` | `"يتحدد بعدين"` | ✅ Natural Egyptian |
| `fallbacks.unknown_group` | `"مجموعة مش معروفة"` | ✅ |
| `fallbacks.unknown_course` | `"كورس مش معروف"` | ✅ |
| `quick_actions.quick_reports_subtitle` | `"شوف التقارير"` | ✅ Close enough for this context |
| `quick_actions.todays_sessions` | `"سيشنز النهاردة"` | ✅ |
| All `mobile_group_card.*` | — | ✅ |
