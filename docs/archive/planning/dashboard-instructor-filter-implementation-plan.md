# Dashboard Instructor Filter Implementation Plan

**One-Sentence Summary:** Add an instructor selector bar below the day selector that filters dashboard group cards by instructor name using pure frontend logic on existing data, maintaining the current API structure without any backend changes.

---

## 1. Current State Analysis

### 1.1 Existing Dashboard Architecture
```
DashboardPage.tsx
├── State: scheduleItems (from getDailySchedule)
├── State: enrichedGroups (from getEnrichedGroups) ← contains instructor_name
├── State: groupSessions (fetched per group - N+1)
│
├── DaySelectorBar (date filter)
├── GroupSessionCard[] (rendered from scheduleItems)
│   └── AttendanceGrid (separate data fetch)
```

### 1.2 Instructor Data Already Available
The `enrichedGroups` already contains `instructor_name` for every group:
```typescript
interface EnrichedGroupPublic {
  id: number;
  group_name: string;
  course_name: string;
  instructor_name: string;  // ← Already available!
  level_number: number;
  current_student_count: number;
  status: 'active' | 'inactive' | 'archived';
}
```

### 1.3 Current Rendering Flow
```typescript
// DashboardPage.tsx lines 97-110
scheduleItems.map((item, index) => {
  const enriched = getEnrichedData(item.group_id)
  return (
    <GroupSessionCard
      groupName={item.group_name}
      courseName={item.course_name}
      instructorName={enriched?.instructor_name || 'TBA'}  // ← Already have this
      // ...
    />
  )
})
```

---

## 2. Implementation Strategy

### 2.1 Feature Requirements
- **InstructorSelectorBar**: Horizontal selector similar to DaySelectorBar
- **Filter Logic**: Frontend-only filtering on existing `enrichedGroups`
- **UX**: "All" + individual instructor names
- **State**: New `selectedInstructor` state, null = show all
- **Reset**: Clear instructor filter when date changes

### 2.2 Data Flow
```
1. User selects date → fetch scheduleItems + enrichedGroups
2. Extract unique instructor names from enrichedGroups
3. Render InstructorSelectorBar with "All" + instructors
4. User selects instructor → filter scheduleItems by group.instructor_name
5. Render filtered GroupSessionCard[]
```

---

## 3. Files to Modify

### 3.1 New Component: InstructorSelectorBar.tsx
**Path:** `src/components/dashboard/InstructorSelectorBar.tsx`

**Props Interface:**
```typescript
interface InstructorSelectorBarProps {
  instructors: string[]        // Unique instructor names from enrichedGroups
  selectedInstructor: string | null  // null = "All"
  onSelectInstructor: (instructor: string | null) => void
  disabled?: boolean          // Disable during loading
}
```

**Design Spec:**
- Same styling as DaySelectorBar (bg-slate-100, rounded-lg, p-1)
- First button: "All" 
- Subsequent buttons: Unique instructor names sorted alphabetically
- Active state: bg-white, text-secondary, shadow-sm, font-bold
- Inactive state: text-slate-500, hover:text-secondary
- Responsive: overflow-x-auto, min-width based on content

**Implementation:**
```typescript
export function InstructorSelectorBar({
  instructors,
  selectedInstructor,
  onSelectInstructor,
  disabled = false
}: InstructorSelectorBarProps) {
  const allInstructors = ['All', ...instructors.sort()]
  
  return (
    <section className="w-full pb-6">
      <div className="overflow-x-auto">
        <div className="flex min-w-[300px] items-center gap-1 rounded-lg bg-slate-100 p-1">
          {allInstructors.map((name) => {
            const isAll = name === 'All'
            const isSelected = isAll 
              ? selectedInstructor === null 
              : selectedInstructor === name
            
            return (
              <button
                key={name}
                disabled={disabled}
                className={`flex-1 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-secondary shadow-sm font-bold'
                    : 'text-slate-500 hover:text-secondary hover:bg-white/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => onSelectInstructor(isAll ? null : name)}
              >
                {name}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

### 3.2 Modified: DashboardPage.tsx
**Path:** `src/pages/DashboardPage.tsx`

**Changes:**
1. Add state: `const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null)`
2. Extract unique instructors from enrichedGroups
3. Filter scheduleItems based on selected instructor
4. Add InstructorSelectorBar below DaySelectorBar
5. Reset instructor filter when date changes

**Key Code Additions:**
```typescript
// Line ~13: Add state
const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null)

// Line ~60: Reset instructor when date changes
useEffect(() => {
  setSelectedInstructor(null)
}, [selectedDate])

// Line ~65: Extract unique instructors
const uniqueInstructors = useMemo(() => {
  const instructors = new Set<string>()
  enrichedGroups.forEach(g => {
    if (g.instructor_name && g.instructor_name !== 'TBA') {
      instructors.add(g.instructor_name)
    }
  })
  return Array.from(instructors)
}, [enrichedGroups])

// Line ~72: Filter schedule items
const filteredScheduleItems = useMemo(() => {
  if (!selectedInstructor) return scheduleItems
  
  return scheduleItems.filter(item => {
    const group = enrichedGroups.find(g => g.id === item.group_id)
    return group?.instructor_name === selectedInstructor
  })
}, [scheduleItems, enrichedGroups, selectedInstructor])

// Line ~80: Add InstructorSelectorBar
<DaySelectorBar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
<InstructorSelectorBar 
  instructors={uniqueInstructors}
  selectedInstructor={selectedInstructor}
  onSelectInstructor={setSelectedInstructor}
  disabled={isLoading}
/>

// Line ~97: Use filteredScheduleItems instead of scheduleItems
filteredScheduleItems.map((item, index) => {
  // ... rest unchanged
})
```

### 3.3 Modified: QuickActionsGrid.tsx (Optional Enhancement)
**Path:** `src/components/dashboard/QuickActionsGrid.tsx`

**Optional:** Show filtered session count when instructor is selected
```typescript
interface QuickActionsGridProps {
  todaySessionCount: number
  filteredCount?: number      // NEW: when instructor filter active
  selectedInstructor?: string | null  // NEW
}
```

---

## 4. Implementation Sequence

### Phase 1: Create InstructorSelectorBar Component (30 minutes)
1. Create `src/components/dashboard/InstructorSelectorBar.tsx`
2. Follow DaySelectorBar styling patterns
3. Add to `src/components/dashboard/index.ts` barrel export
4. Test component in isolation

### Phase 2: Integrate into DashboardPage (45 minutes)
1. Add `selectedInstructor` state
2. Add `useMemo` for `uniqueInstructors` extraction
3. Add `useMemo` for `filteredScheduleItems`
4. Add useEffect to reset filter on date change
5. Render InstructorSelectorBar in JSX
6. Update scheduleItems.map to use filteredScheduleItems

### Phase 3: Polish & Edge Cases (30 minutes)
1. Handle "TBA" instructor names (exclude from list)
2. Handle empty instructor list (hide selector)
3. Handle no results after filtering (show empty state)
4. Add keyboard navigation support
5. Test with real data

### Phase 4: Optional Enhancements (30 minutes)
1. Show "Showing X of Y groups" indicator
2. Animate filter transitions
3. Persist instructor selection in URL query params
4. Add instructor avatars/initials

---

## 5. Edge Cases & Handling

| Edge Case | Handling |
|-----------|----------|
| No instructors (all "TBA") | Hide selector bar entirely |
| Single instructor | Show selector with just "All" + 1 name |
| Empty filter result | Show "No groups for this instructor" message |
| Very long instructor name | Use `whitespace-nowrap` + `max-width` with truncate |
| 10+ instructors | Keep horizontal scroll behavior from DaySelectorBar |
| Date change with active filter | Reset to "All" automatically |

---

## 6. No Backend Changes Required

This implementation uses **only existing data**:
- `enrichedGroups` already loaded via `getEnrichedGroups()`
- Each group has `instructor_name` field
- No new API calls needed
- No backend endpoints required

---

## 7. Testing Checklist

### Functional Tests
- [ ] Instructor selector renders below day selector
- [ ] Clicking instructor filters groups correctly
- [ ] "All Instructors" shows all groups
- [ ] Changing date resets instructor filter
- [ ] Empty state shown when no groups match filter
- [ ] Loading state disables selector
- [ ] Instructor with "TBA" name excluded from list

### Visual Tests
- [ ] Styling matches DaySelectorBar
- [ ] Active state clearly visible
- [ ] Responsive on mobile (horizontal scroll)
- [ ] Long names don't break layout

### Edge Case Tests
- [ ] Dashboard with 0 instructors (all TBA)
- [ ] Dashboard with 1 instructor
- [ ] Dashboard with 20+ instructors
- [ ] Rapid date/instructor changes

---

## 8. Final File Inventory

### New Files
| File | Purpose |
|------|---------|
| `src/components/dashboard/InstructorSelectorBar.tsx` | Instructor filter UI |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/DashboardPage.tsx` | Add state, filtering logic, render selector |
| `src/components/dashboard/index.ts` | Export new component |

### No Changes Required
| File | Reason |
|------|----------|
| `src/components/dashboard/DaySelectorBar.tsx` | No modifications needed |
| `src/components/dashboard/GroupSessionCard.tsx` | No modifications needed |
| `src/components/attendance/AttendanceGrid.tsx` | No modifications needed |
| All API files | Using existing data |

---

## 9. Success Criteria

1. ✅ Instructor selector visible when instructors exist
2. ✅ Clicking instructor filters groups immediately (no API call)
3. ✅ "All Instructors" shows unfiltered view
4. ✅ Date change clears instructor filter
5. ✅ No regression in existing dashboard functionality
6. ✅ No new API endpoints created
7. ✅ Performance impact < 10ms (pure frontend filtering)

---

**Implementation Time:** ~2 hours (Phases 1-3)
**Risk Level:** Low (no backend changes, additive feature)
**Dependencies:** None (uses existing data)
