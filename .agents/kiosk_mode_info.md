# Grafana Kiosk Mode — Technical Reference & Architecture

## Overview

**Kiosk Mode** in Grafana is a presentation view designed for wall-mounted TV monitors, status displays, and distraction-free dashboard viewing. When enabled, it suppresses top navigation bars, side menus, breadcrumbs, search bars, and UI chrome elements.

---

## 1. Core Data Structures & Enum

- **Type Definition**: Defined in [`public/app/types/dashboard.ts`](file:///home/amandeep.singh/grafana/public/app/types/dashboard.ts#L127-L129).
  ```typescript
  export enum KioskMode {
    Full = 'full',
  }
  ```

---

## 2. State Management & URL Synchronization

Kiosk mode is managed centrally by **`AppChromeService`** ([`public/app/core/components/AppChrome/AppChromeService.tsx`](file:///home/amandeep.singh/grafana/public/app/core/components/AppChrome/AppChromeService.tsx)):

- **Chromeless Evaluation**:
  ```typescript
  newState.chromeless = newState.kioskMode === KioskMode.Full || this.currentRoute?.chromeless;
  ```
  Setting `chromeless = true` tells `AppChrome` ([`AppChrome.tsx`](file:///home/amandeep.singh/grafana/public/app/core/components/AppChrome/AppChrome.tsx)) to hide top navigation bars and side menus.

- **URL Query Parameters**:
  - `?kiosk`, `?kiosk=1`, or `?kiosk=full`: Enables full kiosk mode.
  - `setKioskModeFromUrl(kiosk: UrlQueryValue)`: Invoked at app boot in [`public/app/app.ts`](file:///home/amandeep.singh/grafana/public/app/app.ts) and on location change in [`AppChrome.tsx`](file:///home/amandeep.singh/grafana/public/app/core/components/AppChrome/AppChrome.tsx).
  - `exitKioskMode()`: Removes `kiosk` parameter from the URL using `locationService.partial({ kiosk: null })`.

---

## 3. Keyboard Shortcuts & User Controls

- **Toggle Shortcut (`d k`)**:
  Registered in [`public/app/core/services/keybindingSrv.ts`](file:///home/amandeep.singh/grafana/public/app/core/services/keybindingSrv.ts#L401):
  ```typescript
  this.bind('d k', () => {
    this.chromeService.onToggleKioskMode();
  });
  ```
- **Exit Shortcut (`ESC`)**:
  When pressing `ESC`, `keybindingSrv.ts` checks if `kioskMode` is active and triggers `exitKioskMode()`.
- **UI Profile Menu**:
  Located in `ProfileButton` ([`public/app/core/components/AppChrome/TopBar/ProfileButton.tsx`](file:///home/amandeep.singh/grafana/public/app/core/components/AppChrome/TopBar/ProfileButton.tsx#L38)) under "Enable kiosk mode".

---

## 4. UI & Notification Behavior

- **Notification Suppression**:
  In kiosk mode, transient error banners/notifications are hidden on dashboard pages to prevent visual clutter ([`AppNotificationList.test.tsx`](file:///home/amandeep.singh/grafana/public/app/core/components/AppNotifications/AppNotificationList.test.tsx)).
- **User Alert On Enter**:
  When entering kiosk mode, an info alert notifies the user: *"Press ESC to exit kiosk mode"*.
- **Telemetry**:
  Interactions are tracked via `reportInteraction('grafana_kiosk_mode', { action: 'toggle' | 'exit', mode })`.

---

## 5. Backend Support & URL Helpers

- **Organization Redirection**:
  [`pkg/middleware/org_redirect.go`](file:///home/amandeep.singh/grafana/pkg/middleware/org_redirect.go#L58) preserves `&kiosk` and `?kiosk` query flags during organization switches.
- **Backend URL Generator**:
  [`pkg/services/dashboards/models.go`](file:///home/amandeep.singh/grafana/pkg/services/dashboards/models.go#L236):
  ```go
  func GetKioskModeDashboardURL(uid string, slug string, theme models.Theme) string {
      return fmt.Sprintf("%s?kiosk&theme=%s", GetDashboardURL(uid, slug), string(theme))
  }
  ```

---

## 📁 Connected Files Reference

| File | Purpose |
| --- | --- |
| [`public/app/types/dashboard.ts`](file:///home/amandeep.singh/grafana/public/app/types/dashboard.ts) | `KioskMode` enum definition. |
| [`public/app/core/components/AppChrome/AppChromeService.tsx`](file:///home/amandeep.singh/grafana/public/app/core/components/AppChrome/AppChromeService.tsx) | Kiosk mode state logic, URL sync (`setKioskModeFromUrl`), enter/exit handlers. |
| [`public/app/core/components/AppChrome/AppChrome.tsx`](file:///home/amandeep.singh/grafana/public/app/core/components/AppChrome/AppChrome.tsx) | Chrome UI layout engine; hides top navigation bar when `chromeless` is true. |
| [`public/app/core/services/keybindingSrv.ts`](file:///home/amandeep.singh/grafana/public/app/core/services/keybindingSrv.ts) | `d k` toggle shortcut & `ESC` exit shortcut handlers. |
| [`public/app/app.ts`](file:///home/amandeep.singh/grafana/public/app/app.ts) | Reads initial `kiosk` query parameter on application startup. |
| [`pkg/middleware/org_redirect.go`](file:///home/amandeep.singh/grafana/pkg/middleware/org_redirect.go) | Preserves `kiosk` query parameters across backend org redirects. |
| [`pkg/services/dashboards/models.go`](file:///home/amandeep.singh/grafana/pkg/services/dashboards/models.go) | Go backend helper for constructing kiosk dashboard URLs. |
