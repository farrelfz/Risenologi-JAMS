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
