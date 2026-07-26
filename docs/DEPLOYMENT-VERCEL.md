# Vercel Deployment

## Purpose
Document the deployment foundation for running Risenologi JAMS on Vercel.

## Scope
Covers repository configuration for preview and production deployment separation. This document does not deploy the application, create domains, configure DNS, or provision external services.

## Status
Approved foundation.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [Target Platform](#target-platform)
- [Preview Deployments](#preview-deployments)
- [Production Deployments](#production-deployments)
- [Environment Separation](#environment-separation)
- [Validation](#validation)
- [TODO](#todo)

## Target Platform
Vercel is the target deployment platform for the Next.js application.

## Preview Deployments
Preview deployments are expected to run for pull requests and non-production branches after the Vercel project is connected. Preview deployments must use preview-scoped environment variables.

## Production Deployments
Production deployments are expected to run only from the approved production branch after release review. Production deployments must use production-scoped environment variables.

## Environment Separation
Environment variables are referenced through Vercel-managed values. Local `.env.local`, preview, and production values must remain separate.

## Validation
The repository build command is `npm run build`. Deployment must fail if install, lint, typecheck, test, or build checks fail in the release process.

## TODO
- Add Vercel project ownership after deployment access is assigned.
- Document production branch policy after release governance is finalized.
