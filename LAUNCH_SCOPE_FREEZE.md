# Play Store Launch Scope Freeze

Date: 2026-08-17
Release target: First production Play Store launch
Status: In progress
Owner: Launch team

## Purpose

This document defines what is allowed into the first Play Store release, what is explicitly excluded, what blocks launch, and how the team checks in daily without reopening scope.

## Release Candidate Baseline

- Branch: `main`
- RC branch: `rc/playstore-2026-08-18`
- Latest repository commit (includes docs): `a5b1c7c`
- Latest launch-relevant runtime code commit: `908ecb9`
- Commit role note: `a5b1c7c` is documentation-only; `908ecb9` is the runtime baseline for launch verification.
- Supporting documentation: `CHANGE_DIARY.md`

## Scope Freeze Rule

From this point, only these change types are allowed into the release branch:

1. Release-blocking bug fixes.
2. Security fixes required for production safety.
3. Play Store compliance fixes.
4. Crash, payment, auth, or data-loss fixes.
5. Minimal UX fixes only when they remove launch risk and do not expand scope.

These changes are not allowed unless the launch owner explicitly approves them:

1. New features.
2. Refactors without direct launch impact.
3. Design rewrites.
4. Dependency churn not tied to a verified release risk.
5. Backend or route-surface expansions.

### Commit Type Enforcement Rule (Active)

All commits to the RC branch must match one approved type:

1. `fix:` for release-blocking bug fixes only.
2. `security:` for production safety fixes.
3. `compliance:` for Play Store policy/submission fixes.
4. `docs:` for release documentation and check-in logs only.

Commit acceptance checklist:

1. Commit message starts with one approved type.
2. Merge note references a blocker ID, or uses `NON-BLOCKER` with launch owner approval.
3. Verification note includes test step and result.
4. If a change touches payment, auth, or admin access, QA sign-off is required before merge.

Automatic reject conditions:

1. New feature work without an approved scope exception.
2. Refactor-only change with no launch blocker mapping.
3. Dependency updates without a linked verified production risk.

## In Scope For This Launch

1. Customer app stability and production rendering on Android.
2. Login, signup, session, and logout reliability.
3. Payment request and wallet-critical flows.
4. Admin paths only where they directly support production operations.
5. Branding consistency for app assets required in production.
6. Crash monitoring, release notes, and store submission materials.

## Explicitly Out Of Scope

1. Broad architecture cleanup.
2. Non-critical admin UX improvements.
3. Large-scale code style cleanup.
4. New marketplace features.
5. Deep redesign of existing screens.
6. Nice-to-have animations or content changes.

## Current Candidate Included Changes

1. App-wide CSRF hardening for frontend and admin request flows.
2. Payment request CSRF retry hardening.
3. ETH wallet transfer action placement after transaction summary.

## Launch Blockers

Launch stops if any of these remain open:

1. Crash in startup, login, signup, payment, withdrawal, or navigation.
2. Payment or withdrawal flow failure.
3. Authentication or session instability.
4. Security issue affecting auth, payments, admin access, or user data.
5. Play Store policy or submission rejection risk.
6. Broken branding or rendering on key Android devices.

## Current Known Issues Triage

Use this section as the active blocker board for Seed 1. Only items with direct launch impact belong in the blocker list.

### Confirmed Blockers

1. Sensitive backend routes do not consistently enforce server-side authorization.
	- Status: Open
	- Owner: secxion ENG
	- QA owner: secxion QA
	- Approval owner: secxion LA
	- Source: `PROJECT_IMPROVEMENT_REVIEW.txt` P0.1
	- Why blocker: production launch cannot proceed while delete-user, role mutation, blog mutation, payment admin, and report/admin data paths may be callable by the wrong actor.
	- Next action: create and apply an auth/permission matrix for all sensitive endpoints.
	- Exit criteria: all sensitive routes require explicit auth and permission checks, plus negative authorization tests pass.

2. Admin department authorization is permissive when route mappings are missing.
	- Status: Open
	- Owner: secxion ENG
	- QA owner: secxion QA
	- Approval owner: secxion LA
	- Source: `PROJECT_IMPROVEMENT_REVIEW.txt` P0.2
	- Why blocker: renamed or newly added admin paths can bypass intended restrictions.
	- Next action: enforce default-deny on unmapped admin routes in backend permission logic.
	- Exit criteria: backend admin authorization becomes default-deny and unmapped admin endpoints fail closed.

3. Historical secrets exposure risk has not been closed.
	- Status: Open
	- Owner: secxion LA
	- Engineering support: secxion ENG
	- QA owner: secxion QA
	- Source: `PROJECT_IMPROVEMENT_REVIEW.txt` P0.3
	- Why blocker: credentials previously committed to git history must be treated as exposed before production launch.
	- Next action: complete secret inventory and rotate all affected production credentials.
	- Exit criteria: secret inventory completed, affected secrets rotated, and production secrets confirmed outside git.

4. Financial mutation protections are not yet verified end to end.
	- Status: Open
	- Owner: secxion ENG
	- QA owner: secxion QA
	- Approval owner: secxion LA
	- Source: `PROJECT_IMPROVEMENT_REVIEW.txt` P0.4
	- Why blocker: retries or weak authorization on financial operations can create duplicate or unauthorized state changes.
	- Next action: execute payment/withdrawal idempotency and authorization regression checks and document evidence.
	- Exit criteria: idempotency and authorization rules are enforced for financial mutations and critical payment/withdrawal regression checks pass.

### Candidate Blockers Requiring Verification

1. Dependency vulnerabilities in production packages.
	- Status: Open (confirmed blocker)
	- Owner: secxion ENG
	- QA owner: secxion QA
	- Source: `REVIEW_SUMMARY.md`
	- Why it may block: high or critical package vulnerabilities can block production release if still present in current lockfiles.
	- Verification needed: run current audits for root, frontend, backend, and admin and classify which findings affect shipped production code.
	- Verification run: 2026-08-18
	- Evidence summary:
	  - Root audit (`npm audit --omit=dev --audit-level=high --json`): high 8, moderate 4.
	  - Frontend audit (`npm --prefix frontend audit --omit=dev --audit-level=high --json`): high 86, moderate 102.
	  - Backend audit (`npm --prefix backend audit --omit=dev --audit-level=high --json`): high 7.
	  - Admin audit (`npm --prefix admin audit --omit=dev --audit-level=high --json`): moderate 3, high 0.
	- Next action: classify each high-severity finding into exploitable in production, transitive-only, or non-runtime, then patch/override where safe.

2. MongoDB production connectivity and startup reliability.
	- Status: Verified (currently non-blocking)
	- Owner: secxion ENG
	- QA owner: secxion QA
	- Source: `REVIEW_SUMMARY.md`
	- Why it may block: login, signup, admin, and payment flows cannot launch if the production database path is unstable.
	- Verification needed: validate current production-like backend startup and database connectivity, not the older setup snapshot.
	- Verification run: 2026-08-18
	- Evidence summary:
	  - Production-style DB check executed against `backend/config/db.js` with `ALLOW_LOCAL_DB_FALLBACK=false`.
	  - Result: `DB_CONNECTIVITY_CHECK=PASS` with successful Atlas connection.
	- Follow-up guardrail: re-run this check in CI/pre-release before Play upload.

3. API error response consistency on server failures.
	- Status: Verified (currently non-blocking)
	- Owner: secxion ENG
	- QA owner: secxion QA
	- Source: `REVIEW_SUMMARY.md`
	- Why it may block: HTML error payloads can break production clients during failure handling.
	- Verification needed: trigger representative backend failures and confirm JSON error responses on client-facing APIs.
	- Verification run: 2026-08-18
	- Evidence summary:
	  - Forced failure route validated through `backend/middleware/errorHandler.js`.
	  - Result: HTTP 500 with `application/json` and body shape `{ success, status, message }`.
	  - Check output: `API_ERROR_FORMAT_CHECK=PASS`.
	- Follow-up guardrail: add this as an automated test in backend test suite.

### Not Blockers For This Launch Unless They Escalate

1. Broad ESLint cleanup.
	- Reason: quality debt, but not release scope unless it hides a real production defect.

2. Large-scale architecture cleanup.
	- Reason: explicitly out of scope for first Play Store release.

3. Coverage percentage growth by itself.
	- Reason: missing tests matter where they leave auth, payment, or crash risks unverified; the raw percentage is not the gate.

## Blocker Review Rules

1. Every blocker must have one owner, one next action, and one exit check.
2. If an item cannot fail launch directly, move it to post-launch work.
3. If verification shows an item is already resolved, mark it closed with evidence and date.
4. No new blocker closes without a reproducible validation step.

## Team Workflow

### Roles

1. Launch owner: `secxion LA` (final approve/reject on scope changes).
2. Engineering owner: `secxion ENG` (confirms technical risk and fix readiness).
3. QA owner: `secxion QA` (confirms pass/fail on release criteria).
4. Product/ops owner: `secxion LA` (acting owner for copy, assets, and support readiness).

### Backups (Where And How)

Use this register directly in this file. Add one backup per role and one escalation contact.

| Role | Primary | Backup | Escalation Contact |
| --- | --- | --- | --- |
| Launch owner | secxion LA | secunit LA | secunit PROD |
| Engineering owner | secxion ENG | secunit ENG | secunit PROD |
| QA owner | secxion QA | secunit QA | secunit PROD |
| Product/ops owner | secxion LA | secunit PROD | secunit PROD |

Backup handoff rule:

1. If primary is unavailable for more than 4 hours during launch week, backup takes over decision rights for that role.
2. Backup must post status in the daily check-in using the same blocker format.
3. If both primary and backup are unavailable, escalate immediately to the escalation contact.

### Daily Check-In

Use this format every day:

1. Done since last check-in.
2. Current blocker.
3. Next action before next check-in.
4. Any proposed scope exception.

### Scope Exception Rule

Any proposed new change must answer all four questions:

1. What launch blocker does it remove?
2. What file or flow does it touch?
3. What is the regression risk?
4. What is the verification step before merge?

If any answer is weak or missing, defer the change until after launch.

## Seed 1 Device Smoke List

1. Google Pixel 9 Pro
2. Samsung 10-inch tablet

## Working TODO For Seed 1

- [x] Confirm release owner and backups.
- [x] Create release branch or tag for first candidate.
- [x] Convert current known issues into blocker or non-blocker status.
- [x] List exact Android devices for final smoke test.
- [x] Freeze allowed commit types using the scope rule above.
- [x] Start daily launch check-in with owners.

## First Team Check-In Template

Copy this into your standup message:

```text
Play Store Launch Check-In - YYYY-MM-DD

Release status:
Blockers open:
Blockers cleared today:
New risks:
Scope exceptions requested:
Decision needed:
Next ship checkpoint:
```

## Daily Launch Check-In Log

### 2026-08-18 - Check-In 01

Release status: Scope freeze active on `rc/playstore-2026-08-18`.
Blockers open: 4 confirmed, 3 candidate (verification pending).
Blockers cleared today: 0.
New risks: None newly added today.
Scope exceptions requested: None.
Decision needed: Confirm owner per blocker item and start candidate-blocker verification order.
Next ship checkpoint: Blocker owners assigned per item and first verification run started.

### 2026-08-18 - Check-In 02

Release status: Scope freeze active on `rc/playstore-2026-08-18`.
Blockers open: 5 confirmed, 2 candidate (verification pending).
Blockers cleared today: 0.
New risks: dependency vulnerability blocker confirmed by production audit results.
Scope exceptions requested: none.
Decision needed: approve dependency remediation strategy (upgrade vs override vs temporary risk acceptance with compensating controls).
Next ship checkpoint: dependency findings triaged by package and remediation list approved.

### 2026-08-18 - Check-In 03

Release status: Scope freeze active on `rc/playstore-2026-08-18`.
Blockers open: 5 confirmed, 0 candidate pending verification.
Blockers cleared today: 0.
New risks: none beyond confirmed dependency blocker.
Scope exceptions requested: none.
Decision needed: approve dependency remediation plan and scheduling.
Next ship checkpoint: dependency remediation list committed and retest scheduled.