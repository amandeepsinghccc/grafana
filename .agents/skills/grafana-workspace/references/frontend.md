# Frontend Architecture & Alerting Guidelines (`public/app/`)

## Architecture Overview

| Directory | Purpose |
| --- | --- |
| `public/app/core/` | Shared core services, components, and utilities. |
| `public/app/features/` | Feature implementations by domain (dashboards, alerting, explore, etc.). |
| `public/app/plugins/` | Built-in plugins (many managed as distinct Yarn workspaces). |
| `public/app/types/` | TypeScript type definitions. |
| `public/app/store/` | Redux store configuration. |

---

## Core Frontend Patterns

1. **State Management & Data Fetching**:
   - **RTK Query is preferred**: Use RTK Query slices in `api/` directories for data fetching rather than custom Redux thunks.
   - **Use `@grafana/api-clients`**: Always prefer auto-generated RTK Query clients over manually written endpoints. If the generated client is incomplete or missing types, patch it using `enhanceEndpoints` in `api/` with a `TODO` comment rather than creating a manual client.
   - **Legacy Redux**: Redux Toolkit slices (not classic Redux). Only modify legacy Redux state when maintaining existing features.

2. **UI Components & Styling**:
   - **Function Components & Hooks**: All React components should be function components using hooks.
   - **Emotion CSS-in-JS**: Use `useStyles2` hook for component styling.
   - **Layout Components**: Prefer layout components from `@grafana/ui` (`Box`, `Stack`) over generic custom styled `div` elements.
   - **Shared Alerting Components**: Always check `@grafana/alerting` package before creating new custom components or hooks for alerting.

3. **Forms**:
   - Use `react-hook-form` (v7) for form state management and validation.

4. **Testing Standards**:
   - Use React Testing Library and Jest.
   - **CRITICAL**: The default `yarn test` includes watch mode. Always use `--watchAll=false` or `yarn jest --no-watch` when executing tests programmatically.
   - Use MSW (Mock Service Worker) for API mocking in tests.
