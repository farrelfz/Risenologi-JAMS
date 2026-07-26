# Engineering Handbook

## Purpose
Help new engineers set up, understand, and contribute to Risenologi JAMS safely and consistently.

## Scope
Covers local setup, repository workflow, Git conventions, pull requests, coding standards, testing, and release workflow. It does not define product requirements or architecture decisions.

## Status
Approved foundation.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [Local Setup](#local-setup)
- [Repository Workflow](#repository-workflow)
- [Git Workflow](#git-workflow)
- [Branch Naming](#branch-naming)
- [Pull Request Flow](#pull-request-flow)
- [Coding Standards](#coding-standards)
- [Testing Workflow](#testing-workflow)
- [Release Workflow](#release-workflow)
- [TODO](#todo)

## Local Setup
1. Install Node.js 20 or newer.
2. Clone the repository.
3. Run `npm install` to install dependencies.
4. Copy `.env.example` to `.env.local`.
5. Fill required local environment variables with non-production values.
6. Run `npm run dev` to start the local Next.js server.

## Repository Workflow
- Start from an approved task, ADR, or RFC.
- Keep changes small, reviewable, and reversible.
- Update documentation when behavior, workflow, or operational expectations change.
- Do not commit secrets, generated credentials, production data, or local-only files.

## Git Workflow
- Create a focused branch from the current integration branch.
- Commit related changes together using Conventional Commits.
- Rebase or merge from the integration branch before requesting final review when necessary.
- Avoid force-pushing shared branches unless coordinated with reviewers.

## Branch Naming
Use lowercase, slash-separated branch names:

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `chore/<short-description>`
- `build/<short-description>`
- `test/<short-description>`
- `ci/<short-description>`

## Pull Request Flow
1. Open a pull request with the repository template.
2. Link the approved task, ADR, RFC, or issue.
3. Describe purpose, scope, validation, risks, and rollback.
4. Ensure lint, typecheck, test, and build checks pass or document accepted limitations.
5. Request review from the appropriate owner when ownership is assigned.

## Coding Standards
- Use strict TypeScript for application code.
- Keep domain, application, presentation, data-access, and infrastructure concerns separated.
- Keep business rules out of UI primitives.
- Use the `@/*` import alias for source imports.
- Do not add dependencies without explicit approval.

## Testing Workflow
- Run `npm run lint` for static lint checks.
- Run `npm run typecheck` for TypeScript validation.
- Run `npm test` for unit and integration tests.
- Run `npm run test:e2e` for Playwright end-to-end tests when user-facing flows exist.
- Add tests with the smallest scope that validates the approved behavior.

## Release Workflow
1. Confirm the release scope is approved.
2. Confirm all required checks pass.
3. Review environment variable separation for preview and production.
4. Prepare release notes from merged changes.
5. Deploy through the approved Vercel production process after human approval.
6. Monitor post-release health and document rollback if needed.

## TODO
- Add team-specific review owners, release branch names, and escalation contacts after governance ownership is finalized.
