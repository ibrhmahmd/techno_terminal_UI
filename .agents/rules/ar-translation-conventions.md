# Arabic Translation Conventions — Techno Terminal UI

All Arabic (`ar`) locale files in this project use **Egyptian Arabic (colloquial/عامية)**,
not Modern Standard Arabic (MSA/فصحى). Apply these conventions whenever adding or
editing any key in `src/locales/ar/`.

## Register

- Use Egyptian colloquial by default: e.g., "مفيش" not "لا يوجد", "شوف" not "عرض"
- Exception: Widget titles and section headings can use MSA if it reads more naturally (short nouns)
- Avoid mixing MSA verbs with colloquial context in the same string

## Confirmed Translation Decisions

| Concept | Correct AR | Avoid |
|---------|-----------|-------|
| Sign Out / Logout | `تسجيل خروج` | `"اطلع"` (too informal) |
| TBA (instructor not assigned) | `يتحدد بعدين` | `"TBA"` or MSA |
| All (filter button) | `الكل` | `"كل"` or `"الجميع"` |
| Create Payment (widget title) | `فاتورة جديدة` | `"إنشاء فاتورة"` (MSA) |
| Quick Register (FAB) | `سجّل طالب` | `"تسجيل "` (too formal for mobile) |
| View insights (subtitle) | `شوف التقارير` | Literal "insights" translation |
| Open (aria, FAB) | `افتح` | `"فتح"` |
| Close (aria, FAB) | `اقفل` | `"إغلاق"` (MSA) |

## Day Names

Standard Arabic day names (full form):
`السبت / الأحد / الاثنين / الثلاثاء / الأربعاء / الخميس / الجمعة`

Short/mobile forms (Egyptian colloquial, no ال article):
`سبت / أحد / اتنين / ثلاتاء / أربعاء / خميس / جمعة`

## Empty States

- Mobile empty states: shorter, punchy — e.g., `"مفيش مجموعات"`
- Desktop empty states: can include context — e.g., `"مفيش مجموعات النهاردة"`

## Page Titles

Page titles use semi-formal Arabic (with ال article, noun phrases):
`الصفحه الرئيسية / المجموعات / الطلاب / الفواتير`

## Negation Pattern

Prefer Egyptian: `"مفيش"` / `"مش"` over MSA `"لا يوجد"` / `"ليس"`

## Error / Toast Messages

Colloquial and first-person when agent is the system:
`"مش عارف أسجّل الطالب"` / `"الطالب اتسجّل بنجاح"`

## Interpolation

Always verify `{{variable}}` placeholders are preserved identically in AR strings.
