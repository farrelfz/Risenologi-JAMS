.PHONY: help install dev build start lint typecheck format test test-e2e setup db-start db-stop db-reset db-status

# Default target
help: ## Display this help message
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup and dependencies
install: ## Install npm dependencies
	npm install

setup: install ## Initial repository bootstrap (install deps, setup env)
	@if [ ! -f .env.local ]; then cp .env.example .env.local; echo "Created .env.local from .env.example"; fi
	npm run prepare

# Next.js Application
dev: ## Start the Next.js development server
	npm run dev

build: ## Build the Next.js application
	npm run build

start: ## Start the built Next.js application
	npm run start

# Code Quality & Testing
lint: ## Run ESLint
	npm run lint

typecheck: ## Run TypeScript compiler checks
	npm run typecheck

format: ## Format code with Prettier
	npm run format

format-check: ## Check code formatting with Prettier
	npm run format:check

test: ## Run unit and integration tests with Vitest
	npm run test

test-e2e: ## Run end-to-end tests with Playwright
	npm run test:e2e

# Database & Supabase (Local Development)
db-start: ## Start local Supabase containers
	supabase start

db-stop: ## Stop local Supabase containers
	supabase stop

db-reset: ## Reset the local Supabase database and apply seeds
	supabase db reset

db-status: ## Show local Supabase status
	supabase status
