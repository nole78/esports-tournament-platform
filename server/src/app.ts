import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DateTimeConverter } from "./Services/datetime/DateTimeConverter";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository }   from "./Database/repositories/users/UserRepository";
import { EntityRepository } from "./Database/repositories/entity/EntityRepository";
import { GameRepository } from './Database/repositories/games/GameRepository';
import { TournamentRepository } from "./Database/repositories/tournament/TournamentRepository";
import { AuditRepository } from "./Database/repositories/audit/AuditRepository";
import { TournamentRegistrationRepository } from "./Database/repositories/tournament_registations/TournamentRegistrationRepository";

import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
import { EntityService } from "./Services/entity/EntityService";
import { GameService } from './Services/games/GameService';
import { TournamentService } from "./Services/tournaments/TournamentService";
import { AuditService } from "./Services/audit/AuditService";
import { TournamentRegistrationService } from "./Services/tournamentRegistration/TournamentRegistrationService";

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
import { EntityController } from "./WebAPI/controllers/EntityController";
import { GameController } from "./WebAPI/controllers/GameController";
import { TournamentController } from "./WebAPI/controllers/TournamentController";
import { TournamentRegistrationController } from "./WebAPI/controllers/TournamentRegistrationController";


import { AuditController } from "./WebAPI/controllers/AuditController";
import { TeamService } from './Services/teams/TeamService';
import { TeamRepository } from "./Database/repositories/teams/TeamRepository";
import { TeamMemberRepository } from "./Database/repositories/team_members/TeamMembersRepository";
import { TeamController } from "./WebAPI/controllers/TeamController";

export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Domain Services
const dateTimeConverter = new DateTimeConverter();

// Repositories
const userRepo   = new UserRepository(db, logger);
const entityRepo = new EntityRepository(db, logger);
const gameRepo = new GameRepository(db, logger);
const tournamentRepo = new TournamentRepository(db, logger);
const auditRepo = new AuditRepository(db, logger);
const teamRepo = new TeamRepository(db, logger);
const teamMemberRepo = new TeamMemberRepository(db, logger);
const tournamentRegistrationRepo = new TournamentRegistrationRepository(db, logger);

// Services
const userService   = new UserService(userRepo);
const entityService = new EntityService(entityRepo);
const gameService   = new GameService(gameRepo);
const tournamentService = new TournamentService(tournamentRepo, gameRepo, logger, dateTimeConverter);
const auditService = new AuditService(auditRepo, userRepo);
const authService   = new AuthService(userRepo,auditService);
const teamService = new TeamService(teamRepo, teamMemberRepo, userRepo, logger);
const tournamentRegistrationService = new TournamentRegistrationService(tournamentRegistrationRepo, teamRepo, tournamentRepo, logger);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json({ limit: "10mb"}));

app.use("/api/v1", new AuthController(authService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new EntityController(entityService).getRouter());
app.use("/api/v1", new GameController(gameService).getRouter());
app.use("/api/v1", new TournamentController(tournamentService).getRouter());
app.use("/api/v1", new AuditController(auditService).getRouter());
app.use("/api/v1", new TeamController(teamService).getRouter());
app.use("/api/v1", new TournamentRegistrationController(tournamentRegistrationService).getRouter());

export default app;
