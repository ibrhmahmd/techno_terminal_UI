# Missing Features Implementation Plan

## Overview
This document outlines the implementation plan for wiring up all remaining API endpoints and completing missing features across all pages.

---

## Current Implementation Status

### Already Implemented (✅)
- **Auth**: login, logout
- **Academics**: getGroups, getGroupDetails, getGroupSessions, getDailySchedule, getGroupProgress
- **CRM**: getStudents, getStudent, getParents, getParent, searchStudents, searchParents
- **Enrollments**: createEnrollment, transferEnrollment, deleteEnrollment, getStudentEnrollments, getActiveEnrollments
- **Attendance**: getSessionAttendance, markAttendance
- **Finance**: createReceipt, searchReceipts, getStudentBalance, downloadReceiptPDF, previewOverpaymentRisk
- **Analytics**: getDashboardSummary

### Missing Implementation (❌)

---

## Phase A: Student/Parent CRUD Operations

### Files to Modify

#### 1. `src/api/crm.ts` (Additions)
**New Functions (6 total):**
```typescript
export async function createStudent(data: CreateStudentInput): Promise<Student>
export async function updateStudent(id: string, data: UpdateStudentDTO): Promise<Student>
export async function deleteStudent(id: string): Promise<void>
export async function createParent(data: CreateParentInput): Promise<Parent>
export async function updateParent(id: string, data: UpdateParentDTO): Promise<Parent>
export async function deleteParent(id: string): Promise<void>
export async function getStudentParents(id: string): Promise<Parent[]>
export async function linkParentToStudent(studentId: string, parentId: string): Promise<void>
```

**New Interfaces (4 total):**
```typescript
interface CreateStudentInput { full_name: string; birth_date?: string | null; gender?: string | null; phone?: string | null; notes?: string | null }
interface UpdateStudentDTO { full_name?: string; birth_date?: string | null; gender?: string | null; phone?: string | null; notes?: string | null; is_active?: boolean }
interface CreateParentInput { full_name: string; phone?: string | null; email?: string | null; address?: string | null; national_id?: string | null }
interface UpdateParentDTO { full_name?: string; phone?: string | null; email?: string | null; address?: string | null; national_id?: string | null; is_active?: boolean }
```

**Endpoints to Wire:**
- `POST /api/v1/crm/students` - Register a new student
- `PATCH /api/v1/crm/students/{student_id}` - Update student profile
- `DELETE /api/v1/crm/students/{student_id}` - Delete student (if backend supports)
- `POST /api/v1/crm/parents` - Register a new parent
- `PATCH /api/v1/crm/parents/{parent_id}` - Update parent profile
- `DELETE /api/v1/crm/parents/{parent_id}` - Delete parent (if backend supports)
- `GET /api/v1/crm/students/{student_id}/parents` - Get all parents linked to a student

---

#### 2. `src/components/crm/StudentForm.tsx` (NEW FILE)
**Purpose:** Reusable form for creating/editing students
**Props Interface:**
```typescript
interface StudentFormProps {
  initialData?: Partial<Student>
  onSubmit: (data: CreateStudentInput | UpdateStudentDTO) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
}
```
**Features:**
- Full name input (required)
- Birth date picker (optional)
- Gender select (optional)
- Phone input (optional)
- Notes textarea (optional)
- Form validation
- Loading state during submit

**Relationships:**
- Used by: StudentDetailPage (edit mode), DirectoryPage (create mode via modal)
- Uses: Modal component

---

#### 3. `src/components/crm/ParentForm.tsx` (NEW FILE)
**Purpose:** Reusable form for creating/editing parents
**Props Interface:**
```typescript
interface ParentFormProps {
  initialData?: Partial<Parent>
  onSubmit: (data: CreateParentInput | UpdateParentDTO) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
}
```
**Features:**
- Full name input (required)
- Phone input (optional)
- Email input (optional)
- Address textarea (optional)
- National ID input (optional)
- Form validation
- Loading state during submit

**Relationships:**
- Used by: ParentDetailPage (edit mode), DirectoryPage (create mode via modal)
- Uses: Modal component

---

#### 4. `src/components/crm/LinkParentModal.tsx` (NEW FILE)
**Purpose:** Modal to link existing parent to a student
**Props Interface:**
```typescript
interface LinkParentModalProps {
  studentId: string
  isOpen: boolean
  onClose: () => void
  onLinked: () => void
}
```
**Features:**
- Search existing parents
- Show currently linked parents
- Add/remove parent links
- Loading state

**Relationships:**
- Used by: StudentDetailPage
- Uses: Modal, SearchBar, ParentList components

---

#### 5. `src/pages/StudentDetailPage.tsx` (Modifications)
**Current:** Read-only view with mock data fallbacks
**Changes Required:**
```typescript
// Add imports
import { StudentForm } from '../components/crm/StudentForm'
import { LinkParentModal } from '../components/crm/LinkParentModal'
import { updateStudent, deleteStudent, getStudentParents } from '../api/crm'

// Add state
const [isEditModalOpen, setIsEditModalOpen] = useState(false)
const [isLinkParentModalOpen, setIsLinkParentModalOpen] = useState(false)
const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

// Add handlers
const handleUpdateStudent = async (data: UpdateStudentDTO) => { ... }
const handleDeleteStudent = async () => { ... }
const handleLinkParent = async (parentId: string) => { ... }
```

**New UI Elements:**
- "Edit" button in header
- "Delete" button (with confirmation modal)
- "Link Parent" button in Parents section
- Edit modal with StudentForm
- Delete confirmation modal (reuse Modal component)

---

#### 6. `src/pages/ParentDetailPage.tsx` (Modifications)
**Current:** Read-only view
**Changes Required:**
```typescript
// Add imports
import { ParentForm } from '../components/crm/ParentForm'
import { updateParent, deleteParent } from '../api/crm'

// Add state
const [isEditModalOpen, setIsEditModalOpen] = useState(false)
const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

// Add handlers
const handleUpdateParent = async (data: UpdateParentDTO) => { ... }
const handleDeleteParent = async () => { ... }
```

**New UI Elements:**
- "Edit" button in header
- "Delete" button (with confirmation modal)
- Edit modal with ParentForm

---

#### 7. `src/pages/DirectoryPage.tsx` (Modifications)
**Current:** List view only
**Changes Required:**
```typescript
// Add imports
import { StudentForm } from '../components/crm/StudentForm'
import { ParentForm } from '../components/crm/ParentForm'
import { createStudent, createParent } from '../api/crm'

// Add state
const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false)
const [isCreateParentModalOpen, setIsCreateParentModalOpen] = useState(false)

// Add handlers
const handleCreateStudent = async (data: CreateStudentInput) => { ... }
const handleCreateParent = async (data: CreateParentInput) => { ... }
```

**New UI Elements:**
- "+ Add Student" button (when Students tab active)
- "+ Add Parent" button (when Parents tab active)
- Create modals with respective forms

---

## Phase B: Session Management

### Files to Modify

#### 8. `src/api/academics.ts` (Additions)
**New Functions (4 total):**
```typescript
export async function updateSession(id: string, data: UpdateSessionDTO): Promise<Session>
export async function deleteSession(id: string): Promise<void>
export async function cancelSession(id: string): Promise<Session>
export async function addExtraSession(groupId: string, data: AddExtraSessionInput): Promise<Session>
export async function markSubstituteInstructor(sessionId: string, instructorId: string): Promise<Session>
```

**New Interfaces (1 total):**
```typescript
interface UpdateSessionDTO {
  date?: string
  start_time?: string
  end_time?: string
  status?: 'scheduled' | 'completed' | 'cancelled'
  notes?: string | null
}

interface AddExtraSessionInput {
  date: string
  start_time: string
  end_time: string
  notes?: string | null
}
```

**Endpoints to Wire:**
- `PATCH /api/v1/academics/sessions/{session_id}` - Update session
- `DELETE /api/v1/academics/sessions/{session_id}` - Delete session
- `POST /api/v1/academics/sessions/{session_id}/cancel` - Cancel session
- `POST /api/v1/academics/groups/{group_id}/sessions` - Add extra session
- `POST /api/v1/academics/sessions/{session_id}/substitute` - Mark substitute instructor

---

#### 9. `src/components/attendance/EditSessionPopup.tsx` (Already Exists - Wire It Up)
**Current:** Component exists but not used
**Changes Required in `GroupDetailPage.tsx`:**
```typescript
// Add state
const [editingSession, setEditingSession] = useState<Session | null>(null)

// Add handler
const handleUpdateSession = async (sessionId: string, data: UpdateSessionDTO) => {
  await updateSession(sessionId, data)
  // Refresh sessions list
  const updatedSessions = await getGroupSessions(groupId)
  setSessions(updatedSessions)
  setEditingSession(null)
}

// Add to JSX (in sessions list)
<EditSessionPopup
  session={editingSession}
  isOpen={!!editingSession}
  onClose={() => setEditingSession(null)}
  onSave={handleUpdateSession}
/>
```

---

#### 10. `src/components/groups/AddSessionModal.tsx` (NEW FILE)
**Purpose:** Modal to add extra session to a group
**Props Interface:**
```typescript
interface AddSessionModalProps {
  groupId: string
  isOpen: boolean
  onClose: () => void
  onAdded: (session: Session) => void
}
```
**Features:**
- Date picker
- Start time input
- End time input
- Notes textarea
- Form validation

**Relationships:**
- Used by: GroupDetailPage
- Uses: Modal component

---

#### 11. `src/pages/GroupDetailPage.tsx` (Modifications)
**Changes Required:**
```typescript
// Add imports
import { EditSessionPopup } from '../components/attendance/EditSessionPopup'
import { AddSessionModal } from '../components/groups/AddSessionModal'
import { updateSession, deleteSession, cancelSession, addExtraSession } from '../api/academics'

// Add state
const [editingSession, setEditingSession] = useState<Session | null>(null)
const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)

// Add handlers
const handleEditSession = (session: Session) => setEditingSession(session)
const handleDeleteSession = async (sessionId: string) => { ... }
const handleCancelSession = async (sessionId: string) => { ... }
const handleAddSession = async (data: AddExtraSessionInput) => { ... }
```

**New UI Elements:**
- "+ Add Session" button in sessions section
- Edit button on each session row
- Cancel button on each session row
- Delete button on each session row (with confirmation)

---

## Phase C: Group Management

### Files to Modify

#### 12. `src/api/academics.ts` (Additions)
**New Functions (3 total):**
```typescript
export async function createGroup(data: ScheduleGroupInput): Promise<Group>
export async function updateGroup(id: string, data: UpdateGroupDTO): Promise<Group>
export async function progressGroupLevel(id: string): Promise<Group>
```

**New Interfaces (2 total):**
```typescript
interface ScheduleGroupInput {
  course_id: string
  instructor_id: string
  schedule_day: string
  schedule_time: string
  max_capacity: number
  classroom?: string | null
}

interface UpdateGroupDTO {
  instructor_id?: string
  schedule_day?: string
  schedule_time?: string
  max_capacity?: number
  classroom?: string | null
  status?: 'active' | 'inactive'
}
```

**Endpoints to Wire:**
- `POST /api/v1/academics/groups` - Schedule a new group
- `PATCH /api/v1/academics/groups/{group_id}` - Update a group
- `POST /api/v1/academics/groups/{group_id}/progress-level` - Progress group to next level

---

#### 13. `src/components/groups/GroupForm.tsx` (NEW FILE)
**Purpose:** Form for creating/editing groups
**Props Interface:**
```typescript
interface GroupFormProps {
  initialData?: Partial<Group>
  onSubmit: (data: ScheduleGroupInput | UpdateGroupDTO) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
  courses: Course[] // For course selection dropdown
  instructors: Instructor[] // For instructor selection dropdown
}
```
**Features:**
- Course dropdown (required)
- Instructor dropdown (required)
- Schedule day select (required)
- Schedule time input (required)
- Max capacity number input (required)
- Classroom input (optional)

---

#### 14. `src/pages/GroupsPage.tsx` (Modifications)
**Changes Required:**
```typescript
// Add imports
import { GroupForm } from '../components/groups/GroupForm'
import { createGroup } from '../api/academics'
import { getCourses } from '../api/academics' // Need to add this too

// Add state
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
const [courses, setCourses] = useState<Course[]>([])
const [instructors, setInstructors] = useState<Instructor[]>([])

// Add handler
const handleCreateGroup = async (data: ScheduleGroupInput) => { ... }
```

**New UI Elements:**
- "+ Schedule Group" button in header
- Create modal with GroupForm

---

## Phase D: Reports & Analytics

### Files to Modify

#### 15. `src/api/analytics.ts` (Additions)
**New Functions (12 total):**
```typescript
// Academic Analytics
export async function getUnpaidAttendees(targetDate?: string): Promise<UnpaidAttendeeDTO[]>
export async function getGroupRoster(groupId: string, levelNumber: number): Promise<GroupRosterRowDTO[]>
export async function getAttendanceHeatmap(groupId: string, levelNumber: number): Promise<AttendanceHeatmapRowDTO[]>

// BI Analytics
export async function getEnrollmentTrend(cutoff?: string): Promise<EnrollmentTrendDTO[]>
export async function getRetentionMetrics(): Promise<RetentionMetricsDTO[]>
export async function getInstructorPerformance(): Promise<InstructorPerformanceDTO[]>
export async function getLevelRetentionFunnel(): Promise<LevelRetentionFunnelDTO[]>
export async function getInstructorValueMatrix(): Promise<InstructorValueMatrixDTO[]>
export async function getScheduleUtilization(): Promise<ScheduleUtilizationDTO[]>
export async function getFlightRiskStudents(): Promise<FlightRiskStudentDTO[]>

// Financial Analytics
export async function getRevenueByDate(start: string, end: string): Promise<RevenueByDateDTO[]>
export async function getRevenueByMethod(start: string, end: string): Promise<RevenueByMethodDTO[]>
export async function getOutstandingByGroup(): Promise<OutstandingByGroupDTO[]>
export async function getTopDebtors(limit?: number): Promise<TopDebtorDTO[]>

// Competition Analytics
export async function getCompetitionFeeSummary(): Promise<CompetitionFeeSummaryDTO[]>
```

**Endpoints to Wire:**
- `GET /api/v1/analytics/academics/unpaid-attendees`
- `GET /api/v1/analytics/academics/groups/{group_id}/roster`
- `GET /api/v1/analytics/academics/groups/{group_id}/heatmap`
- `GET /api/v1/analytics/bi/enrollment-trend`
- `GET /api/v1/analytics/bi/retention`
- `GET /api/v1/analytics/bi/instructor-performance`
- `GET /api/v1/analytics/bi/retention-funnel`
- `GET /api/v1/analytics/bi/instructor-value`
- `GET /api/v1/analytics/bi/schedule-utilization`
- `GET /api/v1/analytics/bi/flight-risk`
- `GET /api/v1/analytics/finance/revenue-by-date`
- `GET /api/v1/analytics/finance/revenue-by-method`
- `GET /api/v1/analytics/finance/outstanding-by-group`
- `GET /api/v1/analytics/finance/top-debtors`
- `GET /api/v1/analytics/competitions/fee-summary`

---

#### 16. `src/components/reports/` (NEW DIRECTORY + 4 NEW FILES)

**16a. `EnrollmentTrendChart.tsx`**
- Line chart showing enrollment over time
- Uses: Recharts or Chart.js

**16b. `RevenueChart.tsx`**
- Bar chart for revenue by date/method
- Date range picker

**16c. `InstructorPerformanceTable.tsx`**
- Data table with instructor metrics
- Sortable columns

**16d. `DebtorsTable.tsx`**
- Top debtors list with amounts
- Link to student detail

---

#### 17. `src/pages/ReportsPage.tsx` (Major Refactor)
**Current:** Summary cards + placeholders
**New Structure:**
```typescript
// Tabbed interface
const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'academic' | 'instructors'>('overview')

// Overview Tab (existing + enhanced)
// Financial Tab (new)
// Academic Tab (new)
// Instructors Tab (new)
```

**New Components Used:**
- EnrollmentTrendChart
- RevenueChart
- InstructorPerformanceTable
- DebtorsTable

---

## Phase E: Competition Management

### Files to Create/Modify

#### 18. `src/api/competitions.ts` (NEW FILE)
**Functions (9 total):**
```typescript
export async function getCompetitions(): Promise<CompetitionDTO[]>
export async function createCompetition(data: CreateCompetitionInput): Promise<CompetitionDTO>
export async function getCompetition(id: string): Promise<CompetitionDTO>
export async function getCompetitionCategories(competitionId: string): Promise<CompetitionCategoryDTO[]>
export async function addCompetitionCategory(competitionId: string, data: AddCategoryInput): Promise<CompetitionCategoryDTO>
export async function registerTeam(data: RegisterTeamInput): Promise<TeamRegistrationResultDTO>
export async function getCategoryTeams(competitionId: string, categoryId: string): Promise<TeamWithMembersDTO[]>
export async function markCompetitionFeePaid(teamMemberId: string): Promise<void>
```

---

#### 19. `src/pages/CompetitionsPage.tsx` (NEW FILE)
**Features:**
- List all competitions
- Create competition modal
- View competition details with categories
- Register team flow

---

#### 20. `src/components/competitions/` (NEW DIRECTORY)
- `CompetitionCard.tsx`
- `CompetitionForm.tsx`
- `CategoryList.tsx`
- `TeamRegistrationModal.tsx`

---

## Phase F: HR Module

### Files to Create/Modify

#### 21. `src/api/hr.ts` (NEW FILE)
**Functions (7 total):**
```typescript
export async function getEmployees(): Promise<EmployeeListItem[]>
export async function createEmployee(data: EmployeeCreateInput): Promise<EmployeePublic>
export async function getEmployee(id: string): Promise<EmployeePublic>
export async function updateEmployee(id: string, data: EmployeeCreateInput): Promise<EmployeePublic>
export async function getStaffAccounts(): Promise<StaffAccountPublic[]>
export async function logAttendance(data: AttendanceLogInput): Promise<AttendanceLogOutput>
```

---

#### 22. `src/pages/StaffPage.tsx` (NEW FILE)
**Features:**
- Employee list
- Add employee modal
- Employee detail view
- Attendance logging

---

## File Summary

### New Files (15 total)

#### API Files (2)
1. `src/api/competitions.ts` - Competition API functions
2. `src/api/hr.ts` - HR API functions

#### Component Files (9)
3. `src/components/crm/StudentForm.tsx` - Student create/edit form
4. `src/components/crm/ParentForm.tsx` - Parent create/edit form
5. `src/components/crm/LinkParentModal.tsx` - Link parent to student modal
6. `src/components/groups/GroupForm.tsx` - Group create/edit form
7. `src/components/groups/AddSessionModal.tsx` - Add extra session modal
8. `src/components/reports/EnrollmentTrendChart.tsx` - Enrollment chart
9. `src/components/reports/RevenueChart.tsx` - Revenue chart
10. `src/components/reports/InstructorPerformanceTable.tsx` - Instructor metrics table
11. `src/components/reports/DebtorsTable.tsx` - Top debtors table

#### Page Files (2)
12. `src/pages/CompetitionsPage.tsx` - Competitions management page
13. `src/pages/StaffPage.tsx` - HR/Staff management page

#### Component Directories (2 new)
14. `src/components/competitions/` - Competition-related components
15. `src/components/reports/` - Report visualization components

### Modified Files (8 total)

1. `src/api/crm.ts` - Add CRUD operations
2. `src/api/academics.ts` - Add session/group management
3. `src/api/analytics.ts` - Add all BI endpoints
4. `src/pages/DirectoryPage.tsx` - Add create buttons/modals
5. `src/pages/StudentDetailPage.tsx` - Add edit/delete/link functionality
6. `src/pages/ParentDetailPage.tsx` - Add edit/delete functionality
7. `src/pages/GroupDetailPage.tsx` - Wire up EditSessionPopup, add session management
8. `src/pages/GroupsPage.tsx` - Add create group functionality
9. `src/pages/ReportsPage.tsx` - Replace placeholders with actual reports
10. `src/App.tsx` - Add routes for Competitions and Staff pages

### Relationship Diagram

```
App.tsx
├── Routes
│   ├── /competitions → CompetitionsPage.tsx
│   └── /staff → StaffPage.tsx
│
├── API Layer
│   ├── crm.ts ←── StudentForm.tsx, ParentForm.tsx, LinkParentModal.tsx
│   ├── academics.ts ←── GroupForm.tsx, AddSessionModal.tsx
│   ├── analytics.ts ←── ReportsPage.tsx, EnrollmentTrendChart.tsx, etc.
│   ├── competitions.ts ←── CompetitionsPage.tsx
│   └── hr.ts ←── StaffPage.tsx
│
└── Pages
    ├── DirectoryPage.tsx ←── StudentForm (create), ParentForm (create)
    ├── StudentDetailPage.tsx ←── StudentForm (edit), LinkParentModal
    ├── ParentDetailPage.tsx ←── ParentForm (edit)
    ├── GroupsPage.tsx ←── GroupForm (create)
    ├── GroupDetailPage.tsx ←── EditSessionPopup, AddSessionModal
    └── ReportsPage.tsx ←── EnrollmentTrendChart, RevenueChart, etc.
```

---

## Implementation Priority

### Priority 1 (Core CRM - Student/Parent CRUD)
- Files: 1, 2, 3, 4, 5, 6, 7 (7 files)
- Impact: Complete CRM functionality
- Est. Time: 2-3 days

### Priority 2 (Session Management)
- Files: 8, 9, 10, 11 (4 files)
- Impact: Complete attendance workflow
- Est. Time: 1-2 days

### Priority 3 (Group Management)
- Files: 12, 13, 14 (3 files)
- Impact: Complete group lifecycle
- Est. Time: 1-2 days

### Priority 4 (Reports - Basic)
- Files: 15, 16, 17 (3 files)
- Impact: Working reports (not placeholders)
- Est. Time: 2-3 days

### Priority 5 (Competitions & HR)
- Files: 18, 19, 20, 21, 22 (5 files)
- Impact: Extended modules
- Est. Time: 3-4 days

**Total: 22 files (15 new, 7 modified)**
**Est. Total Time: 9-14 days**

---

## Next Steps

1. **Choose Priority Level** - Which phase to start with?
2. **Confirm Backend Endpoints** - Are all listed endpoints available?
3. **Begin Implementation** - Start with Priority 1 (CRM CRUD)
