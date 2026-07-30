# Documentation Style Guide (`docs/`)

This reference summarizes documentation guidelines for authoring or editing content in `docs/`.

## Naming Conventions & Terminology

- **First Mention vs Short Name**:
  - Grafana Alloy (full) -> Alloy (short)
  - Grafana Beyla (full) -> Beyla (short)
  - OpenTelemetry Collector (full) -> Collector (short)
- **Always Full Name**: "Grafana Cloud"
- **Complete Terms**: Use "OpenTelemetry" (not "OTel"), "Kubernetes" (not "K8s").
- **Signal Order**: Always list observability signals in this order: **metrics, logs, traces, profiles**.
- **Inclusive Language**:
  - `allowlist` / `blocklist` (not whitelist/blacklist)
  - `primary` / `secondary` (not master/slave)
  - "refer to" (not "see" or "check out")

## Writing Style & Voice

- **Audience**: Software developers and engineers. Focus on practical solutions.
- **Voice**: Active voice, address the user as "you" (second person).
- **Tense**: Present simple tense (avoid present continuous).
- **Words**: Simple, direct copy. Use contractions (*it's*, *you're*, *don't*). Use *use* (not *utilize*), *help* (not *assist*).

## Markdown Structure & Formatting

- **Front Matter & H1**: The YAML `title` in front matter must exactly match the main H1 (`#`) heading.
- **Copy between Headings**: Always include introductory text immediately after a heading before inserting a sub-heading.
- **Structure**: Introduction -> Goal -> Prerequisites -> Content Sections -> Next Steps & Resources.
- **UI Elements**: Sentence case, bolded: Click **Submit**.
- **Hugo Shortcodes**: Retain Hugo shortcodes when editing. Use admonitions sparingly:
  ```markdown
  {{< admonition type="note" >}}
  Note content here...
  {{< /admonition >}}
  ```
