# Deployment Architecture

## Purpose
Define the target deployment, release, environment, and operations architecture for Risenologi JAMS.

## Scope
Covers Vercel, Supabase, environments, secrets, CI/CD, migrations, preview deployments, production releases, rollback, incident response, and operational readiness. This is documentation only; deployment is not configured.

## Status
Proposed deployment architecture baseline. Requires review before CI/CD implementation.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [Environment Strategy](#environment-strategy)
- [Deployment Flow](#deployment-flow)
- [CI/CD Gates](#cicd-gates)
- [Migration Deployment](#migration-deployment)
- [Secrets Strategy](#secrets-strategy)
- [Rollback Strategy](#rollback-strategy)
- [Incident Response](#incident-response)
- [Operational Readiness Checklist](#operational-readiness-checklist)
- [TODO](#todo)

## Environment Strategy
| Environment | Purpose | Data Policy |
| --- | --- | --- |
| Local | Developer validation | Synthetic/local seed data only |
| Preview | Pull request review | No production data |
| Staging | Release candidate validation | Sanitized or controlled test data |
| Production | Live system | Real customer/journal data |

Environment variables must be managed in the hosting provider or secret manager. Secrets must not be committed.

## Deployment Flow
```text
Branch push
  -> Pull request
  -> Static checks and tests
  -> Preview deployment
  -> Reviewer approval
  -> Merge to main
  -> Production build
  -> Migration gate
  -> Production deploy
  -> Smoke tests
  -> Monitoring verification
```

## CI/CD Gates
Future CI should include:
- Formatting/lint checks.
- Type checking.
- Unit tests.
- Integration tests where available.
- Build validation.
- Security/dependency scans after dependencies exist.
- Migration validation after schema exists.
- Accessibility checks after UI exists.

## Migration Deployment
Database migrations require a stricter gate than application-only changes:
- Review migration diff.
- Verify RLS and permission impact.
- Validate locally and in staging.
- Confirm rollback or forward-fix plan.
- Deploy during an approved window if destructive or high risk.

## Secrets Strategy
- Store secrets only in managed environment configuration.
- Use separate keys per environment.
- Rotate keys after suspected exposure.
- Restrict service-role key access to server-only contexts.
- Document owner and rotation cadence for each secret.

## Rollback Strategy
Application rollback must be possible through Vercel deployment history. Database rollback must be planned per migration because not all schema changes are safely reversible. High-risk releases need a rollback or forward-fix playbook before deployment.

## Incident Response
Before production, define:
- Incident severity levels.
- On-call or owner escalation.
- Communication channels.
- Customer/stakeholder notification criteria.
- Post-incident review template.

## Operational Readiness Checklist
- CI gates active.
- Environment variables documented.
- Preview/staging/prod separation confirmed.
- Migration process tested.
- Smoke tests defined.
- Monitoring and alerts configured.
- Rollback path verified.
- Security review completed.

## TODO
- Create deployment runbooks and CI workflow definitions after the application toolchain is approved.
