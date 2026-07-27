#!/bin/bash
set -e
cd /home/si/Codingan/Ibadah/Risenologi-JAMS

DOMAINS=(journal editorial manuscript publication dashboard)
FILES=(feature database permissions workflow validation ui tests)

for domain in "${DOMAINS[@]}"; do
  mkdir -p "specs/$domain"
done

# journal feature.yaml
cat > specs/journal/feature.yaml << 'EOF'
feature: journal
description: Manages journal metadata, ISSN, and lifecycle status.
capability: journal-management
domain: journal
owner: Journal Manager

fields:
  - name: id
    type: uuid
    required: true
    generated: true
  - name: title
    type: string
    required: true
    maxLength: 500
  - name: issn_print
    type: string
    required: false
    pattern: "^[0-9]{4}-[0-9]{3}[0-9X]$"
  - name: issn_online
    type: string
    required: false
    pattern: "^[0-9]{4}-[0-9]{3}[0-9X]$"
  - name: status
    type: enum
    values: [active, inactive, suspended]
    required: true
EOF

cat > specs/journal/database.yaml << 'EOF'
table: journals
schema: public
rls: true

columns:
  id: { type: uuid, primary: true, default: gen_random_uuid() }
  title: { type: text, nullable: false }
  issn_print: { type: text, nullable: true }
  issn_online: { type: text, nullable: true }
  status: { type: text, nullable: false, check: "status IN ('active','inactive','suspended')" }
  created_at: { type: timestamptz, default: now() }
  updated_at: { type: timestamptz, default: now() }

indexes:
  - columns: [status]
  - columns: [issn_print]
    unique: true

policies:
  - name: internal_access
    for: ALL
    using: "auth.jwt() ->> 'role' IN ('administrator', 'journal_manager', 'editor')"
EOF

cat > specs/journal/permissions.yaml << 'EOF'
feature: journal

actions:
  create:
    roles: [administrator, journal_manager]
  read:
    roles: [administrator, journal_manager, editor]
  update:
    roles: [administrator, journal_manager]
  delete:
    roles: [administrator]
  archive:
    roles: [administrator, journal_manager]
EOF

cat > specs/journal/workflow.yaml << 'EOF'
feature: journal

states:
  - active
  - inactive
  - suspended

transitions:
  - from: active
    to: inactive
    trigger: archive_journal
    actor: [administrator, journal_manager]
  - from: inactive
    to: active
    trigger: reactivate_journal
    actor: [administrator]
  - from: active
    to: suspended
    trigger: suspend_journal
    actor: [administrator]
EOF

cat > specs/journal/validation.yaml << 'EOF'
feature: journal

rules:
  - field: title
    rules: [required, min:3, max:500]
  - field: issn_print
    rules: [optional, pattern:/^\d{4}-\d{3}[\dX]$/]
  - field: issn_online
    rules: [optional, pattern:/^\d{4}-\d{3}[\dX]$/]
  - field: status
    rules: [required, enum:active|inactive|suspended]
EOF

cat > specs/journal/ui.yaml << 'EOF'
feature: journal

pages:
  - path: /journals
    type: list
    components: [JournalTable, JournalFilters, CreateJournalButton]
  - path: /journals/[id]
    type: detail
    components: [JournalHeader, JournalMetadata, JournalActions]
  - path: /journals/[id]/edit
    type: form
    components: [JournalForm]

components:
  JournalTable:
    columns: [title, issn_print, issn_online, status, created_at]
    features: [pagination, search, filter_by_status]
  JournalForm:
    fields: [title, issn_print, issn_online, status]
    validation: client_and_server
EOF

cat > specs/journal/tests.yaml << 'EOF'
feature: journal

unit:
  - schema validation (all field rules)
  - permission checks (each role / action combination)

integration:
  - create journal (Journal Manager) → journal saved, event emitted
  - read journal (Editor) → returns data
  - update journal (Editor) → forbidden
  - delete journal (Administrator) → journal removed

e2e:
  - Login as Journal Manager → create journal → verify in list
  - Login as Editor → attempt delete → receive 403
EOF

# Stub remaining domain YAML files
for domain in editorial manuscript publication dashboard; do
  for file in feature database permissions workflow validation ui tests; do
    cat > "specs/$domain/$file.yaml" << YAML
feature: $domain
description: Specification for $domain $file — pending detailed definition.
status: draft
YAML
  done
done

echo "P3 Done"
