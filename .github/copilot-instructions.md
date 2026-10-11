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

Whenever you need to find a symbol, definition, reference, implementation, or usage:

1. Inspect the target file first and identify the exact 1-based line and character
   position of the symbol.
2. Use LSP as the first search mechanism:
   - `goToDefinition` for definitions
   - `findReferences` for usages
   - `goToImplementation` for implementations
   - `workspaceSymbol` for workspace-wide symbol lookup
3. LSP positions are 1-based:
   - `line` must be greater than 0
   - `character` must be at least 1
4. If an LSP request fails because of invalid coordinates, correct the coordinates
   and retry once before using another search tool.
5. Use `rg` or other text search only as a fallback when:
   - LSP cannot resolve the symbol,
   - the language server is unavailable, or
   - exact textual occurrences are required.
6. When reporting references, distinguish the target symbol from same-named
   methods belonging to other types or repositories.
7. Verify the final result against the symbol's declared type, interface, or
   injected dependency.

## 6. File Path Verification

Before opening a file by a guessed path:

1. Verify the path using repository search or directory listing.
2. Do not infer nested folder names from filenames alone.
3. If a path lookup fails, search for the filename before trying a corrected path.
4. Preserve the repository's actual casing and directory structure.