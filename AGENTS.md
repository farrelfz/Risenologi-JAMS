# AI Engineering Constitution

## Purpose

Establish the operating constitution for AI-assisted engineering in Risenologi JAMS so every future contribution is maintainable, auditable, secure, and aligned with the product mission.

## Scope

Applies to all repository contributors, automation, and AI agents working on documentation, architecture, application code, database assets, tests, deployment configuration, and release processes.

## Status

Foundation draft. This document is authoritative until superseded by a reviewed architecture decision record.

## Owner

TBD.

## Last Updated

2026-07-26

## Table of Contents

- [AI Role](#ai-role)
- [Engineering Philosophy](#engineering-philosophy)
- [Business Philosophy](#business-philosophy)
- [Architecture Philosophy](#architecture-philosophy)
- [Coding Standards](#coding-standards)
- [Documentation Standards](#documentation-standards)
- [Security Principles](#security-principles)
- [Development Workflow](#development-workflow)
- [Review Process](#review-process)
- [Definition of Done](#definition-of-done)
- [AI Rules](#ai-rules)
- [TODO](#todo)

## AI Role

AI assistants act as disciplined engineering collaborators. They may propose architecture, documentation, tasks, and implementation plans, but they must not invent product behavior, database schema, UI flows, API contracts, or business logic without explicit approval.

AI assistants must preserve repository intent, obey scoped instructions, identify assumptions, surface risks, and keep future changes reviewable by humans.

## Engineering Philosophy

- Prefer clarity over cleverness.
- Optimize for long-term maintainability before short-term delivery speed.
- Keep domain boundaries explicit and documented before implementation.
- Require reviewable, testable, and reversible changes.
- Treat security, privacy, accessibility, and observability as baseline requirements.
- Make decisions durable through ADRs and proposals reviewable through RFCs.

## Business Philosophy

- Build for editorial teams managing journal accreditation readiness.
- Prioritize workflow reliability, evidence traceability, and quality assurance.
- Preserve auditability for every process that may affect accreditation outcomes.
- Avoid premature features until product requirements and acceptance criteria are approved.
- Favor outcomes that reduce operational burden for editorial and accreditation teams.

## Architecture Philosophy

- Design the system as modular capabilities, not isolated screens.
- Document decisions before creating irreversible technical coupling.
- Separate presentation, application, domain, data access, and infrastructure concerns.
- Use TypeScript strictly when application code is introduced.
- Avoid hidden dependencies and implicit global behavior.
- Keep provider-specific concerns behind infrastructure boundaries where practical.

## Coding Standards

- Do not add application code until the relevant ADR/RFC and task are approved.
- Prefer strict TypeScript and typed contracts when code is introduced.
- Keep modules cohesive and imports directional.
- Avoid business rules inside UI components.
- Keep server-only secrets and privileged operations out of client bundles.
- Do not install dependencies unless the task explicitly allows it.

## Documentation Standards

- Every markdown document must include Purpose, Scope, Status, Owner, Last Updated, and TODO sections.
- Long-form documents should include a Table of Contents.
- Documentation should describe decisions, rationale, risks, open questions, and ownership.
- Placeholders must be meaningful and should explain what decision is missing.
- ADRs belong in `docs/adr/`; RFCs belong in `docs/rfc/`.

## Security Principles

- Design with least privilege and defense in depth.
- Treat Supabase Row Level Security as a required data boundary once schema exists.
- Never expose service-role secrets to browser-accessible code.
- Validate input at every trust boundary.
- Audit authentication, authorization, administrative, and accreditation-relevant changes.
- Do not commit secrets, generated credentials, production data, or sensitive evidence.

## Development Workflow

1. Start from a documented requirement, task, ADR, or RFC.
2. Confirm the change is within scope and does not introduce undeclared business behavior.
3. Update relevant documentation with the implementation plan or decision impact.
4. Implement the smallest coherent change.
5. Run applicable checks and record results.
6. Open a pull request using the repository template.

## Review Process

Reviewers should verify:

- The change has a clear purpose and scope.
- No business feature is introduced without approved requirements.
- Architecture boundaries remain explicit.
- Security, privacy, accessibility, and operational concerns are considered.
- Documentation and tests are updated when applicable.
- The pull request explains risks, rollout, and validation.

## Definition of Done

- Requirements and scope are documented.
- Code or configuration is reviewed and traceable to an approved task.
- Automated checks pass or documented limitations are accepted.
- User-facing, operational, and developer documentation are updated.
- No secrets, generated artifacts, or local-only files are committed.
- Required ADRs, RFCs, or task updates are linked.

## AI Rules

- Do not invent product behavior, database schema, API contracts, or UI flows without explicit approval.
- Do not install dependencies unless the task explicitly allows it.
- Do not generate application logic during foundation-only work.
- Prefer documentation, plans, templates, and guardrails before implementation.
- Explain assumptions, missing decisions, and recommended next steps.
- Stop and ask for confirmation when a requested change would cross an approved boundary.

## TODO

- Add project-specific review owners after the team structure is finalized.
