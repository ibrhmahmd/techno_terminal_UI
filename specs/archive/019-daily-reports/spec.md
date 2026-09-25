# Feature Specification: Daily Reports

**Feature Branch**: `019-daily-reports`
**Created**: 2026-05-21
**Status**: Draft
**Input**: Backend API docs in `daily-reports.md`

## Clarifications

- Q: Should the report page be accessible to all authenticated users or only admin/system_admin? → A: The API requires `admin` or `system_admin` role. UI follows the same restriction.
- Q: Should users be able to select any past date, or only today? → A: Any past date — `target_date` query param defaults to today but accepts any ISO date.
- Q: Two modes (PDF download vs email send) — should these be separate UI actions? → A: Yes. PDF download = button press, email send = form with recipient list.
- Q: Where does this feature live in the app? → A: Under a new "Reports" section, or as a new tab within an existing Reports page. Since `/reports` route is already protected, add a Daily Report tab there.
- Q: Does the frontend need to render the PDF inline or just trigger a download? → A: Just trigger a download — the API returns base64, which the frontend converts to a Blob and saves.

## User Scenarios & Testing

### User Story 1 — View & Download Daily Report (Priority: P1)

An admin can view a daily report summary as structured JSON data and download it as a PDF.

**Why this priority**: Core functionality — admins need to review day-end reports and save/sh PDF copies.

**Independent Test**: Login as admin, navigate to Reports > Daily, select a date with data, see the summary dashboard with revenue, attendance, enrollment stats, and session details. Click "Download PDF" and receive a PDF file.

**Acceptance Scenarios**:

1. **Given** an admin is on the Daily Report page, **When** they select a date with data, **Then** the summary dashboard displays revenue, enrollments, sessions held, attendance rate, and session details
2. **Given** an admin views the report, **When** they click "Download PDF", **Then** a base64 PDF is fetched, converted to Blob, and a file download is triggered
3. **Given** an admin selects a date with no data (sessions=0 AND payments=0 AND enrollments=0), **When** the report loads, **Then** they see a "No data for this date" empty state
4. **Given** an admin selects a date with no data, **When** they click "Download PDF", **Then** the 404 is handled gracefully with a toast message

### User Story 2 — Email Daily Report (Priority: P2)

An admin can send the daily report to one or more email recipients directly from the UI.

**Why this priority**: Useful but secondary to viewing/downloading. Enables automated distribution.

**Independent Test**: On the Daily Report page, enter comma-separated email addresses, click "Send", verify success message.

**Acceptance Scenarios**:

1. **Given** an admin has a report loaded, **When** they enter valid email(s) and click "Send", **Then** the report is queued for email delivery
2. **Given** an admin enters invalid email format(s), **When** they attempt to send, **Then** inline validation highlights the invalid entries
3. **Given** an admin is on a date with no data, **When** they attempt to send, **Then** the send button is disabled

### User Story 3 — Date Navigation & Default (Priority: P3)

The report defaults to today but allows picking any past date.

**Acceptance Scenarios**:

1. **Given** an admin visits the Daily Report page, **When** it loads, **Then** the report defaults to today's date
2. **Given** an admin picks a past date, **When** the date changes, **Then** the report data refreshes automatically
3. **Given** an admin picks a future date, **When** the date changes, **Then** the UI shows a validation error (future dates not supported)

---

### Edge Cases

- Date with zero data → empty state with "No data for 2026-05-21" message
- Network failure during PDF download → retry button
- PDF base64 decoding failure → error toast with "Failed to generate PDF"
- Very long running report generation → loading state with spinner (API is synchronous, should be <5s)
- Multiple rapid date changes → debounce or cancel previous request
- User with `admin` role (not `system_admin`) → should still have access per API spec

## Requirements

### Functional Requirements

- **FR-001**: Admins MUST be able to view daily report summary data (revenue, enrollments, sessions, attendance) for any past date
- **FR-002**: Admins MUST be able to download the daily report as a PDF (base64 → Blob download)
- **FR-003**: Admins MUST be able to send the daily report via email to one or more recipients
- **FR-004**: The report MUST default to today's date on first load
- **FR-005**: Dates with no data MUST show a clear empty state message
- **FR-006**: Future dates MUST be rejected with a validation message
- **FR-007**: Invalid email formats in the send form MUST show inline validation errors

### Key Entities

- **DailyReportData**: JSON payload with date, total_revenue, new_enrollments, sessions_held, present_count, absent_count, attendance_rate, payment_count, payment_methods, payment_details, instructors_list, session_details, payments_by_type, instructor_summary
- **DailyReportPdf**: Object with date and pdf_base64 string
- **EmailSendRequest**: Object with email_recipients array
- **ReportDate**: ISO date string (YYYY-MM-DD)

## Success Criteria

- **SC-001**: Report data loads within 3 seconds for any date
- **SC-002**: PDF download completes within 5 seconds
- **SC-003**: Email send confirmation appears within 3 seconds
- **SC-004**: Empty dates show a helpful message, not a broken UI
- **SC-005**: All API errors display a user-friendly toast message

## Assumptions

- Reports are generated synchronously (no job queue polling required)
- Base64 PDFs are small enough to handle in-memory (<10MB)
- Email recipients are comma-separated strings, not a multi-select from a user list
- The existing `/reports` route already exists and is protected — a new tab will be added
- The existing `Toast` component from `src/components/common/` will be used for notifications
- The existing `DatePicker` or native `<input type="date">` will be used for date selection
- Cache strategy: `staleTime: 0` — report data is always fresh since it represents a snapshot of a specific date
