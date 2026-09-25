# Feature Specification: Certificates Page

**Feature Branch**: `066-certificates-page`  
**Created**: 2026-07-29  
**Status**: Draft  
**Input**: User description: "add certificates management page to the app for generating, listing, searching, downloading, and revoking course completion certificates for students"

## Clarifications

### Session 2026-07-29

- Q: What are the possible certificate lifecycle states? → A: Two-state lifecycle — Active → Revoked only. No draft, pending, or re-issuance states.
- Q: Who can generate certificates? → A: Admins only. Instructors view and download only, no generate/revoke/export access.
- Q: Should clicking a certificate row open a detail view? → A: Yes — modal detail view on row click showing full certificate info (cert ID, student, course, level, dates, instructor, director, timestamps).
- Q: Should the feature include a public certificate verification page? → A: No — out of scope. Public verification will be a separate feature later.

## User Scenarios & Testing

### User Story 1 - Browse and Search Certificates (Priority: P1)

An admin or instructor wants to view all issued certificates, search for a specific student or certificate ID, and filter by course track. They need a clear paginated list showing cert ID, student name, course, level, issue date, and status.

**Why this priority**: This is the primary landing experience — without being able to see and find certificates, no other action is useful.

**Independent Test**: User navigates to /certificates, sees a table of certificates, can paginate through results, search by student name, and filter by track. All data renders correctly with Active/Revoked status badges.

**Acceptance Scenarios**:

1. **Given** the user is on the Certificates page, **When** the page loads, **Then** a paginated table of certificates is displayed showing cert ID, student name, course, level, branch, issue date, and status
2. **Given** the certificates table is displayed, **When** the user types in the search field, **Then** results filter in real-time (server-side) to match student name or certificate ID
3. **Given** the certificates table is displayed, **When** the user selects a track from the filter dropdown, **Then** only certificates matching that track are shown
4. **Given** the certificates table is displayed, **When** the user toggles "Include Revoked", **Then** revoked certificates appear in the list alongside active ones
5. **Given** a certificate row is displayed, **When** the user clicks the row, **Then** a modal opens showing full certificate details (cert ID, student name, course, level, issue date, branch, instructor, director, timestamps, revocation info if applicable)

---

### User Story 2 - Download Certificate PDF/HTML (Priority: P1)

An admin or instructor wants to download a certificate as a PDF or HTML file to share with a student or print.

**Why this priority**: Delivering the certificate to students is the core purpose of the system. Download is the primary delivery method.

**Independent Test**: User finds a certificate in the list, clicks the Download PDF button, and receives a PDF file with the correct filename format.

**Acceptance Scenarios**:

1. **Given** a certificate row is displayed, **When** the user clicks the "Download PDF" action, **Then** the browser downloads a PDF file named `{StudentName}_{CourseName}_{YYYYMMDD}.pdf`
2. **Given** a certificate row is displayed, **When** the user clicks the "Download HTML" action, **Then** the browser downloads an HTML file named `{StudentName}_{CourseName}_{YYYYMMDD}.html`

---

### User Story 3 - Generate New Certificate (Priority: P2)

An admin wants to generate a course completion certificate for a student. They search for the student, select their track and level, specify the issue date and branch, optionally add instructor/director names and a custom color, then submit.

**Why this priority**: Generating new certificates is a core admin function, but less frequent than browsing and downloading existing ones.

**Independent Test**: User opens the Generate modal, fills in all required fields, submits, and the new certificate appears in the list. Attempting to generate a duplicate shows a clear conflict error.

**Acceptance Scenarios**:

1. **Given** the user is on the Certificates page, **When** they click "Generate Certificate", **Then** a modal form opens with fields for student name (searchable/selectable), course track, level, issue date, branch, instructor, director, and custom color
2. **Given** the generate form is open, **When** the user types in the student field, **Then** matching students appear in a dropdown (fetched from the student directory API), and selecting one auto-fills the student name, branch, and optionally the course track and level from their current enrollment
3. **Given** all required fields are filled, **When** the user submits the form, **Then** a new certificate is generated and appears at the top of the certificates list with a success toast
4. **Given** the user submits a certificate that already exists (same student + track + level + date), **When** the API returns a conflict, **Then** the form shows a clear error message and does not create a duplicate
5. **Given** the generate form is open, **When** the user clicks Cancel, **Then** the modal closes without creating a certificate

---

### User Story 4 - Revoke Certificate (Priority: P3)

An admin needs to revoke a certificate that was issued in error or to a student who did not complete the requirements.

**Why this priority**: Revocation is important for integrity but happens infrequently. It's a safety-net feature.

**Independent Test**: User clicks Revoke on an active certificate, enters a reason, confirms, and the certificate's status changes to Revoked with the reason displayed.

**Acceptance Scenarios**:

1. **Given** an active certificate is displayed, **When** the admin clicks "Revoke", **Then** a confirmation dialog appears with a required reason text field
2. **Given** the revoke dialog is open with a reason entered, **When** the admin confirms, **Then** the certificate status changes to "Revoked", showing the revocation date and reason
3. **Given** the revoke dialog is open, **When** the admin cancels, **Then** the dialog closes without revoking the certificate
4. **Given** a revoked certificate is displayed, **When** the admin clicks "Revoke", **Then** the action is not available (button disabled or hidden)

---

### User Story 5 - Export Certificates as CSV (Priority: P3)

An admin wants to export the filtered certificate list as a CSV file for reporting or external analysis.

**Why this priority**: Useful for admin reporting but not critical for day-to-day operations.

**Independent Test**: User applies filters (search, track), clicks "Export CSV", and receives a CSV file containing the filtered certificate data.

**Acceptance Scenarios**:

1. **Given** the user has optionally applied filters, **When** they click "Export CSV", **Then** a CSV file downloads containing the filtered certificate data matching the current search and track filters

---

### Edge Cases

- What happens when the certificate generation API is unreachable or returns a server error?
- How does the system handle a student with no current enrollment (student search returns results but no group/course info to prefill)?
- What happens when a revoked certificate's download PDF/HTML is clicked — should it still be downloadable?
- How does the UI behave when the certificates list is empty (no certificates generated yet)?
- What happens if the user tries to generate a certificate with a date in the far future or past?

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a paginated list of certificates with columns: cert ID, student name, course, level, branch, issue date, and status (Active/Revoked)
- **FR-002**: Users MUST be able to search certificates by student name or certificate ID (server-side search with minimum 2 characters)
- **FR-003**: Users MUST be able to filter certificates by course track using a dropdown
- **FR-004**: Users MUST be able to toggle visibility of revoked certificates via an "Include Revoked" control
- **FR-005**: System MUST provide a "Download PDF" action per certificate that downloads the PDF file
- **FR-006**: System MUST provide a "Download HTML" action per certificate that downloads the HTML file
- **FR-007**: Admins MUST be able to generate a new certificate via a modal form with fields: student (search/select), course track, level, issue date, branch, optional instructor, optional director, optional custom color
- **FR-008**: The student search field in the generate form MUST query the student directory and display matching results, auto-filling name, branch, and course/level from the student's current enrollment when selected
- **FR-009**: System MUST reject duplicate certificate generation (same student + track + level + date) with a clear error message
- **FR-010**: Admins MUST be able to revoke an Active certificate with a required reason, and the certificate status MUST permanently transition to "Revoked" showing the revocation date and reason. Revoked certificates cannot be re-activated or re-issued.
- **FR-011**: Instructors MUST be able to view, search, filter, and download certificates but MUST NOT see the Generate, Revoke, or Export CSV buttons
- **FR-012**: System MUST provide pagination controls (page size options, page navigation) for the certificate list
- **FR-013**: System MUST provide an "Export CSV" button (admin only) that downloads filtered results as a CSV file
- **FR-014**: System MUST show appropriate loading, empty, and error states for the certificates list
- **FR-015**: The certificates page MUST display consistently on desktop (table view) and mobile (card list view)
- **FR-016**: Clicking a certificate row MUST open a modal detail view showing all certificate fields (cert ID, student name, course, level, issue date, branch, instructor, director, created timestamp, revocation date/reason if revoked)

### Key Entities

- **Certificate**: A course completion record containing cert ID, student name, course name/track, level, issue date, branch, instructor, director, custom color, revocation status/reason. Generated by the certificates service and identified by a unique cert ID string (e.g., `TKTF-HTM-20260728-ABCD`). Lifecycle: Created in **Active** state, optionally transitioned to **Revoked**. No intermediate or re-issuance states.
- **Student**: An existing entity in the student directory system. Referenced when generating certificates to auto-fill name, branch, and enrollment information.
- **Course Track**: A predefined program track (e.g., HTML, CSS, JavaScript, Python, Robotics) that a certificate can be issued for.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can locate a specific certificate by student name or cert ID within 2 interactions (search or filter)
- **SC-002**: Administrators can generate a new certificate in under 60 seconds from opening the form
- **SC-003**: Certificate downloads (PDF/HTML) complete within 5 seconds on a standard connection
- **SC-004**: All instructor users can view and download certificates without seeing management actions (Generate, Revoke, Export)
- **SC-005**: The certificates list renders initial data within 3 seconds of page load
- **SC-006**: 100% of generated certificates appear in the list immediately upon creation (no refresh required)

## Assumptions

- The certificates microservice API has CORS enabled to accept requests from the frontend domain
- The existing student directory API and `useStudentsSearch` hook are available for the student autocomplete in the generate form
- Instructors have access to the Certificates page (under `ProtectedRoute`) but restricted actions via inline role checks — consistent with the Groups page pattern
- The `cert_id` field is the primary identifier for public operations (verify, download) and is unique across all certificates
- Certificate PDF and HTML files are generated server-side by the certificates microservice; the frontend only triggers downloads
- A student may not have a current enrollment — in that case, the generate form will only auto-fill the name and leave track/level/branch empty for manual entry
- Revoked certificates remain downloadable (the API serves their files even after revocation)
