import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DateTimeConverter } from "./Services/datetime/DateTimeConverter";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserReadRepository } from "./Database/repositories/users/UserReadRepository";
import { UserWriteRepository } from "./Database/repositories/users/UserWriteRepository";
import { TournamentWriteRepository } from "./Database/repositories/tournament/TournamentWriteRepository";
import { GameReadRepository } from "./Database/repositories/games/GameReadRepository";
import { GameWriteRepository } from "./Database/repositories/games/GameWriteRepository";
import { AuditRepository } from "./Database/repositories/audit/AuditRepository";
import { TournamentRegistrationRepositoryWrite } from './Database/repositories/tournament_registations/TournamentRegistrationWriteRepository';

import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
import { GameService } from './Services/games/GameService';
import { TournamentWriteService } from "./Services/tournaments/TournamentWriteService";
import { AuditService } from "./Services/audit/AuditService";
import { HealthService } from "./Services/health/HealthService";
import { TournamentRegistrationWriteService } from "./Services/tournamentRegistration/TournamentRegistrationWriteService";

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
import { GameController } from "./WebAPI/controllers/GameController";
import { TournamentController } from "./WebAPI/controllers/TournamentController";
import { TournamentRegistrationController } from "./WebAPI/controllers/TournamentRegistrationController";
import { HealthController } from "./WebAPI/controllers/HealthController";
import { AuditController } from "./WebAPI/controllers/AuditController";
import { TeamService } from './Services/teams/TeamService';
import { TeamController } from "./WebAPI/controllers/TeamController";
import { TournamentRegistrationReadRepository } from "./Database/repositories/tournament_registations/TournamentRegistrationReadRepository";
import { TournamentRegistrationReadService } from "./Services/tournamentRegistration/TournamentRegistrationReadService";
import { TournamentReadRepository } from "./Database/repositories/tournament/TournamentReadRepository";
import { TournamentReadService } from "./Services/tournaments/TournamentReadService";
import { TeamRepositoryRead } from "./Database/repositories/teams/TeamRepositoryRead";
import { TeamRepositoryWrite } from "./Database/repositories/teams/TeamRepositoryWrite";
import { TeamMemberService } from "./Services/teamMember/TeamMemberService";
import { TeamMemberRepositoryRead } from "./Database/repositories/team_members/TeamMemberRepositoryRead";
import { TeamMemberRepositoryWrite } from "./Database/repositories/team_members/TeamMemberRepositoryWrite";
import { InvitesRepositoryRead } from "./Database/repositories/invites/InvitesRepositoryRead";
import { InvitesRepositoryWrite } from "./Database/repositories/invites/InvitesRepositoryWrite";
import { MatchService } from './Services/matches/MatchService';
import { MatchPlayerService } from "./Services/match_players/MatchPlayerService";
import { MatchController } from "./WebAPI/controllers/MatchController";
import { MatchReadRepository } from "./Database/repositories/matches/MatchReadRepository";
import { MatchWriteRepository } from "./Database/repositories/matches/MatchWriteRepository";
import { MatchPlayerReadRepository } from "./Database/repositories/match_players/MatchPlayerReadRepository";
import { MatchPlayerWriteRepository } from "./Database/repositories/match_players/MatchPlayerWriteRepository";
import { UserWatchlistReadRepository } from "./Database/repositories/user_watchlist/UserWatchlistReadRepository";
import { UserWatchlistWriteRepository } from './Database/repositories/user_watchlist/UserWatchlistWriteRepository';
import { UserWatchlistService } from "./Services/user_watchlist/UserWatchlistService";
import { UserWatchlistController } from "./WebAPI/controllers/UserWatchlistController";
import { BracketAdvancementService } from "./Services/bracket/BracketAdvancmentService";
import { BracketGeneratorService } from "./Services/bracket/BracketGeneratorService";

export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Domain Services
const dateTimeConverter = new DateTimeConverter();

// Repositories
const userReadRepo = new UserReadRepository(db, logger);
const userWriteRepo = new UserWriteRepository(db, logger);
const gameReadRepo = new GameReadRepository(db, logger);
const gameWriteRepo = new GameWriteRepository(db, logger);
const tournamentReadRepo = new TournamentReadRepository(db, logger);
const tournamentWriteRepo = new TournamentWriteRepository(db, logger);
const auditRepo = new AuditRepository(db, logger);
const teamRepoRead = new TeamRepositoryRead(db, logger);
const teamRepoWrite = new TeamRepositoryWrite(db, logger);
const teamMemberRepoRead = new TeamMemberRepositoryRead(db, logger);
const teamMemberRepoWrite = new TeamMemberRepositoryWrite(db, logger);
const tournamentRegistrationReadRepo = new TournamentRegistrationReadRepository(db, logger);
const tournamentRegistrationWriteRepo = new TournamentRegistrationRepositoryWrite(db, logger);
const inviteRepoRead = new InvitesRepositoryRead(db, logger);
const inviteRepoWrite = new InvitesRepositoryWrite(db, logger);
const matchReadRepo = new MatchReadRepository(db, logger);
const matchWriteRepo = new MatchWriteRepository(db, logger);
const matchPlayerReadRepo = new MatchPlayerReadRepository(db, logger);
const matchPlayerWriteRepo = new MatchPlayerWriteRepository(db, logger);
const userWatchlistReadRepo = new UserWatchlistReadRepository(db, logger);
const userWatchlistWriteRepo = new UserWatchlistWriteRepository(db, logger);

// Services
const userService   = new UserService(userReadRepo, userWriteRepo);
const gameService   = new GameService(gameReadRepo, gameWriteRepo);
const tournamentReadService = new TournamentReadService(tournamentReadRepo, gameReadRepo, logger);
const tournamentWriteService = new TournamentWriteService(tournamentReadRepo, tournamentWriteRepo, gameReadRepo, logger, dateTimeConverter);
const auditService = new AuditService(auditRepo, userReadRepo);
const authService   = new AuthService(userReadRepo, userWriteRepo);
const teamService = new TeamService(teamRepoWrite, teamRepoRead, teamMemberRepoWrite, teamMemberRepoRead, userReadRepo, inviteRepoWrite, inviteRepoRead);
const teamMemberService = new TeamMemberService(teamRepoRead, teamMemberRepoWrite, teamMemberRepoRead, userReadRepo, inviteRepoWrite, inviteRepoRead);
const healthService = new HealthService(gameReadRepo, tournamentReadRepo, userReadRepo, teamRepoRead, db);
const watchlistService = new UserWatchlistService(userWatchlistReadRepo, userWatchlistWriteRepo, tournamentReadRepo, gameReadRepo);
const tournamentRegistrationReadService = new TournamentRegistrationReadService(tournamentRegistrationReadRepo, teamRepoRead, tournamentReadRepo, logger);
const bracketGeneratorService = new BracketGeneratorService();
const tournamentRegistrationWriteService = new TournamentRegistrationWriteService(tournamentRegistrationWriteRepo, tournamentRegistrationReadRepo, teamRepoRead, teamMemberRepoRead, tournamentReadRepo, tournamentWriteRepo, gameReadRepo, logger, bracketGeneratorService, matchWriteRepo);
const bracketAdvancementService = new BracketAdvancementService(matchReadRepo,matchWriteRepo);
const matchService = new MatchService(matchReadRepo, matchWriteRepo, teamRepoRead, tournamentReadRepo, gameReadRepo,bracketAdvancementService);
const matchPlayerService = new MatchPlayerService(matchReadRepo, matchPlayerReadRepo, matchPlayerWriteRepo, userReadRepo, teamRepoRead, teamMemberRepoRead);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json({ limit: "10mb"}));

app.use("/api/v1", new AuthController(authService, userService, auditService).getRouter());
app.use("/api/v1", new UserController(userService, auditService).getRouter());
app.use("/api/v1", new GameController(gameService, auditService).getRouter());
app.use("/api/v1", new TournamentController(tournamentReadService, tournamentWriteService, watchlistService, auditService).getRouter());
app.use("/api/v1", new AuditController(auditService).getRouter());
app.use("/api/v1", new HealthController(healthService).getRouter());
app.use("/api/v1", new TeamController(teamService, teamMemberService, auditService).getRouter());
app.use("/api/v1", new UserWatchlistController(watchlistService).getRouter());
app.use("/api/v1", new TournamentRegistrationController(tournamentRegistrationReadService, tournamentRegistrationWriteService).getRouter());
app.use("/api/v1", new MatchController(matchService, matchPlayerService).getRouter());
app.use("/api/v1", new MatchController(matchService, matchPlayerService).getRouter());

export default app;
