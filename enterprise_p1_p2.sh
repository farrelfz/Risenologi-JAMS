#!/bin/bash
set -e

echo "=== P1: Deduplicating 06-implementation/ ==="

cd /home/si/Codingan/Ibadah/Risenologi-JAMS

# Remove the un-numbered stub files (keep numbered ones)
rm -f docs/06-implementation/foundation.md
rm -f docs/06-implementation/journal-management.md
rm -f docs/06-implementation/manuscript-management.md
rm -f docs/06-implementation/editorial-workflow.md
rm -f docs/06-implementation/publication-management.md
rm -f docs/06-implementation/administration.md
rm -f docs/06-implementation/reporting.md
rm -f docs/06-implementation/development-roadmap.md
rm -f docs/06-implementation/notifications.md
rm -f docs/06-implementation/file-storage.md

# Convert numbered .md files into subdirectory/README.md
declare -A CAPS=(
  ["01-foundation"]="01-foundation.md"
  ["02-journal-management"]="02-journal-management.md"
  ["03-manuscript-management"]="03-manuscript-management.md"
  ["04-editorial-workflow"]="04-editorial-workflow.md"
  ["05-publication-management"]="05-publication-management.md"
  ["06-administration"]="06-administration.md"
  ["07-reporting"]="07-reporting.md"
  ["08-development-roadmap"]="08-development-roadmap.md"
)

for dir in "${!CAPS[@]}"; do
  src="docs/06-implementation/${CAPS[$dir]}"
  dst_dir="docs/06-implementation/$dir"
  mkdir -p "$dst_dir"
  if [ -f "$src" ]; then
    mv "$src" "$dst_dir/README.md"
  fi
done

echo "P1 Done"

echo "=== P2: Creating ADR directory ==="

mkdir -p docs/04-architecture/adr

cat > docs/04-architecture/adr/README.md << 'EOF'
# Architecture Decision Records (ADR)

This directory contains the official Architecture Decision Records for Risenologi JAMS.

ADRs document significant architectural decisions made during the project, including the context, decision, and consequences.

## Index

| ID | Title | Status |
|----|-------|--------|
| [ADR-0001](ADR-0001-no-ojs.md) | No OJS / No Public Submission Portal | Accepted |
| [ADR-0002](ADR-0002-server-actions.md) | Server Actions over REST API | Accepted |
| [ADR-0003](ADR-0003-supabase.md) | Supabase as Backend-as-a-Service | Accepted |
| [ADR-0004](ADR-0004-feature-architecture.md) | Feature Architecture Blueprint | Accepted |
| [ADR-0005](ADR-0005-rbac.md) | Role-Based Access Control (RBAC) | Accepted |
EOF

cat > docs/04-architecture/adr/ADR-0001-no-ojs.md << 'EOF'
# ADR-0001: No OJS / No Public Submission Portal

**Status:** Accepted
**Date:** 2026-07-26

## Context
Risenologi operates an editorial team that needs tooling to manage internal editorial workflows, manuscript tracking, and accreditation readiness. There is pressure to build something similar to Open Journal Systems (OJS).

## Decision
Risenologi JAMS will NOT replicate OJS or build a public submission portal. It is strictly an internal Editorial Management System (CRM) used only by editorial staff.

## Consequences
- No external Author or Reviewer accounts will be created.
- All manuscript-related data is entered by internal editorial staff.
- The system is simpler, more secure, and easier to maintain.
EOF

cat > docs/04-architecture/adr/ADR-0002-server-actions.md << 'EOF'
# ADR-0002: Next.js Server Actions over REST API

**Status:** Accepted
**Date:** 2026-07-26

## Context
We needed to decide between a traditional REST API layer (Next.js Route Handlers) and Next.js Server Actions for data mutation.

## Decision
All data mutations will be handled via **Next.js Server Actions** (`'use server'`). Route Handlers will only be used for webhook endpoints or third-party integrations.

## Consequences
- Reduced boilerplate (no separate API route files for CRUD).
- Type-safe end-to-end using TypeScript and Zod.
- Server Actions require Zod validation and RBAC checks at every entry point.
EOF

cat > docs/04-architecture/adr/ADR-0003-supabase.md << 'EOF'
# ADR-0003: Supabase as Backend-as-a-Service

**Status:** Accepted
**Date:** 2026-07-26

## Context
We needed a PostgreSQL-compatible database with built-in authentication, Row Level Security, and file storage.

## Decision
Supabase will be used as the primary backend infrastructure for database, authentication, and storage.

## Consequences
- PostgreSQL is the primary data store.
- Supabase Auth handles all authentication sessions.
- Row Level Security (RLS) is mandatory on all tables.
- Service Role Key must NEVER be exposed to client bundles.
EOF

cat > docs/04-architecture/adr/ADR-0004-feature-architecture.md << 'EOF'
# ADR-0004: Feature Architecture Blueprint

**Status:** Accepted
**Date:** 2026-07-26

## Context
Without a strict architecture pattern, different developers and AI agents would produce inconsistent module structures.

## Decision
All business features must follow the **Feature Architecture Blueprint**:

```
src/features/feature-name/
├── types.ts       ← Domain models
├── schema.ts      ← Zod validation
├── repository.ts  ← Database only
├── service.ts     ← Business logic only
├── actions.ts     ← Next.js Server Actions
├── permissions.ts ← RBAC
└── components/    ← UI fragments
```

## Consequences
- Consistent, predictable module structure across all features.
- Strict dependency rules: Components → Actions → Service → Repository → DB.
- Business logic is never duplicated in UI or repositories.
EOF

cat > docs/04-architecture/adr/ADR-0005-rbac.md << 'EOF'
# ADR-0005: Role-Based Access Control (RBAC)

**Status:** Accepted
**Date:** 2026-07-26

## Context
We needed to define who can perform which actions within the system.

## Decision
Three internal roles are defined: **Administrator**, **Journal Manager**, and **Editor**. There are NO external roles (Author, Reviewer).

| Role | Capabilities |
|------|-------------|
| Administrator | Full system access, user management |
| Journal Manager | Manage journals, manuscripts, editorial decisions |
| Editor | Process assigned manuscripts, update statuses |

## Consequences
- All Server Actions must enforce role checks using `requireRole()`.
- Supabase RLS policies must mirror these three roles.
- No public or anonymous access is permitted to any table.
EOF

# Clean up the old flat decision-records.md if empty
if [ -f "docs/04-architecture/decision-records.md" ]; then
  wc=$(wc -c < "docs/04-architecture/decision-records.md")
  if [ "$wc" -lt 500 ]; then
    rm -f docs/04-architecture/decision-records.md
    echo "Removed stub decision-records.md"
  fi
fi

echo "P2 Done"
