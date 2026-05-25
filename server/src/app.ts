import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DateTimeConverter } from "./Services/datetime/DateTimeConverter";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository }   from "./Database/repositories/users/UserRepository";
import { EntityRepository } from "./Database/repositories/entity/EntityRepository";
import { GameRepository } from './Database/repositories/games/GameRepository';
import { TournamentWriteRepository } from "./Database/repositories/tournament/TournamentWriteRepository";
import { AuditRepository } from "./Database/repositories/audit/AuditRepository";
import { TournamentRegistrationRepositoryWrite } from './Database/repositories/tournament_registations/TournamentRegistrationWriteRepository';

import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
import { EntityService } from "./Services/entity/EntityService";
import { GameService } from './Services/games/GameService';
import { TournamentServiceWrite } from "./Services/tournaments/TournamentWriteService";
import { AuditService } from "./Services/audit/AuditService";
import { HealthService } from "./Services/health/HealthService";
import { TournamentRegistrationWriteService } from "./Services/tournamentRegistration/TournamentRegistrationWriteService";

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
import { EntityController } from "./WebAPI/controllers/EntityController";
import { GameController } from "./WebAPI/controllers/GameController";
import { TournamentController } from "./WebAPI/controllers/TournamentController";
import { TournamentRegistrationController } from "./WebAPI/controllers/TournamentRegistrationController";
import { HealthController } from "./WebAPI/controllers/HealthController";
import { AuditController } from "./WebAPI/controllers/AuditController";
import { TeamService } from './Services/teams/TeamService';
import { TeamRepository } from "./Database/repositories/teams/TeamRepository";
import { TeamMemberRepository } from "./Database/repositories/team_members/TeamMembersRepository";
import { TeamController } from "./WebAPI/controllers/TeamController";
import { TournamentRegistrationReadRepository } from "./Database/repositories/tournament_registations/TournamentRegistrationReadRepository";
import { TournamentRegistrationReadService } from "./Services/tournamentRegistration/TournamentRegistrationReadService";
import { TournamentReadRepository } from "./Database/repositories/tournament/TournamentReadRepository";
import { TournamentReadService } from "./Services/tournaments/TournamentReadService";
import { InviteRepository } from "./Database/repositories/invites/InviteRepository";
import { UserWatchlistRepository } from "./Database/repositories/user_watchlist/UserWatchlistRepository";
import { UserWatchlistService } from "./Services/user_watchlist/UserWatchlistService";
import { UserWatchlistController } from "./WebAPI/controllers/UserWatchlistController";

export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Domain Services
const dateTimeConverter = new DateTimeConverter();

// Repositories
const userRepo   = new UserRepository(db, logger);
const entityRepo = new EntityRepository(db, logger);
const gameRepo = new GameRepository(db, logger);
const tournamentReadRepo = new TournamentReadRepository(db, logger);
const tournamentWriteRepo = new TournamentWriteRepository(db, logger);
const auditRepo = new AuditRepository(db, logger);
const teamRepo = new TeamRepository(db, logger);
const teamMemberRepo = new TeamMemberRepository(db, logger);
const userWatchlistRepo = new UserWatchlistRepository(db, logger);
const tournamentRegistrationReadRepo = new TournamentRegistrationReadRepository(db, logger);
const TournamentRegistrationWriteRepo = new TournamentRegistrationRepositoryWrite(db, logger);
const inviteRepo = new InviteRepository(db, logger);

// Services
const userService   = new UserService(userRepo);
const entityService = new EntityService(entityRepo);
const gameService   = new GameService(gameRepo);
const tournamentReadService = new TournamentReadService(tournamentReadRepo, gameRepo, logger);
const tournamentWriteService = new TournamentServiceWrite(tournamentReadRepo, tournamentWriteRepo, gameRepo, logger, dateTimeConverter);
const auditService = new AuditService(auditRepo, userRepo);
const authService   = new AuthService(userRepo);
const teamService = new TeamService(teamRepo, teamMemberRepo, userRepo, logger, inviteRepo);
const healthService = new HealthService(gameRepo, tournamentReadRepo, userRepo, teamRepo, db);
const watchlistService = new UserWatchlistService(userWatchlistRepo, tournamentReadRepo, gameRepo);
const tournamentRegistrationReadService = new TournamentRegistrationReadService(tournamentRegistrationReadRepo, teamRepo, tournamentReadRepo, logger);
const tournamentRegistrationWriteService = new TournamentRegistrationWriteService(TournamentRegistrationWriteRepo, tournamentRegistrationReadRepo, teamRepo, teamMemberRepo, tournamentReadRepo, gameRepo, logger);
// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json({ limit: "10mb"}));

app.use("/api/v1", new AuthController(authService, userService, auditService).getRouter());
app.use("/api/v1", new UserController(userService, auditService).getRouter());
app.use("/api/v1", new EntityController(entityService).getRouter());
app.use("/api/v1", new GameController(gameService, auditService).getRouter());
app.use("/api/v1", new TournamentController(tournamentReadService, tournamentWriteService, watchlistService, auditService).getRouter());
app.use("/api/v1", new AuditController(auditService).getRouter());
app.use("/api/v1", new HealthController(healthService).getRouter());
app.use("/api/v1", new TeamController(teamService, logger, auditService).getRouter());
app.use("/api/v1", new UserWatchlistController(watchlistService).getRouter());
app.use("/api/v1", new TournamentRegistrationController(tournamentRegistrationReadService, tournamentRegistrationWriteService).getRouter());

export default app;
