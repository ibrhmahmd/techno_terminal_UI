---
description: Audit a feature for bugs, dead code, TypeScript violations, data fetching anti-patterns, and accessibility gaps. Uses subagents for parallel analysis. Produces a spec via /speckit.specify for review before planning.
---

# /audit-feature

**Usage**: `/audit-feature <feature-name>`

**Examples**:
- `/audit-feature groups`
- `/audit-feature students`
- `/audit-feature src/components/crm`
- `/audit-feature finance page`

## Prompt

Load the feature audit skill from `~/.agents/skills/feature-audit/SKILL.md` and follow its workflow.

The target feature is: **{args}**

Execute these steps using subagents for optimal context management:

### Step 1: Auto-Detect Tech Stack
Read `package.json`, `tsconfig.json`, `AGENTS.md`, and any query keys file to determine what audit categories apply. Skip categories that don't match the project's stack.

### Step 2: Scope the Feature (explore subagent)
Dispatch an `explore` subagent to find all files related to `{args}`:
- Search `src/components/`, `src/pages/`, `src/hooks/`, `src/api/` for matching names
- Find cross-references: grep for imports of the feature's hooks, components, and API functions across the entire `src/` tree
- Return a structured file list grouped by category (components, hooks, API, types, tests, utils)

### Step 3: Run 5-Phase Audit (5 parallel general subagents)
After receiving the scoped file list, dispatch **5 `general` subagents in parallel**, one per phase. Each subagent receives:
- The scoped file list from Step 2
- Its phase's grep commands and analysis rules from the skill
- Instruction to return findings as a JSON array with: severity, risk, file, line, finding, before, after

**Phase 1**: Runtime Bugs & Logic Errors
**Phase 2**: Dead Code Detection
**Phase 3**: TypeScript & Code Quality
**Phase 4**: Data Fetching & Cache Patterns
**Phase 5**: Accessibility & UX Polish

### Step 4: Compile Findings
After all 5 subagents return:
- Merge their JSON arrays into a single findings table
- Sort by severity (critical → low), then by category
- Count findings per category and severity

### Step 5: Generate Feature Description
From the merged findings, create a concise description:

```
Audit and fix of the {feature} feature across {N} user stories:
(1) Fix {N} runtime bugs including {top 3 critical findings};
(2) Remove {N} dead components and {N} dead hooks;
(3) Eliminate {N} any type usages, {N} console.* statements, and {N} redundant export defaults;
(4) Migrate {N} manual useEffect-based hooks to React Query with centralized query keys;
(5) Add ARIA attributes and keyboard navigation to all interactive controls.
All changes are frontend-only.
```

### Step 6: Call /speckit.specify
Use the generated description as the feature description. This will create `specs/NNN-{feature}-audit/spec.md` and `checklists/requirements.md`.

### Step 7: STOP
Do NOT run `/speckit.plan` or `/speckit.tasks`. Report to the user:
- The spec location
- The findings summary table
- Counts per severity and category

The user will review and edit the spec, then run `/speckit.plan` and `/speckit.tasks` when ready.
