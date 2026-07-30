# Backend Architecture & Guidelines (`pkg/`)

## Architecture Overview

| Directory | Purpose |
| --- | --- |
| `pkg/api/` | HTTP API handlers and routes. **Keep business logic out of API handlers.** |
| `pkg/services/` | Business logic organized by domain (alerting, dashboards, auth, org, etc.). Services implement interfaces defined within their package. |
| `pkg/server/` | Server initialization and Wire Dependency Injection (`wire.go`). |
| `pkg/tsdb/` | Time series database query backends (Loki, Prometheus, InfluxDB, etc.). |
| `pkg/plugins/` | Plugin system and gRPC loader. |
| `pkg/infra/` | Logging, metrics, database access via `sqlstore`. |
| `pkg/middleware/` | HTTP middleware components. |
| `pkg/setting/` | Global configuration management. |

---

## Important Patterns & Rules

1. **Wire Dependency Injection**:
   - Backend service initialization is wired statically using Google Wire.
   - When modifying service initialization or adding new dependencies, you **MUST** run `make gen-go` to regenerate `wire_gen.go`.
   - Wire catches circular dependencies at compile time.

2. **CUE Schemas & Code Generation**:
   - Dashboard and panel schemas located in `kinds/` generate both Go and TypeScript code.
   - Run `make gen-cue` after updating schema definitions in `kinds/`.

3. **Feature Toggles**:
   - Defined in `pkg/services/featuremgmt/`.
   - Auto-generate code by running `make gen-feature-toggles` after modifying feature flags.

4. **Database Migrations**:
   - Migrations live in `pkg/services/sqlstore/migrations/`.
   - Test migrations using:
     ```bash
     make devenv sources=postgres_tests,mysql_tests
     make test-go-integration-postgres
     ```

5. **Go Workspaces**:
   - Monorepo Go modules are declared in `go.work`.
   - Run `make update-workspace` when adding new Go modules.

6. **Build Tags**:
   - `oss` (default), `enterprise`, `pro`. Ensure enterprise features check build tags appropriately.
