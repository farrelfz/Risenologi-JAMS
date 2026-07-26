# Database Architecture

## Purpose
Define the target database architecture for Risenologi JAMS before any Supabase schema or migration is created.

## Scope
Covers data ownership, tenancy, schema design principles, Supabase usage, RLS, migrations, auditability, backups, analytics, and data lifecycle. This is documentation only; no SQL schema is defined.

## Status
Proposed database architecture baseline. Requires ADR approval before implementation.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [Data Architecture Principles](#data-architecture-principles)
- [Conceptual Data Domains](#conceptual-data-domains)
- [Supabase Architecture](#supabase-architecture)
- [Tenancy Model](#tenancy-model)
- [Authorization and RLS Model](#authorization-and-rls-model)
- [Migration Strategy](#migration-strategy)
- [Seed Strategy](#seed-strategy)
- [Audit Strategy](#audit-strategy)
- [Backup and Recovery](#backup-and-recovery)
- [Analytics Data](#analytics-data)
- [Data Lifecycle](#data-lifecycle)
- [TODO](#todo)

## Data Architecture Principles
- Treat the database as a security boundary, not only a persistence layer.
- Enforce tenant, journal, and role isolation with Row Level Security.
- Preserve evidence traceability for accreditation-related records.
- Prefer explicit constraints over application-only validation.
- Keep transactional workflow data separate from derived analytics where practical.
- Design migrations to be reviewable, reversible where possible, and safe for production.

## Conceptual Data Domains
| Domain | Purpose | Notes |
| --- | --- | --- |
| Identity | User profiles, memberships, roles | Integrates with Supabase Auth; application tables must not duplicate credentials |
| Organization/Tenant | Institution or publisher boundary | Drives tenant isolation and billing/administration if needed |
| Journal | Journal metadata and configuration | Most records should be journal-scoped |
| Editorial Workflow | Manuscripts, assignments, decisions, status history | Must preserve transition evidence |
| Reviewer Workflow | Reviewer assignments, invitations, reviews | Contains sensitive reviewer data |
| Publication Workflow | Issues, publication readiness, publication checkpoints | Links editorial output to publication evidence |
| Quality Assurance | QA criteria, findings, corrective actions | Supports accreditation readiness |
| Accreditation | Standards, criteria mapping, evidence, readiness | Requires strong auditability |
| Analytics | Aggregated operational and readiness metrics | Prefer read models/views after transactional model is stable |
| Audit | Security and business-critical event records | Append-only where practical |

## Supabase Architecture
Future Supabase usage should include:
- Supabase Auth for identity.
- PostgreSQL schemas, constraints, indexes, and RLS for data integrity and access control.
- Supabase Storage only after file/evidence storage requirements are approved.
- Supabase Edge Functions only for server-side workflows that cannot live safely in Next.js.
- Supabase Realtime only after collaboration requirements are confirmed.

## Tenancy Model
The default proposed tenancy model is organization-first with journal-scoped access:
```text
organization
  -> journal
    -> workflow records
    -> accreditation evidence
    -> analytics read models
```

Every future application table should declare its tenancy scope during design review. Tables containing shared reference data must explicitly document why they are not tenant-scoped.

## Authorization and RLS Model
RLS must be enabled on every application table once schema exists. Policies should account for:
- Authenticated user identity.
- Organization membership.
- Journal membership.
- Role and permission intent.
- Workflow assignment.
- Record sensitivity.

RLS tests are required for every policy. Service-role bypasses must be exceptional, server-only, logged, and reviewed.

## Migration Strategy
- Use timestamped migration files.
- Keep migrations small and focused.
- Include comments for non-obvious constraints or policies.
- Avoid destructive changes without a rollback and data migration plan.
- Test migrations locally and in preview/staging before production.
- Separate schema migrations from seed/demo data.

## Seed Strategy
`supabase/seed.sql` is reserved for local development data only. Seed data must not contain production secrets, real user data, reviewer identities, confidential journal data, or accreditation evidence.

## Audit Strategy
Audit records should capture:
- Actor.
- Organization/journal context.
- Event type.
- Target entity.
- Before/after summary where safe.
- Timestamp.
- Request/correlation identifier.
- Source IP or session context where appropriate.

Audit logs must be protected from normal user modification.

## Backup and Recovery
Before production launch, define:
- Recovery Point Objective.
- Recovery Time Objective.
- Backup frequency.
- Restore validation cadence.
- Owner for recovery operations.
- Incident escalation path.

## Analytics Data
Analytics should not compromise transactional security. Prefer scoped views, materialized views, or derived tables that preserve tenant and journal boundaries. Aggregations must avoid exposing reviewer identities or confidential workflow data across unauthorized boundaries.

## Data Lifecycle
Future data lifecycle policies must define retention, archival, deletion, export, legal hold, and anonymization requirements. Accreditation evidence may require longer retention than operational workflow data.

## TODO
- Create ADRs for tenancy, RLS policy strategy, audit logging, storage, and analytics read models before database implementation.
