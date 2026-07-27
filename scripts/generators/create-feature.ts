#!/usr/bin/env tsx
/**
 * Scaffold a new feature following the Feature Architecture Blueprint.
 * Usage: tsx scripts/generators/create-feature.ts journal
 */
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const featureName = process.argv[2];
if (!featureName) {
  console.error("Usage: tsx create-feature.ts <feature-name>");
  process.exit(1);
}

const featureDir = join("src", "features", featureName);
if (existsSync(featureDir)) {
  console.error(`Feature "${featureName}" already exists at ${featureDir}`);
  process.exit(1);
}

const Name = featureName.charAt(0).toUpperCase() + featureName.slice(1);

const files: Record<string, string> = {
  "types.ts": `// Domain types for ${featureName}\nexport interface ${Name} {\n  id: string\n  createdAt: Date\n  updatedAt: Date\n}\n`,
  "schema.ts": `import { z } from 'zod'\nexport const create${Name}Schema = z.object({\n  // Define fields\n})\nexport type Create${Name}Input = z.infer<typeof create${Name}Schema>\n`,
  "repository.ts": `import { SupabaseClient } from '@supabase/supabase-js'\nexport class ${Name}Repository {\n  constructor(private readonly supabase: SupabaseClient) {}\n  // Implement database methods\n}\n`,
  "service.ts": `import { ${Name}Repository } from './repository'\nexport class ${Name}Service {\n  constructor(private readonly repo: ${Name}Repository) {}\n  // Implement business logic\n}\n`,
  "actions.ts": `'use server'\n// Next.js Server Actions for ${featureName}\n`,
  "permissions.ts": `export const ${featureName.toUpperCase()}_PERMISSIONS = {\n  create: ['administrator', 'journal_manager'],\n  read: ['administrator', 'journal_manager', 'editor'],\n  update: ['administrator', 'journal_manager'],\n  delete: ['administrator'],\n} as const\n`,
  "constants.ts": `// Constants for ${featureName}\n`,
  "errors.ts": `export class ${Name}NotFoundError extends Error {\n  constructor(id: string) {\n    super(\`${Name} not found: \${id}\`)\n  }\n}\n`,
};

mkdirSync(featureDir, { recursive: true });
mkdirSync(join(featureDir, "components"), { recursive: true });
mkdirSync(join(featureDir, "tests"), { recursive: true });

for (const [filename, content] of Object.entries(files)) {
  writeFileSync(join(featureDir, filename), content);
}

console.log(`✅ Feature "${featureName}" scaffolded at ${featureDir}`);
console.log("📁 Files created:");
Object.keys(files).forEach((f) => console.log(`   - ${f}`));
console.log("   - components/ (empty)");
console.log("   - tests/ (empty)");
