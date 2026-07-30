---
name: grafana-workspace
description: Essential project details, context, architecture, commands, and workflows for the Grafana repository. Mandatory reference for all agent tasks on this codebase.
---

# Grafana Workspace Skill

This skill provides comprehensive instructions, context, coding standards, architecture layout, build/test commands, and rules for working in the Grafana codebase.

> [!IMPORTANT]
> **MANDATORY DIRECTIVE FOR ALL AGENTS**:
> Every time you start working on this project or begin a task in this workspace, you **MUST** consult this skill (`.agents/skills/grafana-workspace/SKILL.md`) and its associated reference files in `references/` to gain full project context before executing code or making changes.

---

## 1. Project Overview

Grafana is an open-source monitoring, visualization, and observability platform. 
- **Repository Structure**: Monorepo with Yarn workspaces (frontend) and Go workspaces (`go.work` for backend).
- **Backend Stack**: Go, Wire DI, SQLStore (SQLite default for local dev, MySQL/Postgres supported).
- **Frontend Stack**: TypeScript, React (function components + hooks), Redux Toolkit & RTK Query, Emotion CSS-in-JS (`useStyles2`), React Testing Library, Playwright.

---

## 2. Core Principles & Human Review Gates

1. **Follow Existing Patterns**: Always inspect existing code in surrounding files before writing new code.
2. **Write Tests**: Every new feature or bug fix must include corresponding Go or TypeScript unit/integration tests.
3. **Keep Changes Focused**: Avoid over-engineering, unnecessary refactoring, or sweeping unrelated changes.
4. **Separate PRs**: Frontend and backend changes deploy at different cadences; keep them in separate PRs unless explicitly coordinated.
5. **Security First**: Prevent XSS, SQL injection, command injection, and improper input sanitization.
6. **Code Comments**: Only comment **why** non-obvious decisions were made. Never include links (Slack, GitHub, Jira) in code comments.
7. **Human Review Gate**: Before running `git push`, stop and present a summary of changes to the human user for explicit approval.

---

## 3. Environment & Tooling Setup

- **Node.js**: Pinned in `.nvmrc`. Note: Login shells (`bash -lc`) pick up the pinned Node via `~/.bashrc`. Always run `yarn` / `yarn start` / tests via login shells.
- **Go**: Pinned in `go.mod`, installed at `/usr/local/go`.
- **Yarn**: Corepack managed (`packageManager` in `package.json`). Dependencies use `enableScripts: false`.
- **Backend DB**: Embedded SQLite by default (no external databases needed for local dev).

---

## 4. Key Commands Reference

### Build & Run
```bash
make run                          # Backend with hot reload (localhost:3000, admin/admin)
make build-backend                # Backend only
yarn start                        # Frontend dev server (watches for changes)
yarn build                        # Frontend production build
yarn workspace @grafana-plugins/<name> dev # Build specific plugin workspace
```

### Testing
```bash
# Backend
go test -run TestName ./pkg/services/myservice/   # Specific test
make test-go-unit                                  # All unit tests
make test-go-integration                           # Integration tests

# Frontend (CRITICAL: Always use --watchAll=false or --no-watch to prevent hanging)
yarn test path/to/file                             # Specific file
yarn test -t "pattern"                             # By name pattern
yarn test -u                                       # Update snapshots

# E2E
yarn e2e:playwright path/to/test.spec.ts           # Specific E2E test
```

### Code Generation & Maintenance
```bash
make gen-go                       # Regenerate Wire DI (after modifying service init)
make gen-cue                      # Regenerate CUE schemas (after updating kinds/)
make gen-apps                     # Regenerate Grafana App SDK apps
make swagger-gen                  # Update OpenAPI/Swagger specs
make gen-feature-toggles          # Update feature flags (pkg/services/featuremgmt/)
make i18n-extract                 # Extract internationalization strings
make update-workspace             # Update Go workspace (after adding Go modules)
```

### Linting & Formatting
```bash
make lint-go                      # Go linter
yarn lint                         # ESLint
yarn lint:fix                     # ESLint auto-fix
yarn prettier:write               # Prettier auto-format
yarn typecheck                    # TypeScript check
```

---

## 5. Domain Subdoc References

For specialized work areas, read the detailed reference documentation in this skill folder:

- **Backend Architecture & DI**: [references/backend.md](references/backend.md)
- **Frontend Architecture & Alerting**: [references/frontend.md](references/frontend.md)
- **Documentation Style Guide**: [references/docs_style_guide.md](references/docs_style_guide.md)
- **Unified Storage & Compatibility**: [references/unified_storage.md](references/unified_storage.md)
- **Critical User Journeys (CUJ)**: [references/critical_user_journeys.md](references/critical_user_journeys.md)
