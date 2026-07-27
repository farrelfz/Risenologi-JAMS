#!/bin/bash
set -e
cd /home/si/Codingan/Ibadah/Risenologi-JAMS

echo "=== P8: knowledge/ ==="
mkdir -p knowledge/{business,domain,database,architecture,features,ui}

cat > knowledge/business/overview.yaml << 'EOF'
system: Risenologi JAMS
type: Internal Editorial Management System
not: OJS, Public Submission Platform, External Portal

purpose: >
  Enable the Risenologi editorial office to manage journal operations,
  track manuscript lifecycles, record editorial decisions, and maintain
  accreditation readiness.

actors:
  - name: Administrator
    description: Full system control, user and configuration management
  - name: Journal Manager
    description: Manages journal portfolios, manuscripts, and editorial workflows
  - name: Editor
    description: Processes assigned manuscripts and records editorial decisions

forbidden_actors:
  - Author (no accounts — data entered by editorial staff)
  - Reviewer (no accounts — decisions recorded internally)

capabilities:
  - journal-management
  - manuscript-management
  - editorial-workflow
  - publication-management
  - user-administration
  - reporting-and-analytics
EOF

cat > knowledge/domain/bounded-contexts.yaml << 'EOF'
contexts:
  journal:
    owns: [journals, journal_volumes, journal_issues]
    integrates_with: [manuscript, publication]

  manuscript:
    owns: [manuscripts, manuscript_files, manuscript_authors]
    integrates_with: [journal, editorial]

  editorial:
    owns: [editorial_decisions, review_cycles]
    integrates_with: [manuscript]

  publication:
    owns: [publications]
    integrates_with: [manuscript, journal]

  auth:
    owns: [users, sessions, roles]
    integrates_with: [all]
EOF

cat > knowledge/database/conventions.yaml << 'EOF'
naming:
  tables: snake_case_plural
  columns: snake_case
  primary_key: id (uuid)
  foreign_keys: "{table_singular}_id"
  timestamps: [created_at, updated_at]

defaults:
  id: gen_random_uuid()
  created_at: now()
  updated_at: now()

mandatory_per_table:
  - id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  - updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  - ROW LEVEL SECURITY enabled
  - internal access policy

forbidden:
  - anonymous access policies
  - plain text passwords
  - storing secrets in rows
EOF

cat > knowledge/architecture/request-flow.yaml << 'EOF'
flow:
  - step: 1
    layer: Browser / Next.js Page
    description: User interacts with UI component

  - step: 2
    layer: React Component
    description: Calls Server Action via form action or startTransition

  - step: 3
    layer: Server Action (actions.ts)
    description: Validates Zod schema, enforces RBAC, calls Service

  - step: 4
    layer: Service (service.ts)
    description: Executes business logic, calls Repository

  - step: 5
    layer: Repository (repository.ts)
    description: Performs Supabase database query

  - step: 6
    layer: PostgreSQL + RLS
    description: Executes SQL with Row Level Security enforcement

  - step: 7
    direction: reverse
    description: Data flows back through Repository → Service → Action → Component
EOF

# Feature knowledge
for feature in journal manuscript editorial publication; do
cat > "knowledge/features/$feature.yaml" << YAML
feature: $feature
registry: registry/features.json
spec: specs/$feature/
contract: contracts/$feature.contract.yaml
rules: rules/architecture.yaml
validators: validators/
YAML
done

cat > knowledge/ui/design-system.yaml << 'EOF'
stack:
  css: tailwind
  components: shadcn/ui
  icons: lucide-react
  fonts: inter

tokens:
  colors:
    primary: slate
    accent: blue
    danger: red
    success: green
    warning: amber

patterns:
  list_page: header + filters + table + pagination
  detail_page: header + metadata + actions + history
  form_page: header + form + submit/cancel

mandatory_ui_states:
  - loading (skeleton)
  - empty (illustration + message + action)
  - error (icon + message + retry)

accessibility:
  standard: WCAG 2.1 AA
  requirements:
    - aria-label on all interactive elements
    - keyboard navigation support
    - color contrast 4.5:1 minimum
EOF

echo "P8 Done"

echo "=== P9: model/ ==="
mkdir -p model

cat > model/permission-model.json << 'EOF'
{
  "version": "1.0",
  "roles": ["administrator", "journal_manager", "editor"],
  "forbidden_roles": ["author", "reviewer"],
  "matrix": {
    "journals": {
      "create": ["administrator", "journal_manager"],
      "read": ["administrator", "journal_manager", "editor"],
      "update": ["administrator", "journal_manager"],
      "delete": ["administrator"]
    },
    "manuscripts": {
      "create": ["administrator", "journal_manager", "editor"],
      "read": ["administrator", "journal_manager", "editor"],
      "update": ["administrator", "journal_manager", "editor"],
      "delete": ["administrator", "journal_manager"]
    },
    "editorial_decisions": {
      "create": ["administrator", "journal_manager", "editor"],
      "read": ["administrator", "journal_manager", "editor"],
      "update": ["administrator"],
      "delete": ["administrator"]
    },
    "publications": {
      "create": ["administrator", "journal_manager"],
      "read": ["administrator", "journal_manager", "editor"],
      "update": ["administrator", "journal_manager"],
      "delete": ["administrator"]
    }
  }
}
EOF

cat > model/workflow-model.json << 'EOF'
{
  "version": "1.0",
  "manuscript_lifecycle": {
    "states": ["draft", "under_review", "revision_required", "accepted", "rejected", "published"],
    "initial": "draft",
    "transitions": [
      { "from": "draft", "to": "under_review", "actor": ["editor", "journal_manager"], "trigger": "submit_for_review" },
      { "from": "under_review", "to": "revision_required", "actor": ["journal_manager", "editor"], "trigger": "request_revision" },
      { "from": "under_review", "to": "accepted", "actor": ["journal_manager"], "trigger": "accept" },
      { "from": "under_review", "to": "rejected", "actor": ["journal_manager"], "trigger": "reject" },
      { "from": "revision_required", "to": "under_review", "actor": ["editor", "journal_manager"], "trigger": "resubmit" },
      { "from": "accepted", "to": "published", "actor": ["administrator", "journal_manager"], "trigger": "publish" }
    ]
  },
  "journal_lifecycle": {
    "states": ["active", "inactive", "suspended"],
    "initial": "active",
    "transitions": [
      { "from": "active", "to": "inactive", "actor": ["administrator", "journal_manager"], "trigger": "archive" },
      { "from": "inactive", "to": "active", "actor": ["administrator"], "trigger": "reactivate" },
      { "from": "active", "to": "suspended", "actor": ["administrator"], "trigger": "suspend" }
    ]
  }
}
EOF

cat > model/feature-model.json << 'EOF'
{
  "version": "1.0",
  "features": {
    "journal": {
      "table": "journals",
      "service": "JournalService",
      "repository": "JournalRepository",
      "spec": "specs/journal",
      "contract": "contracts/journal.contract.yaml"
    },
    "manuscript": {
      "table": "manuscripts",
      "service": "ManuscriptService",
      "repository": "ManuscriptRepository",
      "spec": "specs/manuscript",
      "contract": "contracts/manuscript.contract.yaml"
    },
    "editorial": {
      "table": "editorial_decisions",
      "service": "EditorialService",
      "repository": "EditorialRepository",
      "spec": "specs/editorial",
      "contract": "contracts/editorial.contract.yaml"
    },
    "publication": {
      "table": "publications",
      "service": "PublicationService",
      "repository": "PublicationRepository",
      "spec": "specs/publication",
      "contract": "contracts/publication.contract.yaml"
    }
  }
}
EOF

cat > model/database-model.json << 'EOF'
{
  "version": "1.0",
  "tables": {
    "journals": {
      "columns": ["id", "title", "issn_print", "issn_online", "status", "created_at", "updated_at"],
      "rls": true,
      "audit": true
    },
    "manuscripts": {
      "columns": ["id", "journal_id", "title", "abstract", "status", "created_at", "updated_at"],
      "foreign_keys": { "journal_id": "journals.id" },
      "rls": true,
      "audit": true
    },
    "editorial_decisions": {
      "columns": ["id", "manuscript_id", "decision", "notes", "decided_by", "decided_at"],
      "foreign_keys": { "manuscript_id": "manuscripts.id" },
      "rls": true,
      "audit": true
    },
    "publications": {
      "columns": ["id", "manuscript_id", "volume", "issue", "published_date", "doi", "created_at"],
      "foreign_keys": { "manuscript_id": "manuscripts.id" },
      "rls": true,
      "audit": true
    }
  }
}
EOF

cat > model/business-model.json << 'EOF'
{
  "version": "1.0",
  "system": "Risenologi JAMS",
  "type": "Internal Editorial Management System",
  "capabilities": [
    "journal-management",
    "manuscript-management",
    "editorial-workflow",
    "publication-management",
    "user-administration"
  ],
  "roles": ["administrator", "journal_manager", "editor"],
  "forbidden_roles": ["author", "reviewer"],
  "technology": {
    "frontend": "Next.js 15 App Router + React 19 + Tailwind + shadcn/ui",
    "backend": "Next.js Server Actions + TypeScript + Zod",
    "database": "Supabase + PostgreSQL + RLS",
    "auth": "Supabase Auth with SSR cookies",
    "hosting": "Vercel"
  }
}
EOF

echo "P9 Done"

echo "=== P10: memory/ ==="
mkdir -p memory

cat > memory/current-state.yaml << 'EOF'
project: Risenologi JAMS
phase: Pre-Implementation (Foundation Documentation Complete)
date: 2026-07-26

completed_phases:
  - Phase 1: Product Discovery
  - Phase 2: Development Bootstrap
  - Phase 2.5: Infrastructure Completion
  - Phase 3: Documentation Architecture
  - Phase 4: Enterprise Repository Structure

current_phase: Phase 5 — Application Bootstrap
status: READY_TO_CODE

next_action: Initialize Next.js application using templates/feature-template
EOF

cat > memory/completed.yaml << 'EOF'
completed:
  - id: DOCS-001
    item: Product vision and role definitions
    date: 2026-07-26
  - id: DOCS-002
    item: Domain model and bounded contexts
    date: 2026-07-26
  - id: DOCS-003
    item: Database ERD and schema design
    date: 2026-07-26
  - id: DOCS-004
    item: Feature Architecture Blueprint
    date: 2026-07-26
  - id: DOCS-005
    item: 12-stage SDLC documentation structure
    date: 2026-07-26
  - id: DOCS-006
    item: AI Agent Library (system + workflows + generators + reviewers)
    date: 2026-07-26
  - id: REPO-001
    item: Enterprise repository structure with registry, specs, contracts, rules, validators
    date: 2026-07-26
EOF

cat > memory/next.yaml << 'EOF'
next_steps:
  - priority: 1
    id: CODE-001
    task: Initialize Next.js 15 project structure
    prompt: docs/10-ai-development/project-bootstrap.md
    agent: docs/11-ai-prompts/system/backend.md

  - priority: 2
    id: CODE-002
    task: Implement Supabase auth with RBAC
    prompt: docs/10-ai-development/authentication-generator.md
    agent: docs/11-ai-prompts/system/backend.md

  - priority: 3
    id: CODE-003
    task: Generate database migrations
    prompt: docs/10-ai-development/database-generator.md
    agent: docs/11-ai-prompts/system/database.md

  - priority: 4
    id: CODE-004
    task: Implement journal management feature
    prompt: docs/11-ai-prompts/workflows/new-feature.md
    spec: specs/journal/
    contract: contracts/journal.contract.yaml
EOF

cat > memory/known-issues.yaml << 'EOF'
known_issues: []
# No known technical issues at this stage. Codebase not yet initialized.
EOF

cat > memory/technical-debt.yaml << 'EOF'
technical_debt: []
# No technical debt at this stage. Codebase not yet initialized.
EOF

cat > memory/release-history.yaml << 'EOF'
releases: []
# No releases yet. Project is in documentation and architecture phase.
EOF

echo "P10 Done"

echo "=== P11: tasks/ restructure ==="
mkdir -p tasks/{epics,stories,tasks,bugs,research,technical-debt,sprints}

cat > tasks/epics/EPIC-001-foundation.md << 'EOF'
# EPIC-001: Application Foundation

**Status:** Ready
**Priority:** P0
**Owner:** Engineering Team

## Objective
Bootstrap the Next.js application with all infrastructure primitives: authentication, RBAC, shared UI components, and database connection.

## Stories
- US-001: Project structure and environment setup
- US-002: Supabase Auth integration with RBAC
- US-003: Shared UI component library
- US-004: Database migration pipeline

## Acceptance Criteria
- [ ] Next.js 15 app runs locally without errors
- [ ] Authentication works for all three roles
- [ ] Protected routes correctly enforce RBAC
- [ ] Supabase connection is verified
EOF

cat > tasks/epics/EPIC-002-journal-management.md << 'EOF'
# EPIC-002: Journal Management

**Status:** Planned
**Priority:** P1
**Owner:** Engineering Team
**Spec:** specs/journal/
**Contract:** contracts/journal.contract.yaml

## Objective
Implement complete journal CRUD and lifecycle management for internal editorial staff.

## Stories
- US-010: List and search journals
- US-011: Create new journal
- US-012: Edit journal metadata
- US-013: Archive/reactivate journal

## Acceptance Criteria
- [ ] Journal Manager can create a journal with ISSN
- [ ] Editor can view journals but not create
- [ ] Admin can delete journals
- [ ] Status transitions follow workflow model
EOF

cat > tasks/sprints/sprint-01.md << 'EOF'
# Sprint 01: Foundation Bootstrap

**Sprint Period:** TBD
**Goal:** Working Next.js app with auth and basic navigation

## Sprint Backlog
- [ ] TASK-001: Initialize Next.js project
- [ ] TASK-002: Configure Supabase client (server + client)
- [ ] TASK-003: Implement login page and session management
- [ ] TASK-004: Implement Next.js middleware for route protection
- [ ] TASK-005: Scaffold src/features directory structure
- [ ] TASK-006: Create shared UI components (layout, navigation, sidebar)
EOF

echo "P11 Done"
