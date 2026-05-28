# Esports Tournament Platform

![CI](https://github.com/nole78/odp_C2S_tim_01/actions/workflows/CI.yml/badge.svg)
[![Vercel](https://img.shields.io/badge/Vercel-Live-black?logo=vercel)](https://odp-c2-s-tim-01.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)

Full-stack web application for managing esports teams, tournaments, matches and player participation.

Built with React, TypeScript, Node.js, Express and MySQL using layered architecture, dependency injection and scalable deployment practices.

## Table of Contents

- [Live Demo](#live-demo)
- [System Overview](#system-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tournament Engine](#tournament-engine)
- [Core Domain Model](#core-domain-model)
- [Project Structure](#project-structure)
- [Custom Load Balancer](#custom-load-balancer)
- [Authentication & Security](#authentication--security)
- [Health Monitoring](#health-monitoring)
- [Load Balancing Strategies](#load-balancing-strategies)
- [CI / CD Pipeline](#ci--cd-pipeline)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Deployment Topology](#deployment-topology)
- [Getting Started](#getting-started)
- [Engineering Challenges](#engineering-challenges)
- [Team Development](#team-development)
- [Future Improvements](#future-improvements)

## Live Demo

### Frontend

https://odp-c2-s-tim-01.vercel.app

### Production API (via Load Balancer)

https://odp-c2s-tim-01-loadbalancer.onrender.com

### Individual Backend Instances

- Render Instance
  https://odp-c2s-tim-01.onrender.com

- Railway Instance
  https://odpc2stim01-production.up.railway.app

## System Overview

Esports Tournament Platform is built as a multi-layer distributed system:

- **Client Layer** → React-based SPA for users and admins
- **Load Balancer Layer** → Intelligent traffic distribution across backend instances
- **Backend Layer** → Node.js/Express API with layered architecture
- **Data Layer** → MySQL database with optional local replication support
- **Infrastructure Layer** → Docker + cloud deployment (Render, Aiven, Vercel)
> [!NOTE]
> Local development includes a MySQL master–slave replication setup for experimentation and learning purposes. Production deployment currently uses a single managed MySQL instance hosted on Aiven.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router

### Backend

- Node.js
- Express
- TypeScript
- JWT Authentication

### Database

- MySQL
- Aiven

### Infrastructure

- Render
- Railway
- Custom Load Balancer


## Features

- User registration and authentication
- Role-based authorization (Player / Admin)
- Team creation and management
- Tournament creation and administration
- Automated bracket generation
- Match scheduling and progression
- Lineup management
- Player performance tracking
- Invitation system
- Audit logging
- API and database health monitoring
- Distributed deployment with load balancing

## Screenshots

### Tournament Bracket

[screenshot]

### Match Management

[screenshot]

### Admin Dashboard

[screenshot]

### Team Management

[screenshot]

## Architecture

The backend follows a layered architecture:

```text
Repository Layer
↓
Service Layer
↓
Controller Layer
↓
REST API
```

Key design principles:

- Dependency Injection
- Result Pattern
- SOLID principles
- Separation of Concerns
- Repository Pattern

## Tournament Engine

The platform automatically generates tournament brackets and match relations.

Main responsibilities:

- Bracket generation
- Temporary node mapping
- Match persistence
- Parent-child match linking
- Automatic advancement of winners

```text
Tournament
    ↓
Bracket Generator
    ↓
Bracket Nodes
    ↓
Persist Matches
    ↓
Map Temp IDs
    ↓
Link Matches
    ↓
Ready Tournament Tree
```

## Core Domain Model

- Users
- Teams
- Tournaments
- Matches
- MatchPlayers
- Games
- Invitations
- AuditLogs


## Project Structure

```text
project/
├── client/        # React frontend (SPA)
├── server/        # Express backend (domain-driven structure)
├── loadbalancer/  # Custom Node.js load balancer
└── docker/        # MySQL master-slave replication setup
```

## Custom Load Balancer

A separate Node.js load balancer was developed and deployed.

Features:

- Weighted Round Robin algorithm
- Strategy Pattern based balancing algorithms
- Factory-based strategy resolution
- Background health checks
- Proxy routing
- Server pool management
- Dependency Injection support

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

## Configuration

The application uses environment variables for:

- database connectivity
- JWT secrets
- deployment settings
- load balancing configuration
- health monitoring configuration

## Deployment

Production deployment consists of:

- Render (Load Balancer)
- Render (Server Instance #1)
- Render (Server Instance #2)
- Railway (Server Instance #3)
- Aiven MySQL Database

Traffic distribution is handled using a Weighted Round Robin balancing strategy.

## Deployment Topology

```text
              Users
                ↓
      Load Balancer (Render)
                ↓
 ┌──────────────┬──────────────┬──────────────┐
 │ Server #1    │ Server #2    │ Server #3    │
 │ Render       │ Render       │ Railway      │
 └──────────────┴──────────────┴──────────────┘
                ↓
          Aiven MySQL
```

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

## Engineering Challenges

### Tournament Bracket Generation

Generating tournament brackets required mapping temporary bracket nodes to persisted database entities while maintaining match relationships.

### N+1 Query Reduction

Repository methods were extended to support bulk retrieval operations, reducing unnecessary database round trips.

### Distributed Deployment

The application was deployed across multiple cloud providers and routed through a custom load balancer with health monitoring.

## Team Development

This project was developed by a team of four students.

To ensure broad exposure to the full stack, all team members contributed across frontend and backend layers.

Key contributions included:

- tournament management
- match lifecycle management
- authentication and authorization
- administrative dashboard
- load balancing infrastructure
- deployment and cloud hosting

## Future Improvements

- Database transaction support through Unit of Work pattern
- Database provider abstraction
- Soft delete support
- Cloud object storage for images
- External game metadata integration
- Real-time or polling-based invitation updates
- Invite read/unread tracking
