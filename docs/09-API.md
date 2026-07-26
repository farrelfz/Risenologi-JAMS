# API Architecture

## Purpose
Define the target API architecture and contract governance for Risenologi JAMS before API routes, server actions, RPCs, or edge functions are implemented.

## Scope
Covers API boundaries, server actions, route handlers, validation, authorization, error contracts, versioning, idempotency, rate limiting, and documentation expectations. This is documentation only; no API routes are defined.

## Status
Proposed API architecture baseline. Requires review before implementation.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [API Boundary Principles](#api-boundary-principles)
- [API Surface Types](#api-surface-types)
- [Request Flow](#request-flow)
- [Validation Strategy](#validation-strategy)
- [Authorization Strategy](#authorization-strategy)
- [Error Contract](#error-contract)
- [Versioning Strategy](#versioning-strategy)
- [Idempotency Strategy](#idempotency-strategy)
- [Rate Limiting Strategy](#rate-limiting-strategy)
- [Documentation Strategy](#documentation-strategy)
- [TODO](#todo)

## API Boundary Principles
- Treat every API boundary as untrusted input.
- Validate input server-side even when UI validation exists.
- Enforce authentication and authorization before data access.
- Return safe, normalized error responses.
- Keep contracts stable, typed, documented, and testable.
- Avoid exposing internal database shape directly as public API shape.

## API Surface Types
| Surface | Use When | Notes |
| --- | --- | --- |
| Server Components | Read protected data for rendering | Must validate session and authorization server-side |
| Server Actions | Mutations tied to UI workflows | Must validate input, authorization, and state transitions |
| Route Handlers | External integrations or explicit HTTP APIs | Require documented request/response contracts |
| Supabase RPC | Database-close operations needing SQL semantics | Requires RLS/security review |
| Edge Functions | Provider callbacks or isolated server tasks | Use only when Next.js runtime is insufficient |

## Request Flow
```text
Request
  -> Parse and validate input
  -> Authenticate session
  -> Authorize intent and scope
  -> Execute application use case
  -> Persist through typed data access
  -> Normalize response or error
  -> Emit logs/metrics/audit events
```

## Validation Strategy
Validation must occur at boundaries:
- Route parameters.
- Query parameters.
- Request body.
- Form submissions.
- File metadata.
- External webhook payloads.
- Environment variables.

Validation schemas should be reusable and colocated with the contract or application use case once code exists.

## Authorization Strategy
Authorization must check the action being attempted, not only the route being accessed. Required dimensions include user identity, organization, journal, role, assignment, record state, and record sensitivity.

## Error Contract
Future APIs should normalize errors into this shape conceptually:
```text
error.code
error.message
error.details
error.correlationId
```

Error messages returned to users must be safe and actionable. Internal details belong only in secure logs.

## Versioning Strategy
Internal server actions may evolve with the application. External HTTP APIs must use explicit versioning once introduced. Breaking changes require RFC review, migration guidance, and deprecation windows.

## Idempotency Strategy
Mutations that create workflow events, send invitations, publish records, upload evidence, or trigger external side effects should support idempotency keys or equivalent safeguards.

## Rate Limiting Strategy
Rate limits should protect authentication flows, invitation/email flows, external APIs, file uploads, and expensive analytics endpoints. Limits must be tenant-aware where applicable.

## Documentation Strategy
Every API contract should document:
- Purpose.
- Authentication requirement.
- Authorization requirement.
- Request shape.
- Response shape.
- Error cases.
- Audit behavior.
- Rate limits.
- Example usage.

## TODO
- Create an API contract template and approve server action versus route handler guidelines before implementation.
