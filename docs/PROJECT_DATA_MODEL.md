# Project data model v2

> [CX] Updated: 2026-08-13

## Purpose

Project context links tools to one local engagement. Version 2 adds a structured evidence register so reports and workflow decisions can distinguish facts, assumptions, and items still requiring verification.

## Storage

- Current key: `modiqi_project_context_v2`
- Legacy key: `modiqi_project_context_v1`
- Schema: `data/project-schema.json`
- Browser implementation: `shared/js/project-store.js`
- Storage remains local to the browser origin; there is no server synchronization.

On first read, the store migrates a valid v1 object to v2. It does not delete v1 automatically, which preserves a rollback source during this development cycle.

## Project fields

A project includes identity, name, owner, brand, objective, constraints, stage, target date, timestamps, and an evidence array. Project name is required when saving.

## Evidence fields

Each record includes:

- `statement`: the claim being used;
- `kind`: `fact`, `assumption`, or `to_verify`;
- `source`: a source reference or an explicit explanation such as “team assumption, no source yet”;
- `status`: `draft`, `needs_review`, `confirmed`, or `rejected`;
- `owner` and `reviewDate`;
- `toolPath` for future tool-level provenance;
- stable identity and timestamps.

Records without a statement or source are rejected by the browser store. The central project page currently creates and removes records. Tool-level evidence panels and report consumption remain scheduled work; the schema supports them but their absence must not be presented as completed functionality.

## Validation

```bash
npm run check:project-schema
npx playwright test tests/runtime-smoke.spec.js --grep 'project context|legacy project'
```

The static check validates the schema contract, migration implementation signals, and script inclusion. The browser tests verify v1-to-v2 migration, project persistence, workflow consumption, and evidence provenance persistence.
