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
