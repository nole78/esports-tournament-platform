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