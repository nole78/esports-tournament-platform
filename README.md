# PulseGrid Esports platform

![CI](https://github.com/nole78/odp_C2S_tim_01/actions/workflows/CI.yml/badge.svg)
[![Vercel](https://img.shields.io/badge/Vercel-Live-black?logo=vercel)](https://odp-c2-s-tim-01.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)

Full-stack TypeScript project with:
- **Client**: React 19 + Vite + TailwindCSS v4 + React Router v7
- **Server**: Node.js + Express 5 + TypeScript
- **Database**: MySQL 8 with Master + 2 Slave replication via Docker
- **Auth**: JWT-based authentication with role-based access control

## Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React, Vite, TailwindCSS, Axios         |
| Backend    | Node.js, Express, TypeScript            |
| Auth       | JWT (jsonwebtoken), bcryptjs            |
| Database   | MySQL 8, mysql2, Master-Slave replication |
| DevOps     | Docker, docker-compose                  |

## Features

- JWT authentication
- Role-based authorization
- MySQL replication
- Health-checked DB pooling
- CI pipeline with GitHub Actions
- Protected main branch workflow
- Environment-based configuration

## Project Structure

```
project/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── api_services/    # Axios API service classes (Interface + Implementation)
│       ├── assets/          # Assets (images)
│       ├── components/      # Reusable UI components
│       ├── contexts/        # React contexts (AuthContext)
│       ├── helpers/         # Utility functions (localStorage wrapper)
│       ├── hooks/           # Custom React hooks
│       ├── models/          # Client-side DTOs / types
│       ├── pages/           # Page components (admin/, user/, auth/, not_found/)
│       └── types/           # TypeScript type definitions
│
├── loadbalancer/            # Node.js load balancer service
│   └── src/
│       ├── algorithms/      # Load balancing strategy implementations
│       ├── config/          # Load balancer configuration and server definitions
│       ├── domain/          # Core domain abstractions and shared types
│       │   ├── enums/       # Domain enums (LoadBalancingAlgorithm)
│       │   ├── interfaces/  # Contracts/interfaces (ILoggerService, ILoadBalancingStrategy)
│       │   └── models/      # Domain models (ServerInstance)
│       ├── factories/       # Factory functions for dependency creation/composition
│       ├── middleware/      # Express proxy middleware
│       └── services/        # Core services (health checks, server pool, logging)
│
├── server/                  # Express backend
│   └── src/
│       ├── Database/
│       │   ├── connection/  # DbManager — Master/Slave pool with health checks
│       │   └── repositories/ # Concrete repository implementations
│       ├── Domain/          # Domain layer (no framework dependencies)
│       │   ├── DTOs/        # Data Transfer Objects
│       │   ├── constants/   # App-wide constants
│       │   ├── enums/       # TypeScript enums
│       │   ├── models/      # Domain entity classes
│       │   ├── repositories/ # Repository interfaces (IXxxRepository)
│       │   ├── services/    # Service interfaces (IXxxService)
│       │   └── types/       # Shared types (JwtPayload, ValidationResult)
│       ├── Middlewares/     # Express middlewares (auth, authorization)
│       ├── Services/        # Service implementations
│       └── WebAPI/
│           ├── controllers/ # Express route controllers
│           └── validators/  # Input validation functions
│
└── docker/                  # MySQL replication setup
    ├── master/              # Master node config + init.sql
    ├── slave1/              # Slave 1 config
    ├── slave2/              # Slave 2 config
    └── setup-replication.sh # Replication bootstrap script
```

## Live Demo / Deployment

The project is fully deployed and available online:

- **Frontend (Vercel):** https://odp-c2-s-tim-01.vercel.app

### Production Infrastructure

- Frontend hosted on Vercel
- Backend API hosted on Render
- MySQL database hosted on Aiven

### Notes

- Local development uses Dockerized MySQL master/slave replication.
- Production deployment uses a managed cloud MySQL instance due to free-tier limitations.
- Environment-based configuration is used to separate development and production infrastructure.

## Getting Started

### 1. Start the database

```bash
docker-compose up -d
```

### 2. Set up replication

```bash
docker cp docker/setup-replication.sh project_master:/setup.sh
docker exec project_master sh /setup.sh
```

### 3. Start the server

```bash
cd server
cp .env.example .env   # fill in your values
npm install
npm run dev
```

### 4. Start the client

```bash
cd client
npm install
npm run dev
```

## Load Balancer

The project includes a dedicated Node.js-based load balancer service built with Express and `http-proxy-middleware`.

Its purpose is to distribute incoming traffic across multiple backend instances while continuously monitoring server availability.

---

### Features

* Reverse proxy support using Express middleware
* Multiple load balancing strategies
* Periodic health checks for backend servers
* Automatic failover for unavailable instances
* Least Connections support with active connection tracking
* Configurable through environment variables
* Strategy Pattern + Dependency Injection architecture
* Reusable proxy instances through proxy caching

---

### Supported Algorithms

#### Round Robin

Distributes requests sequentially across all healthy servers.

Example:

```text
Request 1 -> Server A
Request 2 -> Server B
Request 3 -> Server C
Request 4 -> Server A
```

---

#### Least Connections

Routes requests to the server currently handling the fewest active connections.

Useful for uneven workloads and long-running requests.

---

#### IP Hash

Routes clients based on their IP address to improve session consistency.

---

#### Weighted Round Robin

Allows stronger servers to receive a larger percentage of traffic.

---

### Health Checks

The load balancer continuously checks backend server health using a configurable interval.

Each server exposes:

```text
GET /api/v1/health
```

If a server becomes unreachable or times out:

* it is marked as unavailable
* it is automatically removed from request routing
* warning logs are emitted

Once the server becomes healthy again, it automatically re-enters the pool.

---

### Architecture

The load balancer follows a lightweight layered architecture:

* `algorithms/` contains balancing strategy implementations
* `services/` contains operational services such as health checks and server pooling
* `middleware/` contains proxy middleware integration
* `factories/` is responsible for dependency composition
* `domain/` contains shared abstractions, models, and enums

The balancing algorithm is injected into `ServerPoolService` through dependency injection using the Strategy Pattern.

This makes it easy to add new balancing algorithms without modifying existing services.

---

### Request Flow

```text
Client
   ↓
Load Balancer
   ↓
Proxy Middleware
   ↓
ServerPoolService
   ↓
Selected Healthy Backend Server
```

---

### Connection Tracking

For the Least Connections algorithm, the load balancer tracks active requests per server.

Connections are:

* incremented before proxy forwarding
* decremented on request completion/termination

This ensures accurate balancing decisions during runtime.

---

### Environment Configuration

Example `.env`:

```env
LB_PORT=8080
LB_ALGORITHM=ROUND_ROBIN
HEALTH_CHECK_INTERVAL=10000
HEALTH_CHECK_TIMEOUT=3000
```

---
