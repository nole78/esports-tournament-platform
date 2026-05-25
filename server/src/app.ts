import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DateTimeConverter } from "./Services/datetime/DateTimeConverter";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository }   from "./Database/repositories/users/UserRepository";
import { GameRepository } from './Database/repositories/games/GameRepository';
import { TournamentRepositoryWrite } from "./Database/repositories/tournament/TournamentRepositoryWrite";
import { AuditRepository } from "./Database/repositories/audit/AuditRepository";
import { TournamentRegistrationRepositoryWrite } from './Database/repositories/tournament_registations/TournamentRegistrationRepositoryWrite';

import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
import { GameService } from './Services/games/GameService';
import { TournamentServiceWrite } from "./Services/tournaments/TournamentServiceWrite";
import { AuditService } from "./Services/audit/AuditService";
import { HealthService } from "./Services/health/HealthService";
import { TournamentRegistrationServiceWrite } from "./Services/tournamentRegistration/TournamentRegistrationServiceWrite";

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
import { GameController } from "./WebAPI/controllers/GameController";
import { TournamentController } from "./WebAPI/controllers/TournamentController";
import { TournamentRegistrationController } from "./WebAPI/controllers/TournamentRegistrationController";
import { HealthController } from "./WebAPI/controllers/HealthController";
import { AuditController } from "./WebAPI/controllers/AuditController";
import { TeamService } from './Services/teams/TeamService';
import { TeamController } from "./WebAPI/controllers/TeamController";
import { TournamentRegistrationRepositoryRead } from "./Database/repositories/tournament_registations/TournamentRegistrationRepositoryRead";
import { TournamentRegistrationServiceRead } from "./Services/tournamentRegistration/TournamentRegistrationServiceRead";
import { TournamentRepositoryRead } from "./Database/repositories/tournament/TournamentRepositoryRead";
import { TournamentServiceRead } from "./Services/tournaments/TournamentServiceRead";
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
import { match } from "node:assert";

export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Domain Services
const dateTimeConverter = new DateTimeConverter();

// Repositories
const userRepo   = new UserRepository(db, logger);
const gameRepo = new GameRepository(db, logger);
const tournamentRepoRead = new TournamentRepositoryRead(db, logger);
const tournamentRepoWrite = new TournamentRepositoryWrite(db, logger);
const auditRepo = new AuditRepository(db, logger);
const teamRepoRead = new TeamRepositoryRead(db, logger);
const teamRepoWrite = new TeamRepositoryWrite(db, logger);
const teamMemberRepoRead = new TeamMemberRepositoryRead(db, logger);
const teamMemberRepoWrite = new TeamMemberRepositoryWrite(db, logger);
const tournamentRegistrationRepoRead = new TournamentRegistrationRepositoryRead(db, logger);
const TournamentRegistrationRepoWrite = new TournamentRegistrationRepositoryWrite(db, logger);
const inviteRepoRead = new InvitesRepositoryRead(db, logger);
const inviteRepoWrite = new InvitesRepositoryWrite(db, logger);
const matchReadRepo = new MatchReadRepository(db, logger);
const matchWriteRepo = new MatchWriteRepository(db, logger);
const matchPlayerReadRepo = new MatchPlayerReadRepository(db, logger);
const matchPlayerWriteRepo = new MatchPlayerWriteRepository(db, logger);

// Services
const userService   = new UserService(userRepo);
const gameService   = new GameService(gameRepo);
const tournamentServiceRead = new TournamentServiceRead(tournamentRepoRead, gameRepo, logger);
const tournamentServiceWrite = new TournamentServiceWrite(tournamentRepoRead, tournamentRepoWrite, gameRepo, logger, dateTimeConverter);
const auditService = new AuditService(auditRepo, userRepo);
const authService   = new AuthService(userRepo,auditService);
const teamService = new TeamService(teamRepoWrite, teamRepoRead, teamMemberRepoWrite, teamMemberRepoRead, userRepo, inviteRepoWrite, inviteRepoRead);
const teamMemberService = new TeamMemberService(teamRepoRead, teamMemberRepoWrite, teamMemberRepoRead, userRepo, inviteRepoWrite, inviteRepoRead);
const healthService = new HealthService(gameRepo, tournamentRepoRead, userRepo, teamRepoRead, db);
const tournamentRegistrationServiceRead = new TournamentRegistrationServiceRead(tournamentRegistrationRepoRead, teamRepoRead, tournamentRepoRead, logger);
const tournamentRegistrationServiceWrite = new TournamentRegistrationServiceWrite(TournamentRegistrationRepoWrite, tournamentRegistrationRepoRead, teamRepoRead, teamMemberRepoRead, tournamentRepoRead, gameRepo, logger);
const matchService = new MatchService(matchReadRepo, matchWriteRepo, teamRepoRead, tournamentRepoRead, gameRepo);
const matchPlayerService = new MatchPlayerService(matchReadRepo, matchPlayerReadRepo, matchPlayerWriteRepo, userRepo, teamRepoRead, teamMemberRepoRead);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json({ limit: "10mb"}));

app.use("/api/v1", new AuthController(authService, userService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new GameController(gameService).getRouter());
app.use("/api/v1", new TournamentController(tournamentServiceRead, tournamentServiceWrite).getRouter());
app.use("/api/v1", new AuditController(auditService).getRouter());
app.use("/api/v1", new HealthController(healthService).getRouter());
app.use("/api/v1", new TeamController(teamService, teamMemberService).getRouter());
app.use("/api/v1", new HealthController(healthService).getRouter());
app.use("/api/v1", new TournamentRegistrationController(tournamentRegistrationServiceRead, tournamentRegistrationServiceWrite).getRouter());
app.use("/api/v1", new MatchController(matchService, matchPlayerService).getRouter());

export default app;
