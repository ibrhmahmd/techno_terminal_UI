# Grouping Feature: Design Pattern & Implementation Guide

> **Purpose:** This document captures how the grouping feature was designed and built for the Groups page, encoding the decisions and patterns as a reusable playbook for applying the same feature to other pages (starting with the Directory Page → Students table).

---

## Part 1: How We Designed Grouping in the Groups Page

### 1.1 The Problem

The Groups page originally loaded all groups into a single flat table. As the number of groups grew (grouped by day, course, instructor, status, or competition), users had no way to slice or filter the data visually beyond a basic text search. The data was hard to scan.

### 1.2 UX Design Decisions

We made a series of deliberate decisions, guided by clarifying questions:

| Decision | Choice | Rationale |
|---|---|---|
| Should data load on mount? | **No — load only on selection** | Avoids overfetching; forces intentional UX |
| What is the "no grouping" option called? | **ALL** | Clearer mental model than "None" |
| How should the selector look? | **Like `DaySelectorBar`** — full-width light pill tab bar | Visual consistency across the app |
| How should the groups render? | **Dark premium horizontal tab bar (Option C)** | Creates distinct visual hierarchy below the selector |
| How many groups can be open at once? | **One at a time** | Simpler UX, matches tab navigation mental model |
| How should the tab bar stretch? | **`flex-1` with `min-w-[120px]`** | Full-width with horizontal scroll safety net |
| Should the user's choice be remembered? | **Yes — `localStorage`** | Prevents re-selecting on every page visit |

### 1.3 Architecture: The 3 Zone Hierarchy

Every grouped page uses 3 visually distinct layout zones:

```
┌──────────────────────────────────────────────────────────────┐
│  Zone 1: GroupBySelector  (light bg-slate-100)               │
│  Question: HOW should data be grouped?                       │
│  [All] [Day] [Course] [Instructor] [Status] [Competition]    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Zone 2: GroupTabBar  (dark bg-slate-800) — appears when     │
│  a non-ALL option is selected                                │
│  Question: WHICH group do you want to see?                   │
│  [Monday 5] [Wednesday 3] [Thursday 8] ← full width, flex-1 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Zone 3: FlatTable  (white bg)                               │
│  Shows only the data for the active Zone 2 tab               │
└──────────────────────────────────────────────────────────────┘
```

### 1.4 Component Architecture

```
GroupsPage.tsx
├── GroupBySelector.tsx          (Zone 1 — light pill tab bar)
│     ├── localStorage persistence for user preference
│     └── null = ALL | 'day' | 'course' | 'instructor' | 'status' | 'competition'
│
├── [if ALL selected]
│     └── DataTable (FlatTable path)  — standard flat list
│
└── [if grouped selected]
      └── DataTable (GroupedTable path)
            ├── Zone 2: dark tab bar pill row
            │     └── activeGroup state (single tab, defaults to first)
            └── Zone 3: FlatTable for active group's items
```

### 1.5 Data Flow

```
User selects "Day" in GroupBySelector
         ↓
useGroups hook triggers loadGroupsGrouped('day')
         ↓
API: GET /academics/groups/grouped?group_by=day
         ↓
Returns: { groups: [{ key: 'monday', label: 'Monday', count: 5, groups: [...] }] }
         ↓
GroupsPage maps result → GroupItem<T>[] shape:
  { key, label, count, items: g.groups }
         ↓
DataTable receives groupedData prop → routes to GroupedTable
         ↓
GroupedTable renders Zone 2 tab bar + Zone 3 FlatTable
```

### 1.6 TypeScript Safety Layer

The `DataTableProps` discriminated union prevents accidentally mixing flat and grouped props:

```typescript
type DataTableProps<T> = FlatTableProps<T> | GroupedTableProps<T>

// FlatTableProps:    data: T[],          groupedData?: never
// GroupedTableProps: data?: never,       groupedData: GroupItem<T>[]
```

This means TypeScript will give a compile error if you ever pass both `data` and `groupedData` — eliminating the class of bug that caused the original empty-state crash.

### 1.7 Cache Integration

Each `loadGroupsGrouped(groupBy)` call is backed by the module-level `queryCache`:

```typescript
const cacheKey = CacheKeys.groups.grouped(groupBy)
const cached = queryCache.get<GroupGroup[]>(cacheKey)
if (cached) { setState(cached); return }  // instant from cache

// ... fetch from API ...
queryCache.set(cacheKey, result)           // store for next visit
```

Cache is invalidated on mutations (create/update/delete) using `invalidatePattern`.

---

## Part 2: Implementation Plan — Directory Page Student Grouping

### 2.1 What We're Adding

A `StudentBySelector` component (identical pattern to `GroupBySelector`) that lets the user group the **Students** tab in `DirectoryPage` by a chosen field, with the same 3-zone layout. 

> **Note:** This only affects the **Students** tab. Parents will remain as a flat table. The Waiting list tab will also remain flat.

### 2.2 Proposed Group-By Options for Students

Based on the `Student` type fields available:

| Option | Label | Icon | Field | Notes |
|---|---|---|---|---|
| `null` | All | `grid_view` | — | Flat paginated list (current behavior) |
| `'status'` | Status | `toggle_on` | `student.status` | Active / Inactive / Waiting |
| `'group'` | Group | `group` | `current_group_name` | Grouped by enrolled group |
| `'gender'` | Gender | `wc` | `student.gender` | Male / Female / Unspecified |
| `'enrollment'` | Enrollment | `school` | `current_group_id` | Enrolled / Not Enrolled |

> ⚠️ **Open Question:** Grouping by `group` and `status` requires the backend to support a grouped students endpoint. We need to confirm if `/crm/students/grouped?group_by=...` exists or needs to be added. See Section 2.6.

### 2.3 Grouping Mode: Frontend vs Backend

Unlike Groups page grouping (which is backend-driven via API), Student grouping can be implemented in **two ways**:

| Mode | How It Works | Pros | Cons |
|---|---|---|---|
| **Frontend grouping** | Fetch all students, group locally in JS | No new API needed, fast | Only works on currently loaded page of data |
| **Backend grouping** | New API endpoint `/crm/students/grouped` | Correct counts across all students | Requires backend work |

**Recommendation:** Start with **frontend grouping** for `status`, `gender`, and `enrollment` since these fields already exist on the loaded `Student[]` array. Reserve backend grouping for `group` (by group name) once we confirm backend support.

### 2.4 Files to Create

| File | Purpose |
|---|---|
| `src/components/directory/StudentGroupBySelector.tsx` | Zone 1 light tab bar for students |
| `src/hooks/useStudentGrouping.ts` | Frontend grouping logic (transforms `Student[]` → `GroupItem<Student>[]`) |

### 2.5 Files to Modify

| File | Change |
|---|---|
| `src/pages/DirectoryPage.tsx` | Add `studentGroupBy` state, render `StudentGroupBySelector` and conditional `DataTable` variant |
| `src/components/directory/DirectoryColumns.tsx` | No change needed — same columns used in both flat and grouped mode |

### 2.6 Backend Requirement Check

Before implementing `group` grouping, we need the backend to confirm or build:

```
GET /crm/students/grouped?group_by=status|gender|group
Response: {
  groups: [{ key: string, label: string, count: number, students: Student[] }]
}
```

If this endpoint doesn't exist yet, the immediate plan is to implement frontend-only grouping for `status`, `gender`, `enrollment` fields — and add `group` grouping as a follow-up once the backend endpoint is available.

### 2.7 Reuse Checklist

Everything from the Groups page design can be directly reused:

- [x] `GroupedTable.tsx` — Zone 2+3 dark tab bar + FlatTable, no changes needed
- [x] `DataTableProps` discriminated union — same TS enforcement
- [x] `queryCache.ts` — for caching grouped student results
- [x] `GroupItem<T>` type — generic, works for `Student` just as well as group data
- [ ] `StudentGroupBySelector.tsx` — New, modeled exactly on `GroupBySelector.tsx`
- [ ] `useStudentGrouping.ts` — New hook, wraps frontend grouping logic

### 2.8 Implementation Steps (Execution Order)

1. Create `StudentGroupBySelector.tsx` (copy pattern from `GroupBySelector.tsx`, new options)
2. Create `useStudentGrouping.ts` (pure frontend transform of `Student[]` data)
3. Add `studentGroupBy` state + `localStorage` persistence to `DirectoryPage.tsx`
4. Wire `StudentGroupBySelector` into the Students tab section
5. Replace the Students `<DataTable data={...}>` with conditional flat vs grouped rendering
6. TypeScript check: `tsc --noEmit`
7. Manual test all group-by options
