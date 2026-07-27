# Security Policy

## Data Classification

- **Confidential:** User credentials, session tokens, API keys
- **Internal:** Manuscript data, editorial decisions
- **Public:** None (all data is internal)

## Mandatory Controls

- Supabase RLS on all tables
- HTTP-only cookies for sessions
- No `SUPABASE_SERVICE_ROLE_KEY` in client bundles
- Zod validation on all Server Action inputs
- `requireRole()` on all Server Actions

## Incident Response

Contact the Engineering Team Owner immediately for any security incident.
