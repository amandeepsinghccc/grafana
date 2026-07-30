# Grafana Kiosk Mode — Quick Reference & Forced Kiosk Plan

- **Technical Reference**: [`.agents/kiosk_mode_info.md`](file:///home/amandeep.singh/grafana/.agents/kiosk_mode_info.md)
- **Forced Kiosk Implementation Plan**: [`.agents/forced_kiosk_mode_plan.md`](file:///home/amandeep.singh/grafana/.agents/forced_kiosk_mode_plan.md)

## Key Highlights

- **Enum**: `KioskMode.Full` (`'full'`) in `public/app/types/dashboard.ts`.
- **Trigger via URL**: Append `?kiosk` or `?kiosk=1` or `?kiosk=full`.
- **Keyboard Shortcuts**:
  - `d k`: Toggle kiosk mode.
  - `ESC`: Exit kiosk mode.
- **Service**: Managed by `AppChromeService` (`public/app/core/components/AppChrome/AppChromeService.tsx`).
- **Forced Kiosk Policy**: Enforce `kioskMode = KioskMode.Full` for `Viewer` role users by overriding `exitKioskMode()`, `ESC` keybindings, and query string sanitization.
