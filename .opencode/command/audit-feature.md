# /audit-feature

**Description**: Audit a feature for bugs, dead code, TypeScript violations, data fetching anti-patterns, and accessibility gaps. Produces a spec via /speckit.specify for review before planning.

**Usage**: `/audit-feature <feature-name>`

**Examples**:
- `/audit-feature groups`
- `/audit-feature students`
- `/audit-feature src/components/crm`
- `/audit-feature finance page`

## Prompt

Load the feature audit skill from `~/.agents/skills/feature-audit/SKILL.md` and follow its workflow.

The target feature is: **{args}**

Execute these steps:

1. **Auto-detect tech stack** — Read `package.json`, `tsconfig.json`, `AGENTS.md`, and any query keys file to determine what audit categories apply. Skip categories that don't match the project's stack.

2. **Scope the feature** — Identify all files related to `{args}`: components, hooks, API functions, types, tests, utils. Search `src/components/`, `src/pages/`, `src/hooks/`, `src/api/` for matching names and cross-references.

3. **Run the 5-phase audit** — For each phase, run the grep commands from the skill, examine the files, and record every finding with:
   - Severity: `critical`, `high`, `medium`, or `low`
   - Risk: `safe`, `moderate`, or `breaking`
   - File path and line number
   - Before/after code snippets

4. **Compile findings** — Build a summary table of all findings grouped by category and severity.

5. **Generate feature description** — From the findings, create a concise description that captures what was found and what needs fixing, grouped into user stories by category.

6. **Call `/speckit.specify`** — Use the generated description as the feature description. This will create `specs/NNN-{feature}-audit/spec.md` and `checklists/requirements.md`.

7. **STOP** — Do NOT run `/speckit.plan` or `/speckit.tasks`. Report the spec location and findings summary to the user.

The user will review and edit the spec, then run `/speckit.plan` and `/speckit.tasks` when ready.
