---
name: client-api-integration
description: Create or update client-side API integrations from this repository's server controllers and DTOs. Use this skill whenever the user asks to add, wire, update, consume, debug, or synchronize a frontend API endpoint with a backend route, controller, or DTO, even when they do not explicitly name this skill. It discovers the exact route contract, reuses equivalent client types and API helpers, creates missing types under client/src/types, never reimplements backend logic in the frontend, enforces the unified response envelope, and validates the result with the repository's ESLint/type-check command.
compatibility: Requires repository access, TypeScript, the client package manager, and the existing client lint/build tooling.
---

# Client API integration workflow

Use this skill for client-side integrations in the esports platform monorepo. The goal is contract fidelity: the client should call the backend behavior that already exists, represent its DTOs accurately, and avoid parallel implementations or duplicate types.

## Scope and repository map

Treat these paths as the primary sources of truth:

- Backend DTOs: `server/src/Domain/DTOs/`
- Backend controllers/routes: `server/src/WebAPI/controllers/` (use the actual casing on disk; the repository documentation may show `WebApi`)
- Client API services and interfaces: `client/src/api_services/`
- Canonical new client contract types: `client/src/types/`
- Existing client models and types to search before adding anything: `client/src/models/` and `client/src/types/`
- Repository rules: `.github/copilot-instructions.md`

Read the relevant controller and DTO files before editing. Also inspect the corresponding client API service/interface, nearby services, `client/package.json`, and the TypeScript configuration.

## Non-negotiable architecture rules

1. **Call backend behavior; do not recreate it.** Do not add frontend filtering, authorization, persistence, validation, aggregation, pagination, or business rules that the server already implements. The frontend integration should construct the request, call the route, type the response, and expose the result.
2. **Use the load balancer.** All client network calls must use the configured load-balancer base URL/helper. Never call raw backend instance ports directly. Reuse the existing request helper, axios configuration, auth-header helper, environment variable, and error handling pattern when present.
3. **Honor the backend envelope.** Route handlers use `{ success: boolean, data?: T, error?: string }`. Inspect the actual repository response fields because older client code may use `message`; do not silently rename or discard server error information. Define or reuse a typed envelope and surface unsuccessful responses explicitly.
4. **Keep layers separate.** Fetch/axios code belongs in `client/src/api_services`. UI components must not contain endpoint calls. Public exported service methods and endpoint functions need explicit, precise return types.
5. **No `any`.** Use DTO-derived interfaces/types, generics, `unknown` with narrowing, and existing domain types. Do not hide mismatches with `as any` or broad casts.
6. **Avoid unrelated edits.** Keep changes focused on the requested integration and tightly coupled contract/type corrections only.

## Step 1: Discover and resolve the contract

1. Identify the requested resource and operation.
2. Search controllers for the route, HTTP method, path parameters, query parameters, body shape, authentication requirements, and response envelope.
3. Trace controller/service code only far enough to determine the response DTO and whether it is a single object, array, void result, paginated object, enum, nullable value, or nested structure.
4. Locate every referenced backend DTO, enum, and nested DTO. Record property names, primitive types, optionality, nullability, arrays, defaults, and date/identifier representation.
5. Search both `client/src/types` and `client/src/models` for equivalent types by name and structure. Do not create a type solely because a filename differs.
6. If no exact route exists, the DTO is missing, or multiple routes are plausible, report the evidence and ask the user before editing. Do not invent an endpoint.

When a client type exists:

- Reuse it if its semantics and structure match the DTO.
- If it is equivalent but stored outside `client/src/types`, preserve existing imports unless moving it is necessary; do not create a duplicate in `client/src/types`.
- If it is close but incorrect, make the smallest compatible correction and explain any affected consumers.

When a client type is missing:

- Create it under `client/src/types`, following the nearest directory and naming convention.
- Mirror DTO shape rather than backend class syntax.
- Translate C#- or server-specific types deliberately: nullable fields become `T | null` when the API can return null; optional properties remain optional only when omission is possible; dates use the repository's established representation; enums reuse an existing client enum or create a matching one.
- For generic/paginated DTOs, preserve the generic relationship and all pagination fields instead of reducing it to an untyped object.

## Step 2: Implement the integration

Follow the closest existing API service pattern:

1. Update or create the API service interface with explicit parameter and return types.
2. Update or create the implementation in the matching `client/src/api_services/<resource>/` directory.
3. Use the exact HTTP method and route, safely encode path/query values, and send the DTO-shaped body.
4. Reuse authentication and request configuration helpers. Do not duplicate a second HTTP client abstraction.
5. Type the full response envelope at the transport boundary. On success, return the typed `data` payload if that is the service's established contract; keep envelope parsing internal. On failure, preserve the server's error and use the repository's explicit error/result convention.
6. Do not add frontend functions that duplicate backend behavior. If the requested behavior is absent on the server, stop and report the missing route rather than implementing it locally.
7. Keep imports type-only where appropriate and ensure exported methods have explicit return types.

If existing services return the full envelope, preserve that established public contract unless the user explicitly asks for an API-wide change. Do not mix unwrapped and enveloped return conventions within one service without a strong repository precedent.

## Step 3: Validate

Run both client validation commands after every integration change:

```bash
cd client && npm run lint
cd client && npm run build
```

`npm run lint` is the required ESLint check. `npm run build` runs the TypeScript compiler and catches type errors that ESLint may not report. Run focused tests if the repository has relevant tests.

Do not claim success if validation fails. Fix errors caused by the change, distinguish pre-existing failures, and report any remaining failure with the command and relevant output.

## Completion response

Always respond with these headings:

### Summary
State what integration was created or updated and which backend route/DTO it follows.

### Files changed
List each changed file with its role. Mention reused types and explicitly state when no new type was needed.

### API contract
Include HTTP method/path, parameters/body, response payload type, and envelope/error behavior. Note any ambiguity that was resolved.

### Validation
Report the exact commands run, their results, and any focused tests. Never say “passed” when a command failed or was skipped.

### Notes
Call out compatibility decisions, tightly scoped server changes, pre-existing issues, or follow-up work. If nothing needs noting, say so.
