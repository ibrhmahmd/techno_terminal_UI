# Component Contracts: Finance Page

## MetricsStrip

```typescript
interface MetricsStripProps {
  date: string  // YYYY-MM-DD — sets which day's metrics to show
}
```
- Always visible above the tab bar
- Contains 3 stat cards: Today's Collections, Outstanding Balance, Receipts Today
- Each card shows a label, value, icon, and subtle background
- Loading state: skeleton placeholders
- Error state: retry button per card

---

## TodayReceiptsTab

```typescript
interface TodayReceiptsTabProps {
  onError: (message: string) => void
  onStudentClick: (studentId: number) => void  // Navigate to student detail
}
```
- Contains `ReportDaySelectorBar` at top
- Below it: `TodayReceiptsList` (paginated)
- Expandable "Advanced Search" toggle between day selector and search button area
- Default: day selector mode (simple, fast)
- Expanded: date range + payer name + sort options

---

## TodayReceiptsList

```typescript
interface TodayReceiptsListProps {
  receipts: DailyReceiptItem[]
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  onReceiptClick: (receiptId: number) => void
  onStudentClick: (studentId: number) => void
}
```
- Table/list with columns: Receipt #, Student/Payer, Amount, Method, Date/Time
- Click row → opens `ReceiptDetailPanel`
- Click student name → navigates to Student Detail
- Paginated (client-side or server-side depending on API response)

---

## ReceiptDetailPanel

```typescript
interface ReceiptDetailPanelProps {
  receiptId: number
  onClose: () => void
  onDownloadPdf: (receiptId: number) => Promise<void>
  onStudentClick: (studentId: number) => void
}
```
- Modal or side panel showing full receipt info
- PDF download button
- Student name is a clickable link

---

## PaymentMethodPills

```typescript
interface PaymentMethodPillsProps {
  value: PaymentMethod | null  // null when nothing selected
  onChange: (method: PaymentMethod) => void
  error?: string  // Show validation message
  showError?: boolean  // Trigger shake animation
}

type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other'
```
- Renders a row of clickable pills
- Active pill has filled background + white text
- Inactive pills have outlined style
- No pill selected by default (value starts as null)
- On validation error: pills container shakes + error text appears below

---

## ComingSoonPlaceholder

```typescript
interface ComingSoonPlaceholderProps {
  title: string
  description: string
  icon?: string  // Material Symbols icon name
}
```
- Full panel placeholder with icon, title, and description
- Used for the Refunds tab

---

## MetricsStripCards

```typescript
interface MetricsStripCardsProps {
  items: MetricCardData[]
  isLoading: boolean
  onRetry?: () => void
}

interface MetricCardData {
  label: string
  value: string | number
  icon: string  // Material Symbols icon name
  color: 'primary' | 'secondary' | 'accent' | 'info'
}
```
- Reusable stat card component
- Each card: icon + label + value in a compact horizontal layout
- Loading: skeleton pulse animation
- Error: retry button
