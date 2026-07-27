#!/bin/bash
set -e
cd /home/si/Codingan/Ibadah/Risenologi-JAMS

echo "=== P12: examples/ ==="
mkdir -p examples/{good,bad}/{repository,service,action}

# Good repository example
cat > examples/good/repository/JournalRepository.ts << 'EOF'
// ✅ GOOD: Repository with no business logic, clean DB access only
import { SupabaseClient } from '@supabase/supabase-js'

export class JournalRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAll(): Promise<Journal[]> {
    const { data, error } = await this.supabase
      .from('journals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
  }

  async findById(id: string): Promise<Journal | null> {
    const { data, error } = await this.supabase
      .from('journals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async create(payload: CreateJournalPayload): Promise<Journal> {
    const { data, error } = await this.supabase
      .from('journals')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }
}
EOF

# Bad repository example
cat > examples/bad/repository/JournalRepository.ts << 'EOF'
// ❌ BAD: Repository contains business logic and permission checks
import { createClient } from '@/lib/supabase/server' // ❌ creates its own client

export class JournalRepository {
  async findAll(userRole: string) { // ❌ knows about roles
    if (userRole !== 'administrator') { // ❌ business logic in repository
      throw new Error('Forbidden')
    }
    const supabase = await createClient() // ❌ creates own connection
    const { data } = await supabase.from('journals').select('*')
    if (!data || data.length === 0) { // ❌ application logic
      return { message: 'No journals found', data: [] } // ❌ non-standard return
    }
    return data
  }
}
EOF

# Good service example
cat > examples/good/service/JournalService.ts << 'EOF'
// ✅ GOOD: Service contains only business logic, delegates DB to repository
import { JournalRepository } from '../repository/JournalRepository'

export class JournalService {
  constructor(private readonly repo: JournalRepository) {}

  async findAll() {
    return this.repo.findAll()
  }

  async create(payload: CreateJournalPayload) {
    // Business rule: ISSN must be unique
    if (payload.issn_print) {
      const existing = await this.repo.findByIssn(payload.issn_print)
      if (existing) {
        return { success: false, error: 'DUPLICATE_ISSN' }
      }
    }
    const journal = await this.repo.create(payload)
    return { success: true, data: journal }
  }
}
EOF

# Bad service example
cat > examples/bad/service/JournalService.ts << 'EOF'
// ❌ BAD: Service directly accesses database and handles HTTP
import { createClient } from '@supabase/supabase-js' // ❌ direct DB
import { NextResponse } from 'next/server' // ❌ HTTP in service

export class JournalService {
  async create(payload: any) {
    const supabase = createClient(process.env.URL!, process.env.KEY!) // ❌
    const { data, error } = await supabase.from('journals').insert(payload) // ❌

    if (error) {
      return NextResponse.json({ error }, { status: 500 }) // ❌ HTTP response in service
    }
    return NextResponse.json({ data }) // ❌
  }
}
EOF

# Good action example
cat > examples/good/action/journalActions.ts << 'EOF'
// ✅ GOOD: Action validates, enforces RBAC, delegates to service
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { createJournalSchema } from '../schema'
import { JournalRepository } from '../repository'
import { JournalService } from '../service'

export async function createJournal(formData: FormData) {
  // 1. RBAC
  await requireRole(['administrator', 'journal_manager'])

  // 2. Validate
  const parsed = createJournalSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  // 3. Execute
  const supabase = await createClient()
  const repo = new JournalRepository(supabase)
  const service = new JournalService(repo)
  const result = await service.create(parsed.data)

  if (!result.success) return result

  revalidatePath('/journals')
  return result
}
EOF

echo "P12 Done"

echo "=== P13: governance/ ==="
mkdir -p governance

cat > governance/ai-policy.md << 'EOF'
# AI Policy

> **Status:** Active
> **Owner:** Engineering Team

## Purpose
Defines how AI agents must operate within the Risenologi JAMS repository.

## Rules

1. **Never invent business behavior.** AI must not introduce features, tables, or workflows not documented in `specs/`, `contracts/`, or `docs/`.
2. **Always consult the registry.** Before generating code, AI must check `registry/` to understand what already exists.
3. **Follow the Feature Blueprint.** All code generation must match `docs/04-architecture/feature-architecture.md`.
4. **Enforce RBAC.** Never generate code that grants permissions beyond `registry/permissions.json`.
5. **One file at a time.** Per `docs/11-ai-prompts/workflows/new-feature.md`, AI must generate one file and wait for confirmation.
6. **No secrets.** AI must never emit secrets, credentials, or service role keys in code output.
7. **Use validators.** Generated code must pass all checks in `validators/` before being considered complete.
EOF

cat > governance/branch-policy.md << 'EOF'
# Branch Policy

## Branch Strategy
- `main`: Production. Protected. Requires PR and review.
- `develop`: Integration branch.
- `feature/TASK-XXX-description`: Feature branches.
- `fix/TASK-XXX-description`: Bug fixes.
- `hotfix/TASK-XXX-description`: Critical production fixes.

## Rules
- Never commit directly to `main`.
- Branch names must reference a task ID.
- PRs must pass CI checks before merge.
EOF

cat > governance/security-policy.md << 'EOF'
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
EOF

cat > governance/documentation-policy.md << 'EOF'
# Documentation Policy

## Requirements
Every document must include:
- Title
- Status (Draft, Active, Deprecated)
- Owner
- Last Updated date

## Locations
- Conceptual: `docs/`
- Specifications: `specs/`
- Contracts: `contracts/`
- Rules: `rules/`
- Knowledge: `knowledge/`

## Prohibited
- Documenting OJS-style public submission workflows
- Documenting Author or Reviewer external accounts
EOF

cat > governance/dependency-policy.md << 'EOF'
# Dependency Policy

## Rules
- No new dependencies without explicit task approval.
- All dependencies must be documented with purpose and license.
- Prefer built-in platform features before adding libraries.
- Security audit required for all new production dependencies.

## Core Dependencies (Locked)
- next, react, react-dom
- @supabase/supabase-js, @supabase/ssr
- zod
- tailwindcss
- react-hook-form, @hookform/resolvers
- lucide-react
EOF

echo "P13 Done"

echo "=== P14: scripts/generators/ ==="
mkdir -p scripts/generators

cat > scripts/generators/create-feature.ts << 'EOF'
#!/usr/bin/env tsx
/**
 * Scaffold a new feature following the Feature Architecture Blueprint.
 * Usage: tsx scripts/generators/create-feature.ts journal
 */
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const featureName = process.argv[2]
if (!featureName) {
  console.error('Usage: tsx create-feature.ts <feature-name>')
  process.exit(1)
}

const featureDir = join('src', 'features', featureName)
if (existsSync(featureDir)) {
  console.error(`Feature "${featureName}" already exists at ${featureDir}`)
  process.exit(1)
}

const Name = featureName.charAt(0).toUpperCase() + featureName.slice(1)

const files: Record<string, string> = {
  'types.ts': `// Domain types for ${featureName}\nexport interface ${Name} {\n  id: string\n  createdAt: Date\n  updatedAt: Date\n}\n`,
  'schema.ts': `import { z } from 'zod'\nexport const create${Name}Schema = z.object({\n  // Define fields\n})\nexport type Create${Name}Input = z.infer<typeof create${Name}Schema>\n`,
  'repository.ts': `import { SupabaseClient } from '@supabase/supabase-js'\nexport class ${Name}Repository {\n  constructor(private readonly supabase: SupabaseClient) {}\n  // Implement database methods\n}\n`,
  'service.ts': `import { ${Name}Repository } from './repository'\nexport class ${Name}Service {\n  constructor(private readonly repo: ${Name}Repository) {}\n  // Implement business logic\n}\n`,
  'actions.ts': `'use server'\n// Next.js Server Actions for ${featureName}\n`,
  'permissions.ts': `export const ${featureName.toUpperCase()}_PERMISSIONS = {\n  create: ['administrator', 'journal_manager'],\n  read: ['administrator', 'journal_manager', 'editor'],\n  update: ['administrator', 'journal_manager'],\n  delete: ['administrator'],\n} as const\n`,
  'constants.ts': `// Constants for ${featureName}\n`,
  'errors.ts': `export class ${Name}NotFoundError extends Error {\n  constructor(id: string) {\n    super(\`${Name} not found: \${id}\`)\n  }\n}\n`,
}

mkdirSync(featureDir, { recursive: true })
mkdirSync(join(featureDir, 'components'), { recursive: true })
mkdirSync(join(featureDir, 'tests'), { recursive: true })

for (const [filename, content] of Object.entries(files)) {
  writeFileSync(join(featureDir, filename), content)
}

console.log(`✅ Feature "${featureName}" scaffolded at ${featureDir}`)
console.log('📁 Files created:')
Object.keys(files).forEach(f => console.log(`   - ${f}`))
console.log('   - components/ (empty)')
console.log('   - tests/ (empty)')
EOF

echo "P14 Done"

echo "=== P15: docs/99-reference/ ==="
mkdir -p docs/99-reference

cat > docs/99-reference/nextjs.md << 'EOF'
# Next.js Reference

> Version: 15 (App Router)

## Key Concepts for Risenologi JAMS

### Server Components (default)
- Fetch data directly
- No `useState` or `useEffect`
- No event listeners

### Client Components (`'use client'`)
- Add interactivity
- Use hooks
- Access browser APIs

### Server Actions (`'use server'`)
- Handle form submissions
- Data mutations
- RBAC enforcement
- Must use Zod validation

### Middleware
- Authentication redirect
- RBAC route protection
- File: `middleware.ts` in root

### Caching
- `revalidatePath('/path')` — purge cache after mutations
- `revalidateTag('tag')` — purge by tag
EOF

cat > docs/99-reference/supabase.md << 'EOF'
# Supabase Reference

## Client Types

### Server-side (SSR)
```ts
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

### Client-side (Browser)
```ts
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

## RLS Policy Pattern
```sql
CREATE POLICY "internal_only" ON journals
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('administrator', 'journal_manager', 'editor')
  );
```

## NEVER use Service Role Key on client
```ts
// ❌ FORBIDDEN
createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)
```
EOF

for ref in postgresql tailwind shadcn vercel typescript; do
cat > "docs/99-reference/$ref.md" << REFMD
# ${ref^} Reference

> **Status:** Draft
> Pending technology-specific notes for Risenologi JAMS.
REFMD
done

echo "P15 Done"
