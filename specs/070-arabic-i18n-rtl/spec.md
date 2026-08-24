# Feature Specification: Arabic i18n/RTL Support

**Feature Branch**: `070-arabic-i18n-rtl`
**Created**: 2026-08-24
**Status**: Draft
**Input**: User description: "Add Arabic language support to the Techno Terminal UI — bilingual (EN/AR) with user-toggleable language switcher, correct RTL layout, and full translation of all user-facing strings."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Language Switching (Priority: P1)

As an admin or instructor, I want to switch the application language between English and Arabic from the Settings page, so that I can use the app in my preferred language.

**Why this priority**: Language switching is the foundation — without it, no other Arabic feature is reachable. It delivers immediate value to bilingual users.

**Independent Test**: Can be fully tested by navigating to Settings, toggling to Arabic, and verifying the UI re-renders in Arabic with RTL layout. Delivers a working bilingual app.

**Acceptance Scenarios**:

1. **Given** the app is in English, **When** the user navigates to Settings and selects "العربية", **Then** the entire UI switches to Arabic and the layout flips to right-to-left.
2. **Given** the app is in Arabic, **When** the user selects "English" in Settings, **Then** the UI switches back to English with left-to-right layout.
3. **Given** the user has selected Arabic, **When** they close and reopen the browser, **Then** the app loads in Arabic (preference is persisted).
4. **Given** the user has selected Arabic in one browser tab, **When** they open another tab, **Then** the new tab also loads in Arabic (cross-tab sync).

---

### User Story 2 - Finance Receipts Bilingual Support (Priority: P2)

As an admin creating a receipt, I want all labels, instructions, and messages in the receipt creation flow to appear in my selected language, so that I can work entirely in Arabic or English without mixed-language screens.

**Why this priority**: Finance receipts already contain ad-hoc Arabic text — formalizing this into the translation system is the natural first feature to prove the i18n infrastructure works end-to-end.

**Independent Test**: Can be fully tested by toggling to Arabic and creating a receipt — all form labels, buttons, validation messages, and the slide-to-confirm control should appear in Arabic.

**Acceptance Scenarios**:

1. **Given** the app is in Arabic, **When** the user opens the Create Receipt panel, **Then** all form labels (student search, amount, payment method, notes) appear in Arabic.
2. **Given** the app is in Arabic, **When** the user interacts with the slide-to-confirm control, **Then** the instruction text appears in Arabic and the control layout is mirrored (RTL).
3. **Given** the app is in Arabic, **When** a validation error occurs (e.g., missing student), **Then** the error message appears in Arabic.
4. **Given** the app is in English, **When** the user creates a receipt, **Then** all text remains in English (no regression).

---

### User Story 3 - Full App Translation (Priority: P3)

As a user, I want all pages and components throughout the application to display text in my selected language, so that I never encounter untranslated English strings while using the Arabic interface.

**Why this priority**: This is the bulk of the work — extracting ~1,490 strings across all pages and components. It's P3 because the infrastructure (P1) and first feature proof (P2) must work first.

**Independent Test**: Can be tested by navigating through every page in Arabic mode and verifying no hardcoded English strings appear (except brand names and technical terms).

**Acceptance Scenarios**:

1. **Given** the app is in Arabic, **When** the user navigates to any page (Dashboard, Groups, Directory, Staff, Reports, etc.), **Then** all headings, labels, buttons, messages, and tooltips appear in Arabic.
2. **Given** the app is in Arabic, **When** the user interacts with data tables, **Then** column headers, empty states, pagination labels, and filter controls appear in Arabic.
3. **Given** the app is in Arabic, **When** modal dialogs appear (create, edit, delete confirmations), **Then** all dialog text appears in Arabic.
4. **Given** the app is in Arabic, **When** toast notifications appear (success, error, warning), **Then** notification messages appear in Arabic.

---

### User Story 4 - RTL Layout Correctness (Priority: P4)

As a user, I want the application layout to mirror correctly in Arabic mode — navigation, forms, tables, and spacing should follow right-to-left conventions, so the interface feels natural in Arabic.

**Why this priority**: Correct RTL layout is essential for Arabic usability. Without it, the app would feel foreign even with translated strings.

**Independent Test**: Can be tested by comparing screenshots of key pages in EN vs AR — margins, padding, alignment, and positioning should be mirrored.

**Acceptance Scenarios**:

1. **Given** the app is in Arabic, **When** the user views any page, **Then** the sidebar appears on the right side, text is right-aligned, and form inputs are right-aligned.
2. **Given** the app is in Arabic, **When** the user views data tables, **Then** text columns are right-aligned and numeric columns remain left-aligned (or follow Arabic numeral conventions).
3. **Given** the app is in Arabic, **When** the user views navigation elements, **Then** back arrows point right, forward chevrons point left, and directional icons are flipped.
4. **Given** the app is in Arabic, **When** the user uses keyboard navigation (arrow keys for tabs), **Then** the left/right arrow key mapping is swapped to match RTL semantics.

---

### Edge Cases

- What happens when a translation key is missing for Arabic? The system falls back to the English string (no blank or broken UI).
- What happens when the user switches language while a form is partially filled? The form re-renders in the new language without losing entered data.
- What happens when a toast notification was triggered in one language and the user switches before it dismisses? The toast retains its original language until dismissed.
- What happens with mixed-direction content (e.g., an English email address in an Arabic sentence)? The text renders naturally with Unicode bidirectional algorithm — no special handling needed.
- What happens with numeric values in Arabic mode? Numbers display in Western Arabic numerals (0123) initially — Eastern Arabic numerals (٠١٢٣) are a future enhancement.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a language toggle in the Settings page allowing users to switch between English and Arabic.
- **FR-002**: System MUST persist the selected language preference across browser sessions (client-side localStorage, no server storage).
- **FR-003**: System MUST sync language preference across browser tabs in real time via localStorage storage events.
- **FR-004**: System MUST set the HTML `lang` attribute to match the selected language (`en` or `ar`).
- **FR-005**: System MUST set the HTML `dir` attribute to `ltr` for English and `rtl` for Arabic.
- **FR-006**: System MUST display all user-facing text in the selected language — no untranslated strings should appear in the active language.
- **FR-007**: System MUST fall back to English when an Arabic translation is missing.
- **FR-008**: System MUST render the layout in RTL direction when Arabic is selected — sidebar, navigation, forms, tables, and spacing must mirror.
- **FR-009**: System MUST flip direction-dependent icons (arrows, chevrons) when in RTL mode.
- **FR-010**: System MUST swap keyboard arrow key semantics (left/right) for tab navigation when in RTL mode.
- **FR-011**: System MUST load and display Arabic text using a font that supports Arabic glyphs (Latin-only fonts will not render Arabic correctly).
- **FR-012**: System MUST normalize existing ad-hoc Arabic strings in finance components into the centralized translation system.
- **FR-013**: Existing language preference stored in localStorage MUST NOT be lost when the feature is deployed (backward compatible storage key or migration).
- **FR-014**: System MUST update the UI instantly when the user toggles language — no page reload. All visible text and layout direction must re-render reactively.

### Key Entities

- **Locale Setting**: The user's language preference — either `en` or `ar`. Persisted to client-side localStorage only (no server storage), synced across tabs via storage events.
- **Translation Key**: A structured identifier (e.g., `finance.receipt.create`) that maps to a text string in each language.
- **Translation Namespace**: A logical grouping of translation keys (e.g., `common`, `finance`, `groups`) for organizational purposes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between English and Arabic in under 2 seconds (language toggle to full UI update).
- **SC-002**: 100% of user-facing strings are translatable — no hardcoded English text remains in Arabic mode across any page.
- **SC-003**: RTL layout is correct on all pages — zero instances of left-aligned text, left-positioned navigation, or un-flipped directional icons in Arabic mode.
- **SC-004**: Language preference persists across browser sessions with 100% reliability.
- **SC-005**: The feature does not introduce any regressions — all existing functionality works identically in English mode.
- **SC-006**: Translation fallback works correctly — if an Arabic key is missing, the English string displays without visual breakage.
- **SC-007**: New Arabic-speaking users can complete core workflows (creating receipts, viewing groups, checking attendance) entirely in Arabic without encountering English text.

## Clarifications

### Session 2026-08-24

- Q: Is language preference stored per-device (localStorage) or per-user (server-side)? → A: Client-side only — localStorage per device, no server storage. User re-selects on new devices.
- Q: Should the sidebar mirror to the right in RTL mode or stay on the left? → A: Mirror sidebar to the right in RTL. Standard Arabic UI convention.
- Q: Should language toggle trigger a page reload or update instantly? → A: Instant update — components re-render reactively. No page reload.

## Assumptions

- Arabic text will use Western Arabic numerals (0123) rather than Eastern Arabic numerals (٠١٢٣) in the initial implementation. Eastern numeral support can be added as a follow-up.
- Date and time formatting will use `Intl.DateTimeFormat` with the active locale — no custom date formatting library is needed.
- The existing 34 ad-hoc Arabic strings in finance components are correct and can be used as the basis for Arabic translations in those areas.
- Font loading will use Google Fonts (Noto Sans Arabic) — no self-hosted font infrastructure is needed.
- All ~1,490 user-facing strings can be extracted from components without changing component architecture (strings are already in JSX, not dynamically generated).
- The phased approach (Infrastructure → Finance → Bulk) is acceptable — the full app will not be bilingual until Phase 2 completes.
- Technical terms, brand names ("Techno Terminal", "instaPay"), and proper nouns will not be translated.
- Number formatting, date localization, and Eastern Arabic numeral support are out of scope for this feature.
