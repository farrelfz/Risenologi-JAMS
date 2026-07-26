# Testing Strategy

## Purpose
Define the testing strategy for Risenologi JAMS before application code, database schema, UI, or API routes are implemented.

## Scope
Covers test levels, quality gates, test ownership, security validation, accessibility validation, migration testing, data testing, and release confidence. This is documentation only.

## Status
Proposed testing baseline. Requires review before tooling selection.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [Testing Principles](#testing-principles)
- [Test Pyramid](#test-pyramid)
- [Quality Gates](#quality-gates)
- [Test Data Strategy](#test-data-strategy)
- [Manual QA Strategy](#manual-qa-strategy)
- [TODO](#todo)

## Testing Principles
- Test business invariants closest to the domain logic.
- Test authorization at both application and database layers.
- Test user-critical workflows end to end after implementation exists.
- Prefer deterministic tests with synthetic data.
- Block releases on failures in critical paths.

## Test Pyramid
| Level | Purpose | Examples |
| --- | --- | --- |
| Static checks | Prevent basic correctness issues | Type checking, linting, formatting |
| Unit tests | Validate pure logic and policies | State transitions, permission helpers |
| Integration tests | Validate module and data boundaries | Application services with Supabase test environment |
| Contract tests | Validate API expectations | Route handler/server action contracts |
| Security tests | Validate access controls | RLS policy tests, privilege escalation tests |
| E2E tests | Validate approved workflows | Editorial assignment, review completion, evidence upload |
| Accessibility tests | Validate inclusive UI | Keyboard navigation, labels, contrast, focus |
| Migration tests | Validate schema evolution | Apply/rollback or forward-fix rehearsal |

## Quality Gates
Before production implementation ships:
- Type checking passes.
- Formatting/linting passes.
- Unit and integration tests pass.
- Security tests pass for authorization-sensitive changes.
- Migration validation passes for database changes.
- E2E smoke tests pass for affected workflows.
- Accessibility checks pass for affected UI.

## Test Data Strategy
- Use synthetic data only.
- Never use real reviewer, journal, or accreditation evidence data in tests.
- Seed data must be deterministic.
- Test tenants and journals must be isolated.

## Manual QA Strategy
Manual QA should be checklist-based and reserved for workflow usability, complex authorization scenarios, release smoke testing, and visual/accessibility verification that automation cannot fully cover.

## TODO
- Select test tooling after the application stack is initialized and create CI quality gates.
