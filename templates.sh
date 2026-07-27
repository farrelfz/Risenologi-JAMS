#!/bin/bash
set -e

# 1. Feature Template (folder structure README)
cat << 'TEMP' > templates/feature-template/README.md
# Feature Name
This template represents the standard folder structure for a Risenologi JAMS feature.

```text
src/features/feature-name/
├── types.ts          # Domain models, Enums, DTOs
├── schema.ts         # Zod schemas for validation
├── repository.ts     # Database access (Supabase)
├── service.ts        # Business logic and coordination
├── actions.ts        # Next.js Server Actions
├── permissions.ts    # RBAC logic specific to feature
├── constants.ts      # Feature-specific constants
├── mapper.ts         # DB <-> Domain transformations
├── errors.ts         # Custom domain errors
├── hooks.ts          # React hooks (Client)
├── components/       # UI fragments specific to feature
│   └── feature-component.tsx
├── pages/            # Next.js Route UI entries
│   └── page.tsx
└── tests/            # Unit and Integration tests
```
TEMP

# 2. Repository Template
cat << 'TEMP' > templates/repository-template/repository.ts
import { SupabaseClient } from '@supabase/supabase-js'
// import { Database } from '@/types/supabase'

export class FeatureRepository {
  constructor(private readonly supabase: SupabaseClient<any>) {}

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('table_name')
      .select('*')
      .eq('id', id)
      .single()
      
    if (error) throw error
    return data
  }

  // Other database operations...
}
TEMP

# 3. Service Template
cat << 'TEMP' > templates/service-template/service.ts
import { FeatureRepository } from './repository'

export class FeatureService {
  constructor(private readonly repo: FeatureRepository) {}

  async executeBusinessLogic(id: string) {
    try {
      const data = await this.repo.findById(id)
      if (!data) {
        return { success: false, error: 'Not Found' }
      }
      
      // Perform business logic here
      // NEVER access DB directly here, always use repo.
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Internal Error' }
    }
  }
}
TEMP

# 4. Action Template
cat << 'TEMP' > templates/action-template/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
// import { createClient } from '@/lib/supabase/server'
import { FeatureService } from './service'
import { FeatureRepository } from './repository'
// import { featureSchema } from './schema'

export async function performAction(formData: FormData) {
  // 1. Verify Authentication & RBAC (e.g. requireRole('Editor'))
  // const supabase = await createClient()
  
  // 2. Validate input with Zod
  // const parsed = featureSchema.safeParse(Object.fromEntries(formData))
  
  // 3. Initialize layers
  // const repo = new FeatureRepository(supabase)
  // const service = new FeatureService(repo)
  
  // 4. Execute service
  // const result = await service.executeBusinessLogic(parsed.data.id)
  
  // 5. Revalidate cache if successful
  // revalidatePath('/path')
  
  // return result
}
TEMP

# 5. Page Template
cat << 'TEMP' > templates/page-template/page.tsx
import { Suspense } from 'react'

export default async function FeaturePage() {
  // Fetch data (Server Component)
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Feature Title</h1>
      
      <Suspense fallback={<div>Loading...</div>}>
        {/* Child Components */}
      </Suspense>
    </div>
  )
}
TEMP

# 6. Form Template
cat << 'TEMP' > templates/form-template/form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// import { featureSchema } from '../schema'
// import { performAction } from '../actions'

export function FeatureForm() {
  const form = useForm({
    // resolver: zodResolver(featureSchema),
    defaultValues: {
      // fields
    }
  })

  async function onSubmit(data: any) {
    // const formData = new FormData()
    // Append data
    // await performAction(formData)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form Fields using shadcn/ui */}
      <button type="submit">Submit</button>
    </form>
  )
}
TEMP

# 7. Table Template
cat << 'TEMP' > templates/table-template/table.tsx
'use client'

// Use shadcn/ui DataTable component
export function FeatureTable({ data }: { data: any[] }) {
  return (
    <div className="rounded-md border">
      {/* Table implementation with pagination/filtering */}
    </div>
  )
}
TEMP

# 8. Migration Template
cat << 'TEMP' > templates/migration-template/00000000000000_migration_name.sql
-- Migration: [Name]
-- Description: [Brief description]

BEGIN;

CREATE TABLE public.table_name (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Additional columns here
    name TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow internal access" ON public.table_name
    FOR ALL
    USING (auth.jwt() ->> 'role' IN ('administrator', 'journal_manager', 'editor'));

COMMIT;
TEMP

# 9. Test Template
cat << 'TEMP' > templates/test-template/feature.test.ts
import { describe, it, expect, vi } from 'vitest'
import { FeatureService } from '../service'

describe('FeatureService', () => {
  it('should execute business logic successfully', async () => {
    // Mock Repo
    const mockRepo = {
      findById: vi.fn().mockResolvedValue({ id: '1', name: 'Test' })
    }
    
    const service = new FeatureService(mockRepo as any)
    const result = await service.executeBusinessLogic('1')
    
    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Test')
  })
})
TEMP

# 10. Documentation Template
cat << 'TEMP' > templates/documentation-template/document.md
# Document Title

> **Status:** Draft
> **Domain:** Risenologi JAMS
> **Owner:** Engineering Team
> **Last Updated:** YYYY-MM-DD

## Purpose
Briefly describe the purpose of this document.

## Scope
What is covered and what is explicitly not covered.

## Content
Main body...

---
## References
- [Link](url)
TEMP

echo "Templates generated"
