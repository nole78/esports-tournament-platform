# Repository Architecture & Coding Standards

## 1. Monorepo Overview & Architecture
This repository is an Esports Management System composed of three main services:
- `client/`: Next.js frontend application (React, Tailwind CSS).
- `server/`: Express.js backend API (TypeScript, Clean Architecture/Layered).
- `load-balancer/`: Node.js Custom Load Balancer for network traffic distribution.

### Cross-Service Rules
- Network calls from `client` MUST route through the configured `load-balancer` endpoint, never directly to raw backend instance ports.
- Shared domain logic or contracts must strictly follow the DTO schemas defined in `server/src/Domain/DTOs`.

## 2. Naming Conventions & Code Style
### Naming Standards

- **React Components & Custom Hooks Files:** `PascalCase.tsx` (e.g., `TournamentCard.tsx`, `useAuth.ts`).

- **Types, Interfaces, Enums, Classes:** `PascalCase` (e.g., UserDto, TournamentStatus).

- **Variables, Functions, Methods, Instances:** `camelCase` (e.g., `getUserById`, `isLoading`).

- **Utility & Backend Files/Modules:** `kebab-case` or `camelCase` depending on existing folder patterns (e.g., `auth-middleware.ts`, `trafficRouter.ts`).

- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`).

### TypeScript Strictly Enforced Rules

- **NO** `any` **TYPE**: Strict mode is enforced. Use precise interface/type definitions, `unknown` with narrowing, or generics.

- Always explicitly type function return values for public API endpoints and exported service methods.

## 3. Frontend Standards (`client/`)

- **Styling:** Use Tailwind CSS exclusively for layout, typography, and UI elements. Inline styles (`style={{...}}`) are strictly forbidden.

- **Design System:** Design tokens (colors, spacing, theme overrides) are strictly defined in `client/src/index.css` (or `tailwind.config.js`). Use custom utility classes or theme color variables defined there.

- **State & API Handling:** Keep UI logic separated from API communication layers. All fetch/axios mechanisms belong to `client/src/api_services.`

## 4. Backend Standards (`server/`)

- **Architecture is layer-segregated:**

  - **Controllers:** `server/src/WebApi/controllers/`

  - **DTOs & Domain:** `server/src/Domain/DTOs/`

- **Every route handler must return a unified JSON response envelope:**  
    `{ success: boolean, data?: T, error?: string }`

## 5. Code Navigation

Use LSP first for symbol lookups (definitions, references, implementations,
callers). Use text search (`rg`) only as a fallback.

### Operations
- `workspaceSymbol`: find where a symbol is declared when the file is unknown
- `documentSymbol`: list a file's symbols instead of reading the whole file
- `goToDefinition` / `goToImplementation` / `findReferences`
- `incomingCalls` / `outgoingCalls`: callers / callees of a function
- `hover`: type info without opening the file

### Positions
- 1-based: `line` > 0, `character` >= 1. Point at the FIRST character of the
  symbol name.
- Find the position with `documentSymbol` or `rg -n "<name>" <file>`. Do not
  read a whole file just to find a position.
- On an invalid-coordinates error, correct them and retry once.

### Cold start: the first LSP answer may be incomplete
The language server loads the TypeScript project lazily. The first query after
it starts can return only the declaration, or nothing. The same query a few
seconds later returns the full result.
- If a result is empty, contains only the declaration itself, or is smaller than
  expected, run `sleep 3` and repeat THE SAME query once before doing anything else.
- Trust the second result. Only if it is still empty or implausible, fall back to
  `rg` (filter by receiver type) and say in the answer that you did.

### Interfaces vs implementations
Services depend on interfaces (e.g. `IGameReadRepository`); the concrete class
(e.g. `GameReadRepository`) is injected at runtime. LSP is static, so:
- Callers of a repository method: run `findReferences` on the INTERFACE method.
  The result also contains the declaration and the implementing class's method;
  list those separately from call sites.
- `goToDefinition` on a call inside a service returns the interface method
  (expected). Use `goToImplementation` to reach the concrete class.
- If the task names a specific type, query that type's method. If it is
  ambiguous, check both and label which one each result belongs to.

### Text search (`rg`) is allowed when
- LSP is unavailable, or still fails after the retry described above,
- exact text is needed (strings, comments, config, non-code files).

### Reporting
- Report call sites as `file:line` and exclude same-named methods of other types.
- Verify each usage against the receiver's declared type or injected dependency.