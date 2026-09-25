# Quickstart: Level Creation Loading UX

Instructions for compiling, linting, running, and verifying the level progression UI enhancements.

## Setup & Running UI

1. Make sure Node.js and dependencies are installed:
   ```bash
   npm install
   ```

2. Start the local Vite development server:
   ```bash
   npm run dev
   ```
   *The client dev server proxies `/api` requests to `http://0.0.0.0:8000` (the backend server).*

3. Open your browser and navigate to `http://localhost:5173/` (or the URL outputted by Vite).

---

## Verifying the Level Progression UX

1. Navigate to **Groups** in the sidebar.
2. Select any active group to view its details page (`/groups/:id`).
3. **Verify Dialog Loading & Inputs Lock**:
   - Click "New Level" (either in the Group Info Card header or inside the Levels tab).
   - Change some values in the form. Toggle "Complete current level" and "Auto-migrate active enrollments" checkboxes. Verify that the **Progression Summary Callout Box** at the top of the dialog updates its list dynamically.
   - Click "Confirm Progression".
   - Immediately verify:
     - All inputs, selectors (Courses, Instructors dropdowns), checkboxes, and toggles become disabled.
     - The "Cancel" button is disabled.
     - The "Confirm Progression" button displays a spinner and is disabled.
     - Attempt to close by clicking the X icon or outside/background overlay. It should prevent closing.
4. **Verify Dialog Error Recovery**:
   - If the API returns an error, verify that:
     - The error is displayed as a Toast notification.
     - The dialog remains open.
     - All buttons, selector fields, and input fields are re-enabled.
     - Your previous form input values are fully preserved.
5. **Verify Group Info Card Level Up**:
   - If the group has completed students, click the "Level Up" button.
   - Verify that the button immediately disables itself and shows loading state/spinner during execution.
