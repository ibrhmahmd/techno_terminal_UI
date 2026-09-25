# Quickstart: Student & Group Combobox Verification

This guide outlines how to manually verify the performance and UX optimizations of the combobox redesign.

## local Verification Steps

### 1. Build and Lint Checklist
Run the standard build gates:
```bash
npm run lint
npm run build
```
Ensure no compiler errors or style violations exist in `src/components/common/SpyCombobox.tsx` or related selectors.

### 2. Manual Test Scenario: Debouncing & Keystroke Throttling
1. Open the **Create Receipt** page (`/finance`).
2. Open Browser DevTools under the **Network** tab.
3. Rapidly type a student name (e.g., "Abraham") into the Student Search Combobox.
4. **Verification**: 
   - Confirm only one `/api/v1/crm/students?q=...` API request is fired after you stop typing (250ms delay).
   - Ensure the server is not flooded on every single keystroke.

### 3. Manual Test Scenario: Progressive List Rendering (DOM chunking)
1. Open any page with the **Group Combobox** (e.g., the **Enroll Student** panel on the Enrollments page).
2. Click the Group selection field to show the dropdown.
3. Open the browser elements inspector and check the items container.
4. **Verification**:
   - Confirm that even if there are 100+ groups in the database, only the first 40 items are initially rendered in the DOM.
   - Scroll down to the bottom of the dropdown list. Confirm that more groups append dynamically as you reach the bottom, and that scrolling remains smooth (60fps).

### 4. Manual Test Scenario: Recently Selected Browse Mode
1. In the student selector, select a student, and then click **Change** to clear the selection.
2. Focus the combobox again.
3. **Verification**:
   - Confirm that the student name is listed under the "Recently Used" section at the top of the dropdown.
   - Close the browser tab, reopen it, and confirm the list persists (saved in `localStorage` in privacy-safe `{ id, name }` format).

### 5. Manual Test Scenario: Mobile Viewport Layout
1. Open the browser DevTools and switch to mobile device emulation (e.g., iPhone or Pixel viewport, <640px width).
2. Click any search combobox.
3. **Verification**:
   - Verify the left categories sidebar is hidden.
   - Verify the items appear in a single scrollable column with inline sticky headers.
   - Confirm the dropdown fits cleanly on screen and does not overflow horizontally.
