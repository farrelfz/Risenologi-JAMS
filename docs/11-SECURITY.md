# Security Strategy

## Purpose
Define the security strategy for Risenologi JAMS before authentication, authorization, database schema, storage, or application code is implemented.

## Scope
Covers threat modeling, identity, authorization, data protection, secrets, audit logging, secure development, dependency risk, incident response, and compliance readiness. This is documentation only.

## Status
Proposed security baseline. Requires review before implementation.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [Security Objectives](#security-objectives)
- [Threat Model Summary](#threat-model-summary)
- [Identity and Session Security](#identity-and-session-security)
- [Authorization Security](#authorization-security)
- [Data Protection](#data-protection)
- [Secret Management](#secret-management)
- [Audit Logging](#audit-logging)
- [Secure Development](#secure-development)
- [TODO](#todo)

## Security Objectives
- Protect journal, reviewer, editorial, publication, QA, and accreditation data.
- Prevent cross-tenant and cross-journal data exposure.
- Ensure every accreditation-relevant change is attributable and auditable.
- Keep secrets out of source control and client bundles.
- Detect, investigate, and recover from security incidents.

## Threat Model Summary
| Threat | Risk | Required Control |
| --- | --- | --- |
| Cross-tenant data access | High | RLS, scoped queries, authorization tests |
| Service-role key exposure | Critical | Server-only usage, secret management, code review |
| Privilege escalation | High | Role matrix, policy checks, audit logging |
| Reviewer identity leakage | High | Data classification and need-to-know access |
| Accreditation evidence tampering | High | Audit trails, immutable event history where practical |
| Insecure file uploads | Medium/High | Storage policies, malware scanning decision, metadata validation |
| Dependency vulnerabilities | Medium | Dependency scanning after dependencies exist |
| Weak operational response | Medium | Incident response and recovery runbooks |

## Identity and Session Security
- Use Supabase Auth only after an authentication ADR is approved.
- Validate sessions server-side for protected operations.
- Define MFA, invitation, password, and SSO requirements before implementation.
- Store session tokens only through secure framework-supported mechanisms.

## Authorization Security
- Use route guards, application policies, and database RLS together.
- Authorization must evaluate action, scope, role, assignment, and record state.
- Role checks alone are insufficient for workflow records.
- All authorization-critical paths require tests.

## Data Protection
Data must be classified before schema design:
- Public.
- Internal.
- Confidential.
- Sensitive.
- Accreditation-critical.

Confidential, sensitive, and accreditation-critical data require explicit retention, access, audit, and export policies.

## Secret Management
- No secrets in Git.
- No service-role key in browser-accessible code.
- Separate secrets per environment.
- Rotate secrets after exposure or role changes.
- Document owner and rotation cadence.

## Audit Logging
Audit logs should capture authentication events, role changes, permission changes, workflow transitions, evidence changes, publication readiness changes, accreditation status updates, administrative actions, and security exceptions.

## Secure Development
- Review security impact in every PR.
- Validate all inputs at trust boundaries.
- Avoid unsafe dynamic SQL.
- Avoid logging secrets or sensitive content.
- Keep provider SDK use isolated behind infrastructure adapters where practical.

## TODO
- Create detailed threat model, role matrix, data classification policy, and security review checklist.
