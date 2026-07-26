# Software Architecture

## Purpose
Define the complete target software architecture for Risenologi JAMS before application implementation begins.

## Scope
Covers folder structure, module architecture, data flow, authentication, authorization, deployment flow, ADR/RFC governance, security, testing, observability, error handling, caching, performance, and scalability. This document is design-only and does not implement application code, database schema, UI, or API routes.

## Status
Proposed architecture baseline. Requires review before implementation.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [Architecture Principles](#architecture-principles)
- [Target Folder Structure](#target-folder-structure)
- [Module Architecture](#module-architecture)
- [Layering Model](#layering-model)
- [Data Flow](#data-flow)
- [Authentication Flow](#authentication-flow)
- [Authorization Flow](#authorization-flow)
- [Deployment Flow](#deployment-flow)
- [ADR Process](#adr-process)
- [RFC Process](#rfc-process)
- [Security Strategy](#security-strategy)
- [Testing Strategy](#testing-strategy)
- [Observability](#observability)
- [Error Handling](#error-handling)
- [Caching Strategy](#caching-strategy)
- [Performance Strategy](#performance-strategy)
- [Scalability Strategy](#scalability-strategy)
- [Implementation Gates](#implementation-gates)
- [TODO](#todo)

## Architecture Principles
- Design around journal accreditation workflows rather than screens.
- Keep workflow, evidence, review, publication, analytics, and administration capabilities modular.
- Enforce security and authorization at every layer, with Supabase Row Level Security as the final data boundary.
- Prefer explicit contracts, typed boundaries, documented decisions, and small reversible changes.
- Treat auditability, evidence traceability, and operational reliability as product requirements.

## Target Folder Structure
```text
.github/
  ISSUE_TEMPLATE/              GitHub issue templates
  instructions/                Contributor and AI-specific instructions
  workflows/                   Future CI/CD workflows
docs/
  adr/                         Accepted architecture decision records
  rfc/                         Proposed architecture and product changes
  templates/                   ADR, RFC, review, and runbook templates
  security/                    Threat model, auth, data protection, and compliance docs
  operations/                  Deployment, incident, backup, and release runbooks
  diagrams/                    Mermaid or architecture diagram source files
  product/                     Glossary, personas, workflows, and domain docs
  qa/                          Test strategy and quality checklists
public/                        Static assets after UI implementation begins
scripts/                       Future repository automation scripts
src/                           Future Next.js application source
  app/                         Future Next.js App Router routes and layouts
  modules/                     Domain-oriented feature modules
  shared/                      Shared utilities, UI primitives, types, and constants
  infrastructure/              Supabase clients, telemetry, config, and adapters
  server/                      Server-only application services and actions
tests/                         Future unit, integration, contract, E2E, security, and accessibility tests
supabase/
  migrations/                  Future database migrations
  functions/                   Future Supabase Edge Functions
  config.toml                  Future Supabase local config
  seed.sql                     Future local seed data
```

## Module Architecture
Future application modules should be organized by domain capability, not by UI page. Proposed modules:

| Module | Responsibility | Initial Boundary |
| --- | --- | --- |
| Identity & Access | Profiles, roles, organization membership, permissions | Auth/session integration and authorization policies |
| Journal Management | Journal metadata, editorial configuration, publication identity | Journal-scoped settings and ownership |
| Editorial Workflow | Manuscript intake, editorial decisions, assignment lifecycle | State transitions and evidence capture |
| Reviewer Workflow | Reviewer invitations, review assignments, review status | Reviewer-facing workflow and reviewer quality data |
| Publication Workflow | Issue planning, publication readiness, publishing checkpoints | Publication status and content readiness tracking |
| Quality Assurance | QA checklists, quality findings, corrective actions | Quality controls and accreditation evidence |
| Accreditation Readiness | Accreditation criteria, evidence mapping, readiness score inputs | Evidence traceability and gap analysis |
| Analytics | Operational metrics and accreditation readiness reporting | Aggregated read models and dashboards |
| Administration | Tenant configuration, audit review, system settings | Admin-only configuration surfaces |

Each module should expose only documented public interfaces. Cross-module access must happen through application services or documented contracts, not direct internal imports.

## Layering Model
```text
Presentation Layer
  Next.js routes, layouts, server components, client components
Application Layer
  Use cases, commands, queries, workflow orchestration
Domain Layer
  Domain types, state machines, invariants, policies
Data Access Layer
  Supabase queries, repositories, RPC boundaries, read models
Infrastructure Layer
  Supabase clients, telemetry, email, environment configuration
```

Rules:
- Presentation must not contain business invariants.
- Application services coordinate use cases but do not bypass authorization.
- Domain logic should be framework-independent where practical.
- Data access must be typed, reviewed, and protected by RLS.
- Infrastructure adapters should hide provider-specific details.

## Data Flow
```text
User
  -> Browser
  -> Next.js route/server action/route handler
  -> Authentication/session validation
  -> Authorization policy check
  -> Application service
  -> Domain validation/state transition
  -> Supabase typed data access
  -> PostgreSQL with RLS/audit triggers
  -> Response normalization
  -> UI state/rendering
  -> Telemetry/logging/metrics
```

Read-heavy analytics should use read models or views after the schema is approved. Write flows must capture audit metadata and preserve evidence traceability.

## Authentication Flow
1. User opens the application.
2. Next.js checks the Supabase session using server-side session helpers.
3. If unauthenticated, the user is routed to the approved sign-in flow.
4. Supabase Auth verifies identity and returns a session.
5. Server-side code validates the session before accessing protected data.
6. Session refresh is handled through secure cookies and Supabase-supported mechanisms.
7. Sign-out clears server and client session state.

Authentication decisions still required:
- Email/password, magic link, SSO, or institutional identity provider support.
- MFA requirements.
- Session duration and refresh policy.
- Account invitation and onboarding model.

## Authorization Flow
Authorization must be layered:

1. **Route guard**: prevent unauthenticated access to protected routes.
2. **Application policy**: check role, journal membership, workflow ownership, and permission intent.
3. **Database RLS**: enforce tenant, journal, role, and record-level access as the final control.
4. **Audit trail**: record security-relevant reads/writes where required by policy.

Proposed access dimensions:
- Organization or tenant.
- Journal.
- Role.
- Workflow assignment.
- Record ownership.
- Accreditation evidence sensitivity.

No service-role key may be used in browser code. Any service-role operation must be server-only, justified, reviewed, logged, and protected by explicit policy.

## Deployment Flow
```text
Developer branch
  -> Pull request
  -> CI validation
  -> Preview deployment
  -> Review and approval
  -> Merge to main
  -> Production build
  -> Database migration gate
  -> Production deployment
  -> Smoke test
  -> Monitoring and rollback readiness
```

Deployment must remain blocked until CI, environment separation, migration checks, and rollback procedures are documented.

## ADR Process
Architecture Decision Records must be used for durable decisions affecting framework usage, module boundaries, database design, authentication, authorization, deployment, observability, or security. ADRs belong in `docs/adr/` and should use `docs/templates/adr-template.md`.

## RFC Process
Requests for Comments must be used for significant proposals before ADR acceptance or implementation. RFCs belong in `docs/rfc/` and should use `docs/templates/rfc-template.md`.

## Security Strategy
Security is defense-in-depth:
- Server-side session validation for protected operations.
- RLS on all application tables once schema exists.
- Least-privilege roles and scoped permissions.
- Strict service-role key isolation.
- Input validation at all trust boundaries.
- Audit logging for accreditation and administrative changes.
- Secret storage only in managed environment configuration.
- Security review for authentication, authorization, data access, and migration changes.

## Testing Strategy
Testing must be layered:
- Unit tests for domain policies and pure functions.
- Integration tests for application services and data access.
- Contract tests for API boundaries.
- RLS/security tests for authorization-critical paths.
- End-to-end tests for approved workflows.
- Accessibility tests for UI flows.
- Migration tests for schema evolution.

No workflow is production-ready until its authorization, audit, and failure paths are tested.

## Observability
Observability should include:
- Structured application logs.
- Request correlation IDs.
- Error tracking.
- Performance metrics.
- Database query monitoring.
- Authentication and authorization event logs.
- Deployment health checks.
- Audit logs separated from diagnostic logs.

## Error Handling
Errors should be normalized into categories:
- Validation error.
- Authentication error.
- Authorization error.
- Not found error.
- Conflict/state transition error.
- Rate limit error.
- External provider error.
- Unexpected internal error.

User-facing errors must be safe, actionable, and localized-ready. Internal logs may include diagnostic context but must not expose secrets or sensitive content.

## Caching Strategy
Caching should be conservative until data sensitivity is classified:
- Public/static assets may use long-lived cache headers.
- Authenticated workflow data should default to no shared caching.
- Dashboard aggregations may use scoped, invalidated read models.
- Accreditation evidence and reviewer data must not be cached in public or shared stores.
- Cache keys must include tenant, journal, role, and permission context when applicable.

## Performance Strategy
- Establish baseline budgets before UI implementation.
- Use server-side rendering or server components for protected data where appropriate.
- Avoid unnecessary client-side data waterfalls.
- Paginate large lists.
- Index database access paths after schema approval.
- Use background jobs or deferred processing for heavy analytics where needed.
- Monitor Core Web Vitals and database query latency.

## Scalability Strategy
- Keep modules independently evolvable.
- Use database constraints and RLS to maintain integrity at scale.
- Separate transactional workflow data from analytical read models as usage grows.
- Design for multi-journal and multi-tenant access from the beginning.
- Avoid provider lock-in in domain logic by isolating infrastructure adapters.
- Introduce queues, scheduled jobs, or edge functions only after workload requirements are known.

## Implementation Gates
Before application code begins, the team must approve:
- Product glossary and workflow catalog.
- Role and permission matrix.
- Initial ADRs for architecture, auth, data, and deployment.
- Database migration and RLS standards.
- Testing and CI quality gates.
- Security review checklist.

## TODO
- Convert this proposed baseline into reviewed ADRs and implementation tasks after stakeholder approval.
