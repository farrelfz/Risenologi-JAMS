# Environment Management

## Purpose
Document required environment variables and environment separation for local, preview, and production execution.

## Scope
Covers repository-level environment variable expectations. This document does not configure Supabase projects, authentication providers, storage, DNS, or deployment execution.

## Status
Approved foundation.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [Required Variables](#required-variables)
- [Local](#local)
- [Preview](#preview)
- [Production](#production)
- [Validation](#validation)
- [Security](#security)
- [TODO](#todo)

## Required Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase project URL used by browser and server clients.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Supabase anonymous key used by browser and server clients.

## Local
Create `.env.local` from `.env.example` and populate local development values. Local-only files must remain uncommitted.

## Preview
Configure preview variables in Vercel for the preview environment. Preview must use non-production Supabase resources when those resources are provisioned.

## Production
Configure production variables in Vercel for the production environment. Production secrets must be restricted to production deployments.

## Validation
The repository reads required public Supabase variables through a central environment module and throws a descriptive error when a required value is missing.

## Security
- Do not commit real secrets or generated credentials.
- Do not expose service-role keys to browser-accessible code.
- Keep environment values separated by deployment target.

## TODO
- Add project-specific environment owner and rotation process after infrastructure ownership is finalized.
