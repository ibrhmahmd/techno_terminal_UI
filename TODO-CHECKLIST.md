# CRM Directory UI-API Alignment - TODO Checklist

## ✅ Completed Implementation

### API Stubs Created (Lazy Loading)
- ✅ `src/api/crm/students/enrollments.ts` - API stubs for courses, competitions, teams
- ✅ `src/hooks/students/useStudentCourses.ts` - Lazy loading hook
- ✅ `src/hooks/students/useStudentCompetitions.ts` - Lazy loading hook
- ✅ `src/hooks/students/useStudentTeams.ts` - Lazy loading hook
- ✅ `src/hooks/useParentStudents.ts` - Parent students hook

### Type Definitions Added
- ✅ `CourseRecord` interface in `models.ts`
- ✅ `CompetitionRecord` interface in `models.ts`
- ✅ `TeamRecord` interface in `models.ts`
- ✅ All types exported from barrel files

### Student Grouping Implementation
- ✅ `src/config/studentGrouping.ts` - Age bucket config & defaults
- ✅ `src/store/groupingSettingsStore.ts` - Zustand store for custom buckets
- ✅ `src/components/settings/AgeBucketEditor.tsx` - Bucket configuration UI
- ✅ `src/components/directory/StudentGroupBySelector.tsx` - Group by dropdown
- ✅ `src/hooks/useStudentsGrouped.ts` - Grouping hook with pagination
- ✅ `src/api/crm/students/search.ts` - Updated API with pagination & filters
- ✅ `DirectoryPage.tsx` - Grouping state & conditional rendering
- ✅ `CRMSettingsTab.tsx` - Age bucket configuration section

### Critical Type Errors Fixed
- ✅ `StudentDetailPage.tsx` - Changed `student?.enrollments` to `details?.enrollments`
- ✅ `StudentDetailPage.tsx` - Changed `g.level` to `g.level_number`
- ✅ `StudentDetailPage.tsx` - Changed `details?.parents` to `details?.primary_parent`
- ✅ `OverviewTab.tsx` - Changed from `parents: Parent[]` to `primaryParent?: ParentInfo | null`
- ✅ `OverviewTab.tsx` - UI updated to display single primary parent

### Status Selection Implemented
- ✅ `StudentForm.tsx` - Added status dropdown (active/waiting/inactive)
- ✅ `DirectoryPage.tsx` - `handleCreateStudent` sets status after creation
- ✅ `DirectoryPage.tsx` - `handleEditStudent` updates status if changed
- ✅ `UpdateStudentDTO` type used in edit handler

### Form Type Fixes
- ✅ `ParentForm.tsx` - Using `ParentCreate` instead of `Omit<Parent, 'id'>`
- ✅ `StudentForm.tsx` - Using `ParentListItem` for selected parent

### Lazy Loading Integration
- ✅ `StudentDetailPage.tsx` - Uses `useStudentCourses`, `useStudentCompetitions`, `useStudentTeams`
- ✅ Tabs (Courses, Competitions, Teams) only fetch data when active

---

## 🔮 TODO - Backend Endpoints Required

### 1. Student Courses Endpoint
**File:** `src/api/crm/students/enrollments.ts`
**Function:** `getStudentCourses(studentId: number)`
**TODO:** Implement `GET /crm/students/{student_id}/courses`
```typescript
// Returns: CourseRecord[]
// Fields: id, course_name, start_date, end_date, status, level, final_grade, instructor_name
```

### 2. Student Competitions Endpoint
**File:** `src/api/crm/students/enrollments.ts`
**Function:** `getStudentCompetitions(studentId: number)`
**TODO:** Implement `GET /crm/students/{student_id}/competitions`
```typescript
// Returns: CompetitionRecord[]
// Fields: id, competition_name, date, result, achievement, notes
```

### 3. Student Teams Endpoint
**File:** `src/api/crm/students/enrollments.ts`
**Function:** `getStudentTeams(studentId: number)`
**TODO:** Implement `GET /crm/students/{student_id}/teams`
```typescript
// Returns: TeamRecord[]
// Fields: id, team_name, role, start_date, end_date, status
```

### 4. Parent Students Endpoint
**File:** `src/hooks/useParentStudents.ts`
**Function:** `getParentStudents(parentId: number)`
**TODO:** Implement `GET /crm/parents/{parent_id}/students`
```typescript
// Returns: StudentListItem[]
// Currently using workaround in ParentDetailPage.tsx
```

### 5. Student Grouping Endpoint (New)
**File:** `src/api/crm/students/search.ts`
**Function:** `getStudentsGrouped()`
**TODO:** Backend implement pagination on `GET /crm/students/grouped`
```typescript
// Required: skip, limit parameters for pagination
// Required: age_buckets parameter for custom buckets
// Required: competition group_by option
// Required: status_filter for waiting tab grouping
```

---

## 📝 Notes

### How Lazy Loading Works
1. When user clicks on "Courses" tab, `activeTab` becomes `'courses'`
2. `useStudentCourses(studentId, activeTab === 'courses')` triggers
3. The `enabled` flag becomes `true`, causing React Query to fetch
4. Console warning appears: "API not implemented: getStudentCourses"
5. Empty array is returned, showing empty state in UI

### When Backend Endpoints Are Ready
1. Uncomment and implement the actual `client.get()` calls in `enrollments.ts`
2. Remove the `console.warn()` messages
3. The hooks will automatically start fetching real data
4. No changes needed to UI components

### Status Flow on Create
1. Admin fills form and selects status (e.g., "waiting")
2. `createStudent()` creates student with default "active" status
3. If status != "active", `updateStudentStatus()` is called
4. Student is created with correct status
5. Parent is linked if selected

---

## 🧪 Testing Checklist

### CRM Features
- [ ] Create student with "active" status - appears in active list
- [ ] Create student with "waiting" status - appears in waiting list
- [ ] Create student with "inactive" status - doesn't appear in active list
- [ ] Edit student - status change updates correctly
- [ ] Student detail page - Overview tab shows primary parent
- [ ] Student detail page - Click Courses tab - no crash, shows empty/loading state
- [ ] Student detail page - Click Competitions tab - no crash
- [ ] Student detail page - Click Teams tab - no crash
- [ ] Console shows "API not implemented" warnings for lazy-loaded tabs

### Student Grouping Features
- [ ] Directory - Students tab shows GroupBySelector (List/Status/Age/Competition)
- [ ] Directory - Waiting tab shows GroupBySelector (List/Age/Competition)
- [ ] Grouping by Status shows Active/Waiting/Inactive tabs
- [ ] Grouping by Age shows configured bucket tabs (4-7, 7-9, 9-12, 12-15, 15+)
- [ ] Grouping by Competition shows competition tabs
- [ ] Settings - Age Bucket Editor allows customizing buckets
- [ ] Settings - Age bucket validation shows gaps/overlaps
- [ ] Tab switching resets grouping to "List View"
- [ ] Search disables grouping (forces flat view)
- [ ] Build passes with 0 TypeScript errors (`npx tsc --noEmit`)
