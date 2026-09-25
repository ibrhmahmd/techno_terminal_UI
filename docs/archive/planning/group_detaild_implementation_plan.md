# Group Details Page - Comprehensive Implementation Plan

## Executive Summary

This plan covers implementing a multi-level Group Details page with historical level-based pricing and a comprehensive History tab. All files will stay under 150 lines.

---

## 1. API Endpoints Analysis

### 1.1 Existing Endpoints (Verified)
| # | Method | Endpoint | Status |
|---|--------|----------|--------|
| 1 | GET | `/academics/groups/{id}` | ✅ |
| 2 | GET | `/academics/groups/{id}/enriched` | ✅ |
| 3 | GET | `/academics/groups/{id}/sessions` | ✅ |
| 4 | PATCH | `/academics/groups/{id}` | ✅ |
| 5 | DELETE | `/academics/groups/{id}` | ✅ |
| 6 | POST | `/academics/groups/{id}/progress-level` | ✅ |

### 1.2 Missing Endpoints Required
| # | Method | Endpoint | Priority |
|---|--------|----------|----------|
| 8 | GET | `/academics/groups/{id}/levels` | **HIGH** |
| 9 | GET | `/academics/groups/{id}/enrollment-history` | **HIGH** |
| 10 | GET | `/academics/groups/{id}/competitions` | **MEDIUM** |
| 11 | GET | `/academics/groups/{id}/instructor-history` | **MEDIUM** |
| 12 | GET | `/academics/levels` | **HIGH** |

### 1.3 New DTO Types Needed
```typescript
interface GroupLevelHistoryDTO {
  id: number;
  level_number: number;
  level_name: string;
  start_date: string;
  end_date?: string;
  pricing_snapshot: {
    monthly_fee: number;
    session_fee: number;
    currency: string;
  };
  enrollment_count_start: number;
  enrollment_count_end?: number;
  sessions_count: number;
  completion_rate: number;
}

interface EnrollmentHistoryDTO {
  id: number;
  student_id: number;
  student_name: string;
  action: 'enrolled' | 'transferred_in' | 'withdrawn' | 'transferred_out' | 'graduated';
  date: string;
  level_at_time: number;
  notes?: string;
}

interface CompetitionParticipationDTO {
  id: number;
  competition_id: number;
  competition_name: string;
  level_at_time: number;
  event_date: string;
  result?: 'winner' | 'runner_up' | 'participant' | 'disqualified';
  score?: number;
}

interface InstructorAssignmentDTO {
  id: number;
  instructor_id: number;
  instructor_name: string;
  start_date: string;
  end_date?: string;
  assignment_type: 'primary' | 'substitute' | 'assistant';
  reason?: string;
}
```

---

## 2. File Structure (All Under 150 Lines)

### 2.1 New Components
```
src/components/groups/
├── detail/
│   ├── GroupInfoCard.tsx           # (80 lines) - Main group info
│   ├── LevelSelector.tsx           # (90 lines) - Level progression UI
│   ├── LevelInfoPanel.tsx          # (85 lines) - Current level details
│   ├── GroupPricingCard.tsx        # (95 lines) - Historical pricing
│   ├── EditGroupDialog.tsx         # (110 lines) - Enhanced edit modal
│   └── TabNavigation.tsx           # (50 lines) - Updated (no roster)
│
├── history/
│   ├── HistoryTab.tsx              # (100 lines) - Main history container
│   ├── EnrollmentHistoryTable.tsx  # (110 lines) - Enrollment tracking
│   ├── CompetitionRecords.tsx      # (90 lines) - Competition records
│   ├── InstructorHistoryTable.tsx  # (95 lines) - Instructor changes
│   ├── LevelTimeline.tsx           # (85 lines) - Visual timeline
│   └── HistoryStats.tsx            # (70 lines) - Analytics cards
│
└── shared/
    ├── GroupStatusBadge.tsx        # (40 lines)
    └── LevelBadge.tsx              # (35 lines)
```

### 2.2 New Hooks
```
src/hooks/
├── useGroupDetail.ts          # (120 lines) - Enhanced detail hook
├── useGroupHistory.ts         # (110 lines) - History data fetching
├── useGroupLevels.ts          # (100 lines) - Level management
└── useGroupMutations.ts       # (115 lines) - CRUD operations
```

### 2.3 Modified Files
```
src/pages/GroupDetailPage.tsx      # (135 lines) - Refactored
src/api/academics/groups.ts        # (+60 lines) - New API functions
src/api/academics/types.ts         # (+80 lines) - New DTOs
```

---

## 3. Component Specifications

### 3.1 GroupInfoCard
**Props**: `group`, `currentLevel`, `onEdit`, `onDelete`, `onLevelUp`, `canLevelUp`
**Features**:
- Group name, status badge
- Current level with visual indicator
- Instructor info
- Schedule display
- Quick actions (Edit, Delete, Level Up)

### 3.2 EditGroupDialog (Enhanced)
**New Fields** (existing + these):
- Group Name (text input)
- Status (radio: active/inactive/archived)
- Notes (textarea)
- Instructor (dropdown)
- Day, Time (existing)
- Max Capacity (number)

### 3.3 HistoryTab
**Structure**:
```
┌─────────────────────────────────────┐
│  History Stats Cards (4 metrics)    │
├─────────────────────────────────────┤
│  Tabs: Enrollment | Competitions    │
│        | Instructor Changes         │
├─────────────────────────────────────┤
│  DataTable with filters             │
└─────────────────────────────────────┘
```

**Sub-tabs**:
1. **Enrollment History**: Shows enrollments/withdrawals/transfers per level
2. **Competitions**: Competition records with results (winner/runner-up/participant)
3. **Instructor Changes**: Assignment history with dates and reasons

### 3.4 LevelSelector
**Props**: `levels`, `activeLevelId`, `onLevelChange`, `currentLevelNumber`
**Features**:
- Horizontal timeline of levels
- Visual progression (1→2→3→4)
- Active level highlighted
- Click to view historical data per level

### 3.5 GroupPricingCard
**Props**: `pricingHistory`, `currency`
**Features**:
- Timeline of pricing per level
- Current pricing highlighted
- Price trend indicators
- Expandable historical view

---

## 4. Tab Navigation Update

**Current Tabs**: `roster` | `attendance` | `history`  
**New Tabs**: `info` | `attendance` | `history`

- **Remove**: Roster tab completely
- **Add**: Info tab (main group information with levels)
- **Keep**: Attendance and History tabs

---

## 5. Implementation Phases

### Phase 1: Foundation (Week 1)
1. Add new DTO types to [types.ts](cci:7://file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/app/src/api/reports/types.ts:0:0-0:0)
2. Add mock API functions for missing endpoints
3. Create [useGroupDetail](cci:1://file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/app/src/pages/GroupDetailPage.tsx:28:0-68:1), `useGroupHistory`, `useGroupMutations` hooks

### Phase 2: Core Components (Week 1-2)
1. Create `GroupInfoCard`, `LevelSelector`, `LevelInfoPanel`
2. Create `GroupPricingCard` with historical pricing
3. Enhance `EditGroupDialog` with new fields (name, status, notes)

### Phase 3: History Tab (Week 2)
1. Create [HistoryTab](cci:1://file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/app/src/components/groups/HistoryTab.tsx:20:0-199:1) container with sub-tabs
2. Create `EnrollmentHistoryTable` with filters
3. Create `CompetitionRecords` and `InstructorHistoryTable`
4. Create `LevelTimeline` visual component

### Phase 4: Page Integration (Week 2-3)
1. Refactor [GroupDetailPage.tsx](cci:7://file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/app/src/pages/GroupDetailPage.tsx:0:0-0:0) with new structure
2. Update [TabNavigation](cci:1://file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/app/src/components/groups/TabNavigation.tsx:6:0-37:1) (remove roster)
3. Integrate level selection with attendance grid
4. Wire all components together

### Phase 5: Testing (Week 3)
1. Unit tests for all new components
2. Integration tests for user flows
3. Responsive design testing
4. Accessibility audit

---

## 6. Missing API Documentation (For Backend Team)

### Critical Endpoints

**GET /academics/groups/{id}/levels**
```yaml
Returns: Array of GroupLevelHistoryDTO
Purpose: Level progression with pricing snapshots
```

**GET /academics/groups/{id}/enrollment-history**
```yaml
Query params: level, action, skip, limit
Returns: Paginated EnrollmentHistoryDTO
Purpose: Track enrollments/withdrawals per level
```

**GET /academics/groups/{id}/competitions**
```yaml
Returns: Array of CompetitionParticipationDTO
Purpose: Competition records per level
```

**GET /academics/groups/{id}/instructor-history**
```yaml
Returns: Array of InstructorAssignmentDTO
Purpose: Instructor changes with dates
```

---

## 7. Technical Requirements

### State Management
- React `useState` for UI state
- Custom hooks for server state
- Optimistic updates for attendance

### Error Handling Pattern
```typescript
try {
  await operation();
  showToast('success');
} catch (err) {
  setError(err.message);
  showToast('error');
} finally {
  setIsProcessing(false);
}
```

### Responsive Breakpoints
- Mobile (<640px): Single column, horizontal scroll
- Tablet (640-1024px): 2-column grid
- Desktop (>1024px): 3-column layout

---

## 8. Success Criteria

**Functional**:
- [ ] Group details display with level progression
- [ ] Historical pricing per level visible
- [ ] Edit dialog includes name, notes, status
- [ ] History tab shows enrollment/competitions/instructors
- [ ] Roster tab removed
- [ ] Attendance grid is level-aware

**Technical**:
- [ ] All files under 150 lines
- [ ] 80%+ test coverage
- [ ] Responsive design works
- [ ] Accessibility compliant
- [ ] No console errors

---

## Summary

This plan provides a complete roadmap for implementing the Group Details page with multi-level support and comprehensive history tracking. The implementation follows existing patterns, maintains modularity, and includes detailed specifications for backend coordination.
