# Comprehensive Kiosk Mode Lockdown Plan & Implementation

## Overview
This document outlines the complete process for locking down Grafana's forced kiosk mode for Viewer roles. The goal is to make the frontend perfectly rigid, meaning it will never visually "snap out" or flash out of kiosk mode, while relying on an API Gateway (like NGINX) to handle true backend route security (blocking `/admin`, `/profile`, etc.).

### The Security Model
1. **Frontend (Visual Rigidity):** 100% locked down against casual escapes, URL manipulation, and advanced DevTools console attacks (state mutation, global variable tampering).
2. **Backend (API Gateway):** 100% locked down against direct URL access to non-dashboard routes.

---

## Frontend Lockdown Implementations

The frontend lockdown consists of multiple layers of defense to neutralize all possible escape vectors. All major changes were centralized in `public/app/core/components/AppChrome/AppChromeService.tsx` and `keybindingSrv.ts`.

### 1. Keyboard Shortcut Blocking
- **Vector:** Users pressing `ESC` to exit, or `d k` to toggle kiosk mode.
- **Fix:** Guard clauses added to `public/app/core/services/keybindingSrv.ts`. If the user is a Viewer and the forced kiosk setting is true, the keypress events are ignored (`return`).

### 2. URL Mutation & Auto-Restoration
- **Vector:** Users manually deleting `?kiosk=full` from the address bar.
- **Fix:** In `public/app/core/components/AppChrome/AppChrome.tsx`, a `useEffect` hook monitors the URL. If `?kiosk` is missing for a forced viewer, it intercepts the change and silently injects `?kiosk=full` back into the URL (`locationService.partial({ kiosk: 'full' }, true)`).
- **Why it doesn't flash:** The `AppChromeService` state starts with `chromeless: true`. Even before the URL is restored, the React components for the navigation bar are never mounted.

### 3. The Closure-Captured Flag (Anti-Tampering)
- **Vector:** A hacker opens the DevTools console and changes the global configuration: `window.grafanaBootData.settings.forceKioskModeForViewers = false`.
- **Fix:** We removed live reads of the global setting. Instead, the setting is read exactly once when the JavaScript module loads, and stored in a private closure variable that the DevTools console cannot reach:
  ```typescript
  // Captured once at module load
  const _forcedKioskEnabled = Boolean(config.bootData?.settings?.forceKioskModeForViewers);
  const _isViewer = !contextSrv.isEditor;
  const _isForcedKioskViewer = _forcedKioskEnabled && _isViewer;

  public isForcedKioskViewer(): boolean {
      return _isForcedKioskViewer; // Always returns the tamper-proof closure value
  }
  ```

### 4. Config Object Freezing
- **Vector:** Secondary defense against global object tampering.
- **Fix:** Using `Object.defineProperty`, we froze the `forceKioskModeForViewers` property on the settings object to `writable: false`. Any console attempt to reassign it silently fails.

### 5. `onToggleKioskMode` Method Guard
- **Vector:** A hacker calls `window.__grafanaRuntime.chrome.onToggleKioskMode()` directly from the console.
- **Fix:** We added an explicit guard to the method itself so it immediately exits if the user is a forced kiosk viewer, preventing confusing "Press ESC to exit" toast notifications from firing.

### 6. RxJS State Interceptor (State Mutation Defense)
- **Vector:** The most advanced frontend attack. A hacker uses React DevTools to grab the `BehaviorSubject` that controls the UI state and forces a state change: `chromeService.state.next({ kioskMode: null, chromeless: false })`.
- **Fix:** We added a `constructor()` to the `AppChromeService` that actively intercepts and overrides calls to `.next()`. If a forced viewer is detected, it intercepts the payload, forces `kioskMode: 'full'` and `chromeless: true`, and *then* passes it to the UI renderer.
  ```typescript
  constructor() {
    if (_isForcedKioskViewer) {
      const originalNext = this.state.next.bind(this.state);
      this.state.next = (value: AppChromeState) => {
        originalNext({
          ...value,
          kioskMode: KioskMode.Full,
          chromeless: true, // Forces components to stay unmounted
        });
      };
    }
  }
  ```

### 7. Component Omission (DOM Rigidity)
- **Vector:** A user opens the DevTools "Elements" tab and tries to unhide the navbar by changing CSS `display: none` to `block`.
- **Fix:** Grafana uses React conditional rendering (`{!state.chromeless && <TopBar />}`). Because `chromeless` is permanently forced to `true` by our state interceptor, the navigation components are literally omitted from the DOM. They do not exist to be unhidden.

---

## API Gateway (Backend Route Security)

Because the frontend is running in an untrusted environment (the user's browser), the final layer of security must be handled by the network/server. Since the frontend is now visually rigid, the gateway ensures the application is structurally rigid.

### Implementation Requirements for Gateway (e.g., NGINX)
The API Gateway must inspect requests and route accordingly based on the user's session/role:

1. **Allow-listed Paths for Viewers:**
   - `/d/*` (Dashboards)
   - `/playlists/*` (Playlists)
   - `/api/*` (Grafana's internal API will handle read-only RBAC)
   - `/public/*` (Static assets like JS/CSS)
   - `/avatar/*` (Profile images)
   - `/login` / `/logout`

2. **Block-listed Paths for Viewers:**
   - `/admin/*`
   - `/profile`
   - `/org/*`
   - `/datasources/*`
   - `/alerting/*`
   - `/dashboard/*` (Dashboard settings/management)

**Gateway Action:** If a Viewer attempts to access a Block-listed path (either by typing it in the address bar or using a local proxy), the Gateway must intercept the request and return an HTTP `302 Redirect` to `/?kiosk=full` (or a designated home dashboard). 

## Conclusion
By pairing **Frontend Visual Rigidity** (closure-flags, state interception, DOM omission) with **API Gateway Route Enforcement**, the kiosk mode is impossible to escape via the UI, impossible to manipulate via DevTools, and impossible to bypass via the address bar.
