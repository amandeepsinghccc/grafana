# Implementation Plan: Forced Irreversible Kiosk Mode for Viewers

## Executive Summary

This plan outlines the architecture, configuration, frontend/backend changes, and security hardening required to **force users with the `Viewer` role into Kiosk Mode** in Grafana, ensuring they **cannot exit ("snap out of") kiosk mode** under any circumstances.

---

## 🎯 Architectural Goals

1. **Role-Based Enforcement**: Automatically force users with `OrgRole.Viewer` (or unauthenticated anonymous viewers) into `KioskMode.Full`.
2. **Irreversible Frontend State**: Disable all exit mechanisms (keyboard shortcuts like `ESC`, `d k`, UI toggles, and URL parameter removal).
3. **Configurable Policy**: Controlled via Grafana configuration (`conf/defaults.ini`) and passed via `bootData` to frontend runtime.
4. **Backend Guardrails**: Automatically append `?kiosk` in backend HTTP responses for Viewers.

---

## 🛠️ Step-by-Step Implementation Plan

### Phase 1: Configuration & BootData Setup (Backend)

#### 1.1 Add Configuration Setting in `conf/defaults.ini` & `pkg/setting/`
Add a new setting under the `[users]` section in `conf/defaults.ini`:
```ini
[users]
# Enable forced kiosk mode for Viewer role users
force_kiosk_mode_for_viewers = true
```

In `pkg/setting/setting.go`:
```go
type Settings struct {
    ...
    ForceKioskModeForViewers bool
}
```

#### 1.2 Expose Setting in BootData (`pkg/api/index.go` & `pkg/api/dtos/index.go`)
Pass `ForceKioskModeForViewers` into `bootData.settings` sent to the frontend during page render:
```go
IndexViewData{
    ...
    ForceKioskModeForViewers: hs.Cfg.ForceKioskModeForViewers,
}
```

---

### Phase 2: Frontend Kiosk State Hardening (`public/app/`)

#### 2.1 Update `AppChromeService.tsx` ([`public/app/core/components/AppChrome/AppChromeService.tsx`](file:///home/amandeep.singh/grafana/public/app/core/components/AppChrome/AppChromeService.tsx))
Modify `AppChromeService` to check if forced kiosk mode applies to the current user:

```typescript
private isForcedKioskViewer(): boolean {
  const isViewer = !contextSrv.isEditor; // Viewer role or non-editor
  const isEnabled = config.bootData.settings.forceKioskModeForViewers;
  return isViewer && isEnabled;
}
```

Update state computation:
- **`update()`**: If `isForcedKioskViewer()` returns `true`, force `kioskMode = KioskMode.Full` and `chromeless = true` regardless of input.
- **`exitKioskMode()`**:
  ```typescript
  public exitKioskMode() {
    if (this.isForcedKioskViewer()) {
      // No-op for forced Viewers; exit is blocked
      return;
    }
    this.update({ kioskMode: undefined });
    locationService.partial({ kiosk: null });
  }
  ```
- **`setKioskModeFromUrl()`**:
  ```typescript
  public setKioskModeFromUrl(kiosk: UrlQueryValue) {
    if (this.isForcedKioskViewer()) {
      this.update({ kioskMode: KioskMode.Full });
      return;
    }
    ...
  }
  ```

#### 2.2 Disable Exit Shortcuts in `keybindingSrv.ts` ([`public/app/core/services/keybindingSrv.ts`](file:///home/amandeep.singh/grafana/public/app/core/services/keybindingSrv.ts))
In `handleEsc()` and `d k` bindings:
```typescript
const { kioskMode } = this.chromeService.state.getValue();
if (kioskMode) {
  if (this.chromeService.isForcedKioskViewer()) {
    // Prevent ESC from exiting kiosk mode for Viewers
    return;
  }
  this.chromeService.exitKioskMode();
}
```

#### 2.3 URL Restoration in `AppChrome.tsx` ([`public/app/core/components/AppChrome/AppChrome.tsx`](file:///home/amandeep.singh/grafana/public/app/core/components/AppChrome/AppChrome.tsx))
Ensure that if a Viewer manually edits the URL address bar to delete `?kiosk`, `AppChrome` detects missing `kiosk` parameter and automatically reinstates `kiosk=full`:
```typescript
useEffect(() => {
  if (chrome.isForcedKioskViewer()) {
    const queryParams = locationSearchToObject(search);
    if (!queryParams.kiosk) {
      locationService.partial({ kiosk: 'full' }, true);
    }
  }
}, [search]);
```

---

### Phase 3: UI & Profile Controls Hardening

#### 3.1 Profile Button & Navigation Controls ([`ProfileButton.tsx`](file:///home/amandeep.singh/grafana/public/app/core/components/AppChrome/TopBar/ProfileButton.tsx))
- Hide "Enable kiosk mode" / "Exit kiosk mode" toggle buttons for Viewers when forced kiosk mode is enabled.
- Ensure top bar, side menu, and breadcrumbs are strictly unrendered when `chromeless` is active.

#### 3.2 Suppress Navigation Triggers
- Block command palette (`Cmd+K` / `Ctrl+K`) opening for forced Viewers if it allows navigating to non-dashboard pages.

---

### Phase 4: Backend Middleware & Query Protection

#### 4.1 Middleware Redirection ([`pkg/middleware/org_redirect.go`](file:///home/amandeep.singh/grafana/pkg/middleware/org_redirect.go))
Automatically append `kiosk=full` to query string when serving dashboard HTML to Viewer roles:
```go
if c.OrgRole == models.ROLE_VIEWER && cfg.ForceKioskModeForViewers {
    if !urlParams.Has("kiosk") {
        urlParams.Set("kiosk", "full")
    }
}
```

---

## 🧪 Verification & Testing Plan

1. **Unit Tests**:
   - Test `AppChromeService`: Verify `exitKioskMode()` does nothing when `isForcedKioskViewer()` is true.
   - Test `keybindingSrv`: Verify `ESC` and `d k` do not toggle off kiosk mode for Viewers.
2. **Integration Tests**:
   - Log in as a user with `Viewer` role. Verify dashboard loads in Kiosk mode.
   - Attempt pressing `ESC` or typing `d k` -> Verify screen remains in Kiosk mode.
   - Manually remove `?kiosk` from URL -> Verify `?kiosk=full` is immediately appended back.
3. **Admin Verification**:
   - Log in as `Admin` or `Editor` -> Verify kiosk mode works normally (optional, toggleable via `d k` or `ESC`).

---

## 📄 File Modification Checklist

| Layer | File Path | Modification Summary |
| --- | --- | --- |
| **Config** | `conf/defaults.ini` | Add `force_kiosk_mode_for_viewers = true`. |
| **Backend** | `pkg/setting/setting.go` | Parse `force_kiosk_mode_for_viewers` setting. |
| **Backend** | `pkg/api/index.go` | Pass `forceKioskModeForViewers` in bootData settings. |
| **Backend** | `pkg/middleware/org_redirect.go` | Force `?kiosk=full` on HTTP responses for Viewers. |
| **Frontend**| `public/app/types/config.ts` | Add `forceKioskModeForViewers` to `Settings` interface. |
| **Frontend**| `public/app/core/components/AppChrome/AppChromeService.tsx` | Add `isForcedKioskViewer()`, block `exitKioskMode()`. |
| **Frontend**| `public/app/core/components/AppChrome/AppChrome.tsx` | Reinforce URL query string & chromeless state. |
| **Frontend**| `public/app/core/services/keybindingSrv.ts` | Prevent `ESC` and `d k` exit for Viewers. |
