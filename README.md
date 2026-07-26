# Risenologi JAMS

## Purpose
Provide the engineering foundation for Risenologi JAMS, the Journal Accreditation Management System.

## Scope
This repository currently contains foundational documentation, governance templates, planning artifacts, and placeholder directories only. It intentionally does not include application features, React pages, Next.js components, Supabase schema, API routes, or business logic.

## Status
Engineering foundation initialized. Application implementation has not started.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [Project Overview](#project-overview)
- [Mission](#mission)
- [Goals](#goals)
- [Repository Structure](#repository-structure)
- [Development Workflow](#development-workflow)
- [Documentation Structure](#documentation-structure)
- [Branch Strategy](#branch-strategy)
- [Technology Stack](#technology-stack)
- [Future Roadmap](#future-roadmap)
- [Contribution Guide](#contribution-guide)
- [TODO](#todo)

## Project Overview
Risenologi JAMS is planned as an enterprise-grade platform for editorial teams managing editorial workflow, reviewer workflow, publication workflow, quality assurance, accreditation readiness, and analytics.

## Mission
Build an enterprise-grade Journal Accreditation Management System that helps editorial teams coordinate workflows, preserve evidence, improve quality, and prepare for accreditation with confidence.

## Goals
- Establish a maintainable engineering foundation before implementation.
- Keep product, architecture, data, security, and deployment decisions documented.
- Enable future development with clear review, testing, and governance standards.
- Prevent premature business logic, UI, API, or database implementation.

## Repository Structure
```text
.github/              GitHub instructions, issue templates, pull request template, and workflow placeholder
AGENTS.md             AI engineering constitution and contribution guardrails
docs/                 Product, architecture, process, and operational documentation
docs/adr/             Architecture decision records
docs/rfc/             Request for comments documents
docs/templates/       ADR, RFC, and process templates
docs/security/        Security strategy and threat-modeling documentation
docs/operations/      Deployment, release, and incident runbooks
docs/product/         Product glossary, personas, and workflow references
docs/qa/              Testing and quality gate references
docs/diagrams/        Architecture diagram source files
public/               Future static assets
scripts/              Future automation scripts
src/                  Future application source
tasks/                Backlog and sprint planning documents
tests/                Future test assets
supabase/             Future Supabase configuration, migrations, seeds, and functions
```

## Development Workflow
1. Define or select an approved task from `tasks/`.
2. Update the relevant documentation in `docs/` before implementation.
3. Create a branch from the main integration branch.
4. Make the smallest reviewable change.
5. Run applicable checks.
6. Open a pull request using the repository template.

## Documentation Structure
- `docs/00-CONSTITUTION.md`: product and engineering governance.
- `docs/01-VISION.md`: mission, outcomes, and long-term direction.
- `docs/02-PRD.md`: product requirements foundation.
- `docs/03-ROADMAP.md`: phased delivery plan.
- `docs/04-ARCHITECTURE.md`: system architecture foundation.
- `docs/05-DATABASE.md`: database planning and governance.
- `docs/06-UI.md`: UI and design system governance.
- `docs/07-CODING-STANDARD.md`: coding conventions.
- `docs/08-AI-RULES.md`: AI collaboration rules.
- `docs/09-API.md`: API design governance.
- `docs/10-DEPLOYMENT.md`: deployment and operations planning.
- `docs/11-SECURITY.md`: security strategy and threat-modeling foundation.
- `docs/12-TESTING.md`: testing strategy and quality gate foundation.
- `docs/13-OBSERVABILITY.md`: logging, metrics, tracing, alerting, and audit observability foundation.
- `docs/CHANGELOG.md`: change history.

## Branch Strategy
- `main`: stable production-ready history.
- `develop`: optional integration branch when team size requires it.
- `feature/*`: scoped implementation work.
- `chore/*`: maintenance and tooling changes.
- `docs/*`: documentation-only changes.
- `fix/*`: corrective changes.

## Technology Stack
Planned technologies include Next.js, TypeScript, Supabase, Vercel, Tailwind CSS, and shadcn/ui. These tools are not initialized yet.

## Future Roadmap
- Finalize product requirements and workflow boundaries.
- Review and approve the proposed software architecture baseline.
- Define architecture decision records for framework, data, auth, and deployment choices.
- Establish testing, CI, observability, and security practices.
- Initialize the application only after foundation documents are reviewed.

## Contribution Guide
- Follow `AGENTS.md` and the instructions in `.github/instructions/`.
- Do not commit secrets or generated local artifacts.
- Do not introduce business behavior without approved documentation.
- Keep pull requests small, traceable, and well tested.

## TODO
- Add setup commands after the application stack is intentionally initialized.
