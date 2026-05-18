# PulseGrid Esports Platform

![CI](https://github.com/nole78/odp_C2S_tim_01/actions/workflows/CI.yml/badge.svg)
[![Vercel](https://img.shields.io/badge/Vercel-Live-black?logo=vercel)](https://odp-c2-s-tim-01.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)

PulseGrid is a full-stack esports platform designed as a distributed, scalable web system with a focus on **high availability, modular architecture, and production-grade backend design patterns**.

It simulates a real-world cloud-native application with load balancing, database replication, authentication, and CI/CD integration.

---

## System Overview

PulseGrid is built as a multi-layer distributed system:

- **Client Layer** → React-based SPA for users and admins
- **Load Balancer Layer** → Intelligent traffic distribution across backend instances
- **Backend Layer** → Node.js/Express API with layered architecture
- **Data Layer** → MySQL with master–slave replication
- **Infrastructure Layer** → Docker + cloud deployment (Render, Aiven, Vercel)

---

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| Frontend     | React 19, Vite, TailwindCSS v4, React Router v7 |
| Backend      | Node.js, Express 5, TypeScript |
| Auth         | JWT (jsonwebtoken), bcryptjs |
| Database     | MySQL 8, mysql2, Master–Slave replication |
| Load Balancer| Node.js, http-proxy-middleware |
| DevOps       | Docker, docker-compose, GitHub Actions |
| Deployment   | Vercel (FE), Render (BE), Aiven (DB) |

---

## Key Features

- JWT authentication with role-based access control (RBAC)
- Distributed MySQL architecture (master + replica slaves)
- Custom Node.js load balancer with pluggable strategies
- Health-check driven service discovery
- Connection-aware routing (Least Connections)
- IP-based session affinity (IP Hash)
- CI pipeline with automated build validation
- Environment-based configuration (dev/prod separation)

---

## Architecture Design

PulseGrid follows a **clean layered architecture with separation of concerns across all services**.

### High-Level System Flow

```text
Client (React)
      ↓
Load Balancer (Node.js)
      ↓
Proxy Middleware
      ↓
Server Pool Service
      ↓
Selected Backend Instance
      ↓
MySQL (Master / Slaves)
```

---



## Project Structure

```text
project/
├── client/        # React frontend (SPA)
├── server/        # Express backend (domain-driven structure)
├── loadbalancer/  # Custom Node.js load balancer
└── docker/        # MySQL master-slave replication setup
```

### Backend Architecture (Server)

The backend follows a **domain-driven, layered architecture**:

- `Domain/` → Core business models, DTOs, contracts (framework-agnostic)
- `Services/` → Business logic implementations
- `Database/` → Repository pattern + DB abstraction layer
- `WebAPI/` → Controllers + routing layer
- `Middlewares/` → Auth, validation, authorization

This ensures high testability and loose coupling between layers.

---

### Load Balancer Architecture

The load balancer is a standalone service implementing:

- Strategy Pattern (pluggable algorithms)
- Dependency Injection (runtime algorithm selection)
- Proxy-based routing (`http-proxy-middleware`)
- Health-aware server pool management

#### Supported Algorithms

- Round Robin
- Least Connections
- IP Hash
- Weighted Round Robin

---

### Database Layer

PulseGrid uses a **master–slave MySQL replication model**:

- **Master** → Write operations
- **Slaves** → Read operations (scaling reads)

Features:

- Automatic failover detection
- Health-checked connection pools
- Transparent routing based on operation type

---

## Authentication & Security

- JWT-based stateless authentication
- Role-based access control (Admin/User separation)
- Password hashing using bcrypt
- Protected routes via middleware chain
- Token validation on every protected request

---

## Health Monitoring

Each backend instance exposes:

```text
GET /api/v1/health
```

The load balancer periodically:

- checks server availability
- marks unhealthy nodes as inactive
- removes them from routing pool
- reintegrates them when recovered

---

## Load Balancing Strategies

### Round Robin

Sequential distribution of requests across healthy nodes.

### Least Connections

Routes traffic to the least loaded server based on active connections.

### IP Hash

Ensures session consistency by mapping client IP → server instance.

### Weighted Round Robin

Assigns higher traffic share to more powerful servers.

---

## CI / CD Pipeline

GitHub Actions pipeline ensures:

- TypeScript compilation success
- Build verification
- Protection of main branch via required checks

---

## Environment Configuration

### Load Balancer

```env
LB_PORT=8080
LB_ALGORITHM=ROUND_ROBIN
HEALTH_CHECK_INTERVAL=10000
HEALTH_CHECK_TIMEOUT=3000
```

### Backend

- Environment-based config switching (dev / production)
- Separate DB credentials per environment
- Secure JWT secret management

---

## Deployment

### Production Architecture

- Frontend → Vercel
- Backend → Render
- Database → Aiven (managed MySQL)

This separation ensures scalability and reliability under free-tier constraints.

---

## Getting Started

### 1. Start MySQL cluster

```bash
docker-compose up -d
```

### 2. Initialize replication

```bash
docker cp docker/setup-replication.sh project_master:/setup.sh
docker exec project_master sh /setup.sh
```

### 3. Run backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 4. Run loadbalancer

```bash
cd loadbalancer
npm install
npm run dev
```

### 5. Run frontend

```bash
cd client
npm install
npm run dev
```

---

## Why This Architecture Matters

PulseGrid is designed to simulate real-world distributed systems concepts:

- horizontal scaling via load balancing
- fault tolerance via health checks
- read scalability via replication
- modular backend design
- production CI/CD workflow

It is not just a CRUD application — it demonstrates **system-level design thinking applied in a full-stack TypeScript ecosystem**.
