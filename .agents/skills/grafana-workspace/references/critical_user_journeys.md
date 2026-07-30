# Critical User Journeys Guidelines (`public/app/core/journeys/`)

Critical User Journeys (CUJs) track multi-step user workflows end-to-end as OpenTelemetry traces and Faro measurements under the `cujTracking` feature toggle.

## Journey Scaffolding

To scaffold a new CUJ wiring file, test, smoke driver, and registry entry in one step:
```bash
yarn cuj:new <type> [--owner <squad>] [--description <desc>] [--timeout-ms <ms>] [--parent <parent_type>]
```

## Journey Architecture & Implementation Rules

1. **Framework Imports**: Import public types from `@grafana/runtime`:
   - `registerJourneyTriggers`: Registers start conditions (called at module import).
   - `onJourneyInstance`: Registers per-instance step and end handlers (called at module import).
   - `JourneyMeta`, `JourneyHandle`.
   - Never import directly from `JourneyTrackerImpl` or `JourneyRegistryImpl`.

2. **Interactions**:
   - Subscribe via `onInteraction(name, callback)`.
   - For new CUJ-only events that should not pollute product analytics, pass `{ silent: true }`:
     ```ts
     reportInteraction('grafana_<area>_<verb>', { ...attrs }, { silent: true });
     ```

3. **Cleanup & Memory Leaks**:
   - Always wrap `onInteraction` subscriptions inside `onJourneyInstance` using `collectUnsubs()` helper.
   - Do **NOT** store `StepHandle` in module scope. Keep step bookkeeping scoped to `onJourneyInstance` closures.

4. **Testing**:
   - Use `__test-utils__/journeyTestHarness.ts` to mock journey trackers in unit tests.
   - Run tests with: `yarn jest --no-watch <camelCase>.test.ts`.
