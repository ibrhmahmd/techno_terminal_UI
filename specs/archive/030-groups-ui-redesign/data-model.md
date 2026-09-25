# Data Model: Groups UI Controls Redesign

**Phase 1 output** | **Date**: 2026-06-03

## Overview

No new data entities are introduced. This feature is purely a UI/interaction redesign of two existing components. All entities below already exist and remain unchanged.

## Existing Entities (unchanged)

### GroupBy Option
- Fields: All (null), Day, Course, Instructor, Status
- Persistence: localStorage key `tt:groups:groupBy`
- Type: `GroupByField` from `src/api/academics`
- No changes

### Filter Category Dimensions
- Course: `number[]` (course IDs), from `useCourses()`
- Instructor: `number[]` (employee IDs), from `useEmployees()`
- Level: `number[]` (1–8), static
- Day: `string[]` (day names), static
- Status: `string[]` (active, inactive, archived), static
- All state managed in `useGroups` hook via `useState`
- No changes

### Active Filter Tag
- Shape: `{ id: string, label: string, value: string }`
- Rendered by `ActiveFilterTagsList` from `src/components/common/`
- No changes
