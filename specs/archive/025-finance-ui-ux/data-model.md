# Data Model: Finance Page UI/UX

## Entities

### MetricsCard (display-only, derived from API)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| label | string | hardcoded | "Collected Today", "Receipts Today", "Unpaid Enrollments", "Unpaid Amount" |
| value | string | computed | Formatted from raw value (EGP prefix for currency) |
| icon | string | hardcoded | Material Symbol icon name |
| color | 'secondary'\|'emerald'\|'amber'\|'blue' | hardcoded per card | Visual theme |
| targetPanel | 'receipts'\|'create'\|'unpaid'\|'refunds' | hardcoded | Which panel opens on click |
| isLoading | boolean | from useDailyMetrics | Skeleton state |
| isActive | boolean | from FinancePage state | Currently open panel matches this card's target |

### DailyCollectionItem (from `api/finance/types/reporting`)

| Field | Type | Source |
|-------|------|--------|
| payment_method | string | GET /finance/reports/daily-collections |
| total_amount | number | " |
| receipt_count | number | " |
| target_date | string (YYYY-MM-DD) | " |

### DailyReceiptItem (from `api/finance/types/reporting`)

| Field | Type | Source |
|-------|------|--------|
| receipt_id | number | GET /finance/reports/daily-receipts |
| receipt_number | string | " |
| payer_name | string \| null | " |
| total_amount | number | " |
| payment_method | string | " |
| issued_at | string (ISO datetime) | " |

### ReceiptSearchParams (from `api/finance/types/receipts`)

| Field | Type | Source |
|-------|------|--------|
| from_date | string (YYYY-MM-DD) | Advanced search UI |
| to_date | string (YYYY-MM-DD) | Advanced search UI |
| payer_name? | string | Optional text input |
| student_id? | number | Optional filter |
| receipt_number? | string | Optional filter |

### UnpaidEnrollment (from `api/crm/students/types/finance`)

| Field | Type | Source |
|-------|------|--------|
| enrollment_id | number | GET /balance/unpaid-enrollments |
| student_id | number | " |
| student_name | string | " |
| group_id | number | " |
| group_name | string | " |
| course_name? | string | " |
| enrolled_at | string (ISO datetime) | " |
| remaining_balance | number | " |

### ReceiptLineItem (form state — not persisted server-side)

| Field | Type | Notes |
|-------|------|-------|
| id | string | Local UUID for keyed rendering |
| studentSearch | string | Search query text |
| selectedStudent | Student \| null | Resolved from search |
| students | Student[] | Search results dropdown |
| selectedEnrollment | StudentEnrollmentInfo \| null | Resolved after student selected |
| amount | number | Payment amount |
| payment_type | 'course_level'\|'competition'\|'other' | Pill-selected |
| discount | number | Default 0 |
| notes | string | Optional line notes |

## State Transitions

### Navigation (metrics-as-nav)

```
[Page Load] → activePanel = 'receipts', Collected Today card highlighted
    ↓ click "Receipts Today" card
[activePanel = 'create'] → Receipts Today card highlighted
    ↓ click "Unpaid Count" or "Unpaid Amount" card
[activePanel = 'unpaid'] → unpaid card highlighted
    ↓ click "Collected Today" card
[activePanel = 'receipts'] → Collected Today card highlighted
```

### Create Receipt Flow

```
[Form Mount] → check sessionStorage for draft
    ├── draft found → "Draft restored" toast, populate form
    └── no draft → empty form
[User edits] → auto-save to sessionStorage every 10s
[User clicks Create Receipt]
    ├── payment method not selected → inline validation error
    ├── payment type not selected per line item → inline validation error
    ├── risk check requested → previewOverpaymentRisk() → show warning or proceed
    └── all valid → createReceipt() → success toast + clear draft
```
