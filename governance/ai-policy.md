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
