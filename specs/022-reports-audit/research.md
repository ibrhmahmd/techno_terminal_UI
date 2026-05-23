# Research — Reports Audit Fixes

All findings from the audit are pre-diagnosed with exact before/after code snippets (see the audit findings table in the terminal output). No NEEDS CLARIFICATION — each fix is a straightforward code change.

## Decisions

### Decision 1: ProgressTab labels — rename to match API semantics
- **What**: `progress_status` values `'on_track'`, `'at_risk'`, `'behind'` are all active states — none means "Completed" or "Not Started". Rename variables and chart labels accordingly.
- **Rationale**: The API returns these three statuses to represent different categories of in-progress students. Labeling `on_track` as "Completed" misrepresents data and would confuse users.
- **Alternatives considered**: None — this is a bug fix, not a design choice.

### Decision 2: 404 detection — use response status instead of message string
- **What**: Replace `error.message.includes('404')` with `(error as any)?.response?.status === 404`.
- **Rationale**: Axios error messages are locale-dependent and format-fragile (e.g. "Request failed with status code 404"). The `response.status` field is stable.
- **Alternatives considered**: Use `instanceof AxiosError` from Axios — introduces an import dependency. The inline `(error as any)` cast is simpler and already the pattern used for the response interceptor.

### Decision 3: Error coalescing — use nullish coalescing
- **What**: Replace `revError?.message || colError?.message` with `revError?.message ?? colError?.message ?? null`.
- **Rationale**: `||` treats empty string as falsy, silently dropping a valid error message. `??` preserves empty strings and the trailing `?? null` provides a defined fallback.
- **Alternatives considered**: Concatenate both errors — adds complexity for edge case where both fail simultaneously. Not worth it for a recovery CTA.

### Decision 4: Query key restructuring
- **What**: Add `queryKeys.reports.dailyReceipts(date)` to `queryKeys.ts` and use it in `useDailyCollections`.
- **Rationale**: The current `dailyCollections(`${date}-receipts`)` abuses the factory API — the key `['reports', 'daily-collections', '2024-01-01-receipts']` is semantically wrong. A dedicated factory produces `['reports', 'daily-receipts', '2024-01-01']` which is correct and cacheable.
- **Alternatives considered**: Use a composite key `['reports', 'daily', date, 'receipts']` inline — violates constitution's centralized key requirement.

### Decision 5: Attendance rate API contract
- **What**: Keep `* 100` but add a comment documenting the assumption.
- **Rationale**: Without API endpoint access, we cannot verify whether `attendance_rate` returns 0.0–1.0 (decimal) or 0–100 (percentage). The `* 100` matches the expected display format (percent). Document as `ASSUMES decimal (0.0–1.0)` for future investigators.
- **Alternatives considered**: Remove `* 100` — would break if API does return decimal. Adding an API contract test would require backend access (out of scope).
