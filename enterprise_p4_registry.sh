#!/bin/bash
set -e
cd /home/si/Codingan/Ibadah/Risenologi-JAMS
mkdir -p registry

cat > registry/features.json << 'EOF'
{
  "journal": {
    "table": "journals",
    "service": "JournalService",
    "repository": "JournalRepository",
    "actions": "actions.ts",
    "path": "src/features/journal",
    "roles": ["administrator", "journal_manager", "editor"],
    "writeRoles": ["administrator", "journal_manager"],
    "deleteRoles": ["administrator"]
  },
  "manuscript": {
    "table": "manuscripts",
    "service": "ManuscriptService",
    "repository": "ManuscriptRepository",
    "actions": "actions.ts",
    "path": "src/features/manuscript",
    "roles": ["administrator", "journal_manager", "editor"],
    "writeRoles": ["administrator", "journal_manager", "editor"],
    "deleteRoles": ["administrator", "journal_manager"]
  },
  "editorial": {
    "table": "editorial_decisions",
    "service": "EditorialService",
    "repository": "EditorialRepository",
    "actions": "actions.ts",
    "path": "src/features/editorial",
    "roles": ["administrator", "journal_manager", "editor"],
    "writeRoles": ["administrator", "journal_manager", "editor"],
    "deleteRoles": ["administrator"]
  },
  "publication": {
    "table": "publications",
    "service": "PublicationService",
    "repository": "PublicationRepository",
    "actions": "actions.ts",
    "path": "src/features/publication",
    "roles": ["administrator", "journal_manager"],
    "writeRoles": ["administrator", "journal_manager"],
    "deleteRoles": ["administrator"]
  }
}
EOF

cat > registry/tables.json << 'EOF'
{
  "journals": {
    "feature": "journal",
    "rls": true,
    "primaryKey": "id",
    "softDelete": false,
    "auditLog": true
  },
  "manuscripts": {
    "feature": "manuscript",
    "rls": true,
    "primaryKey": "id",
    "softDelete": true,
    "auditLog": true
  },
  "editorial_decisions": {
    "feature": "editorial",
    "rls": true,
    "primaryKey": "id",
    "softDelete": false,
    "auditLog": true
  },
  "publications": {
    "feature": "publication",
    "rls": true,
    "primaryKey": "id",
    "softDelete": false,
    "auditLog": true
  },
  "users": {
    "feature": "auth",
    "rls": true,
    "primaryKey": "id",
    "softDelete": false,
    "auditLog": true,
    "note": "Managed by Supabase Auth"
  }
}
EOF

cat > registry/permissions.json << 'EOF'
{
  "roles": ["administrator", "journal_manager", "editor"],
  "invalidRoles": ["author", "reviewer"],
  "permissions": {
    "administrator": {
      "journals": ["create", "read", "update", "delete", "archive"],
      "manuscripts": ["create", "read", "update", "delete"],
      "editorial_decisions": ["create", "read", "update", "delete"],
      "publications": ["create", "read", "update", "delete"],
      "users": ["create", "read", "update", "delete"]
    },
    "journal_manager": {
      "journals": ["create", "read", "update", "archive"],
      "manuscripts": ["create", "read", "update"],
      "editorial_decisions": ["create", "read", "update"],
      "publications": ["create", "read", "update"],
      "users": ["read"]
    },
    "editor": {
      "journals": ["read"],
      "manuscripts": ["read", "update"],
      "editorial_decisions": ["create", "read"],
      "publications": ["read"],
      "users": []
    }
  }
}
EOF

cat > registry/routes.json << 'EOF'
{
  "public": [],
  "authenticated": [
    { "path": "/dashboard", "roles": ["administrator", "journal_manager", "editor"] },
    { "path": "/journals", "roles": ["administrator", "journal_manager", "editor"] },
    { "path": "/journals/[id]", "roles": ["administrator", "journal_manager", "editor"] },
    { "path": "/manuscripts", "roles": ["administrator", "journal_manager", "editor"] },
    { "path": "/manuscripts/[id]", "roles": ["administrator", "journal_manager", "editor"] },
    { "path": "/editorial", "roles": ["administrator", "journal_manager", "editor"] },
    { "path": "/publications", "roles": ["administrator", "journal_manager"] },
    { "path": "/admin", "roles": ["administrator"] },
    { "path": "/admin/users", "roles": ["administrator"] }
  ]
}
EOF

cat > registry/services.json << 'EOF'
{
  "JournalService": {
    "file": "src/features/journal/service.ts",
    "repository": "JournalRepository",
    "methods": ["findAll", "findById", "create", "update", "archive", "delete"]
  },
  "ManuscriptService": {
    "file": "src/features/manuscript/service.ts",
    "repository": "ManuscriptRepository",
    "methods": ["findAll", "findById", "create", "update", "submitForReview", "delete"]
  },
  "EditorialService": {
    "file": "src/features/editorial/service.ts",
    "repository": "EditorialRepository",
    "methods": ["findAll", "findByManuscript", "recordDecision"]
  },
  "PublicationService": {
    "file": "src/features/publication/service.ts",
    "repository": "PublicationRepository",
    "methods": ["findAll", "findById", "publish", "unpublish"]
  }
}
EOF

cat > registry/repositories.json << 'EOF'
{
  "JournalRepository": {
    "file": "src/features/journal/repository.ts",
    "table": "journals",
    "methods": ["findAll", "findById", "create", "update", "delete"]
  },
  "ManuscriptRepository": {
    "file": "src/features/manuscript/repository.ts",
    "table": "manuscripts",
    "methods": ["findAll", "findById", "create", "update", "delete"]
  },
  "EditorialRepository": {
    "file": "src/features/editorial/repository.ts",
    "table": "editorial_decisions",
    "methods": ["findAll", "findByManuscriptId", "create", "update"]
  },
  "PublicationRepository": {
    "file": "src/features/publication/repository.ts",
    "table": "publications",
    "methods": ["findAll", "findById", "create", "update"]
  }
}
EOF

cat > registry/components.json << 'EOF'
{
  "shared": [
    "DataTable", "PageHeader", "StatusBadge", "ConfirmDialog",
    "EmptyState", "ErrorState", "LoadingSkeleton", "Pagination"
  ],
  "journal": ["JournalTable", "JournalForm", "JournalStatusBadge", "JournalActions"],
  "manuscript": ["ManuscriptTable", "ManuscriptForm", "ManuscriptStatusBadge", "ManuscriptActions"],
  "editorial": ["EditorialDecisionForm", "DecisionHistory"],
  "publication": ["PublicationTable", "PublicationForm"]
}
EOF

echo "P4 Done"
