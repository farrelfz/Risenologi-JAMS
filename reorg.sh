#!/bin/bash
set -e

mkdir -p docs/01-product docs/02-domain docs/03-database docs/04-architecture docs/05-engineering docs/06-implementation docs/07-delivery docs/08-reviews docs/09-deployment docs/10-ai-development docs/11-ai-prompts docs/12-ai-operating-system templates

# 01-product
[ -d docs/product ] && mv docs/product/* docs/01-product/ 2>/dev/null || true
touch docs/01-product/README.md docs/01-product/vision.md docs/01-product/mission.md docs/01-product/objectives.md docs/01-product/stakeholders.md docs/01-product/user-roles.md docs/01-product/business-capabilities.md docs/01-product/business-rules.md docs/01-product/editorial-workflow.md docs/01-product/product-roadmap.md docs/01-product/success-metrics.md

# 02-domain
touch docs/02-domain/README.md docs/02-domain/ubiquitous-language.md docs/02-domain/bounded-context.md docs/02-domain/domain-model.md docs/02-domain/aggregates.md docs/02-domain/entities.md docs/02-domain/value-objects.md docs/02-domain/domain-services.md docs/02-domain/domain-events.md docs/02-domain/state-machines.md docs/02-domain/dependency-map.md

# 03-database
[ -d docs/database ] && mv docs/database/* docs/03-database/ 2>/dev/null || true
touch docs/03-database/README.md docs/03-database/erd.md docs/03-database/schema-overview.md docs/03-database/tables.md docs/03-database/relationships.md docs/03-database/constraints.md docs/03-database/indexes.md docs/03-database/views.md docs/03-database/functions.md docs/03-database/triggers.md docs/03-database/rls-policies.md docs/03-database/migrations.md docs/03-database/seed-data.md docs/03-database/backup-strategy.md

# 04-architecture
[ -d docs/architecture ] && mv docs/architecture/* docs/04-architecture/ 2>/dev/null || true
touch docs/04-architecture/README.md docs/04-architecture/system-overview.md docs/04-architecture/architectural-principles.md docs/04-architecture/project-structure.md docs/04-architecture/feature-architecture.md docs/04-architecture/module-dependency.md docs/04-architecture/authentication.md docs/04-architecture/authorization.md docs/04-architecture/security.md docs/04-architecture/caching.md docs/04-architecture/observability.md docs/04-architecture/deployment-architecture.md docs/04-architecture/decision-records.md

# 05-engineering
touch docs/05-engineering/README.md docs/05-engineering/engineering-standards.md docs/05-engineering/coding-standards.md docs/05-engineering/naming-conventions.md docs/05-engineering/folder-conventions.md docs/05-engineering/git-workflow.md docs/05-engineering/branching-strategy.md docs/05-engineering/commit-convention.md docs/05-engineering/pull-request-guidelines.md docs/05-engineering/code-review-checklist.md docs/05-engineering/testing-strategy.md docs/05-engineering/documentation-standards.md docs/05-engineering/definition-of-done.md

# 06-implementation
[ -d docs/implementation ] && mv docs/implementation/* docs/06-implementation/ 2>/dev/null || true
touch docs/06-implementation/README.md docs/06-implementation/foundation.md docs/06-implementation/journal-management.md docs/06-implementation/manuscript-management.md docs/06-implementation/editorial-workflow.md docs/06-implementation/publication-management.md docs/06-implementation/administration.md docs/06-implementation/reporting.md docs/06-implementation/notifications.md docs/06-implementation/file-storage.md docs/06-implementation/development-roadmap.md

# 07-delivery
touch docs/07-delivery/README.md docs/07-delivery/capability-roadmap.md docs/07-delivery/epic-template.md docs/07-delivery/feature-template.md docs/07-delivery/user-story-template.md docs/07-delivery/acceptance-criteria.md docs/07-delivery/technical-design-template.md docs/07-delivery/implementation-checklist.md docs/07-delivery/release-plan.md docs/07-delivery/sprint-planning.md

# 08-reviews
touch docs/08-reviews/README.md docs/08-reviews/architecture-review.md docs/08-reviews/design-review.md docs/08-reviews/code-review.md docs/08-reviews/security-review.md docs/08-reviews/performance-review.md docs/08-reviews/accessibility-review.md docs/08-reviews/testing-review.md docs/08-reviews/release-review.md docs/08-reviews/architecture-readiness-review.md

# 09-deployment
touch docs/09-deployment/README.md docs/09-deployment/environments.md docs/09-deployment/environment-variables.md docs/09-deployment/vercel.md docs/09-deployment/supabase.md docs/09-deployment/ci-cd.md docs/09-deployment/monitoring.md docs/09-deployment/logging.md docs/09-deployment/backup.md docs/09-deployment/rollback.md docs/09-deployment/scaling.md docs/09-deployment/production-checklist.md

# 10-ai-development
touch docs/10-ai-development/README.md docs/10-ai-development/project-bootstrap.md docs/10-ai-development/database-generator.md docs/10-ai-development/authentication-generator.md docs/10-ai-development/feature-generator.md docs/10-ai-development/repository-generator.md docs/10-ai-development/service-generator.md docs/10-ai-development/server-action-generator.md docs/10-ai-development/ui-generator.md docs/10-ai-development/api-generator.md docs/10-ai-development/testing-generator.md docs/10-ai-development/refactoring-generator.md docs/10-ai-development/security-review-generator.md docs/10-ai-development/deployment-generator.md

# 11-ai-prompts
touch docs/11-ai-prompts/README.md docs/11-ai-prompts/constitution.md docs/11-ai-prompts/system-prompt.md docs/11-ai-prompts/architect-agent.md docs/11-ai-prompts/backend-agent.md docs/11-ai-prompts/frontend-agent.md docs/11-ai-prompts/database-agent.md docs/11-ai-prompts/qa-agent.md docs/11-ai-prompts/reviewer-agent.md docs/11-ai-prompts/devops-agent.md docs/11-ai-prompts/new-feature-workflow.md docs/11-ai-prompts/bug-fix-workflow.md docs/11-ai-prompts/refactor-workflow.md docs/11-ai-prompts/release-workflow.md docs/11-ai-prompts/prompt-library.md

# 12-ai-operating-system
touch docs/12-ai-operating-system/README.md docs/12-ai-operating-system/ai-governance.md docs/12-ai-operating-system/ai-workflow.md docs/12-ai-operating-system/ai-collaboration.md docs/12-ai-operating-system/ai-context-management.md docs/12-ai-operating-system/ai-memory.md docs/12-ai-operating-system/ai-quality-gates.md docs/12-ai-operating-system/ai-review-process.md docs/12-ai-operating-system/ai-definition-of-done.md docs/12-ai-operating-system/ai-failure-recovery.md docs/12-ai-operating-system/ai-playbook.md docs/12-ai-operating-system/ai-decision-log.md

# Root docs
touch docs/SUMMARY.md docs/GLOSSARY.md

# Create template folders
mkdir -p templates/feature-template templates/repository-template templates/service-template templates/action-template templates/page-template templates/form-template templates/table-template templates/migration-template templates/test-template templates/documentation-template

# Remove old folders
rm -rf docs/accreditation docs/adr docs/api docs/architecture docs/database docs/decisions docs/diagrams docs/epics docs/governance docs/implementation docs/operations docs/product docs/qa docs/rfc docs/roadmap docs/templates docs/testing docs/workflows

echo "Done"
