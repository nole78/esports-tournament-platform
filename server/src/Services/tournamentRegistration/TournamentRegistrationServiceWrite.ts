import { ITournamentRegistrationServiceWrite } from "../../Domain/services/tournamentRegistration/ITournamentRegistrationServiceWrite";
import { ITournamentRegistrationRepositoryWrite } from "../../Domain/repositories/tournament_registrations/ITournamentRegistrationRepositoryWrite";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { TournamentRegistrationDto } from "../../Domain/DTOs/tournament_registrations/TournamentRegistrationDto";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { CreateTournamentRegistrationDto } from "../../Domain/DTOs/tournament_registrations/CreateTournamentRegistrationDto";
import { TournamentRegistration } from "../../Domain/models/TournamentRegistration";
import { TournamentRegistrationStatus } from "../../Domain/enums/TournamentRegistrationStatus";
import { Result } from '../../Domain/common/Result';
import { ErrorType } from "../../Domain/common/ErrorType";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITeamMemberRepository } from "../../Domain/repositories/team_members/ITeamMemberRepository";
import { TeamMemberDto } from "../../Domain/DTOs/team_members/TeamMemberDto";
import { ITournamentRegistrationRepositoryRead } from '../../Domain/repositories/tournament_registrations/ITournamentRegistrationRepositoryRead';
import { ITournamentRepositoryRead } from "../../Domain/repositories/tournaments/ITournamentRepositoryRead";

export class TournamentRegistrationServiceWrite implements ITournamentRegistrationServiceWrite{
    public constructor(
        private readonly tournamentRegistrationRepoWrite: ITournamentRegistrationRepositoryWrite,
        private readonly tournamentRegistrationRepoRead: ITournamentRegistrationRepositoryRead,
        private readonly teamRepo: ITeamRepository,
        private readonly teamMemberRepo: ITeamMemberRepository,
        private readonly tournamentRepoRead : ITournamentRepositoryRead,
        private readonly gameRepo: IGameRepository,
        private readonly logger: ILoggerService,
    ){}

    async create(tr: CreateTournamentRegistrationDto): Promise<Result<TournamentRegistrationDto>>{
        const team = await this.teamRepo.findById(tr.teamId);
        if (team.teamId === 0) {
            this.logger.error("TournamentRegistrationService", "create failed", `Team with teamId "${tr.teamId}" not found`);
            return Result.Failure("Could not find team with id "+tr.teamId, ErrorType.NotFound);
        }
        const tournament = await this.tournamentRepoRead.findById(tr.tournamentId);
        if (!tournament) {
            this.logger.error("TournamentRegistrationService", "create failed", `Tournament with tournamentId "${tr.tournamentId}" not found`);
            return Result.Failure("Could not find tournament with id " + tr.tournamentId, ErrorType.NotFound);
        }

        const tournamentReg = await this.tournamentRegistrationRepoRead.findByTournamentAndTeamId(tr.tournamentId, tr.teamId);
        if(tournamentReg.tournamentId !== 0 && tournamentReg.teamId !== 0)
        {
            this.logger.error("TournamentRegistrationService", "create failed", `Tournament registration already exists!`);
            return Result.Failure("Team is already registered into this tournament!", ErrorType.Conflict);
        }

        const game = await this.gameRepo.findById(tournament.tournamentGameId);
        const team_members:TeamMemberDto[] = await this.teamMemberRepo.findByTeamId(team.teamId);
        if(team_members.length < game.gamePlayers)
            return Result.Failure("Not enough players in team " + team.teamName, ErrorType.Validation);

        if(tournament.tournamentApplicationDeadline <= new Date())
            return Result.Failure("Tournament application deadline has passed!", ErrorType.Validation);

        const newTournamentRegistration = new TournamentRegistration(
            tr.teamId,
            tr.tournamentId,
            0,
            TournamentRegistrationStatus.PENDING,
            new Date()
        )

        const created = await this.tournamentRegistrationRepoWrite.create(newTournamentRegistration);
        const returnTr = new TournamentRegistrationDto(team.teamId, team.teamName, team.teamTag, team.teamLogotip, tournament.tournamentId, tournament.tournamentName, created.seed, created.status)
        return created.tournamentId !== 0 ? Result.Success(returnTr) : Result.Failure("Could not create new tournament registration!", ErrorType.Internal);
    } 

    async update(tournamentId: number, teamId: number, fields: Partial<TournamentRegistrationDto>): Promise<Result<void>>{
        const tournament = await this.tournamentRepoRead.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure("Could not find tournament with id " + tournamentId, ErrorType.NotFound);

        const team = await this.teamRepo.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure("Could not find team with id "+teamId, ErrorType.NotFound);

        const tournamentReg = await this.tournamentRegistrationRepoRead.findByTournamentAndTeamId(tournamentId, teamId);
        if(tournamentReg.tournamentId === 0 && tournamentReg.teamId === 0)
        {
            this.logger.error("TournamentRegistrationService", "update failed", `Tournament registration does not exists!`);
            return Result.Failure("Tournament registration with touranment id " + tournamentId + " and team id " + teamId + " does not exist!", ErrorType.NotFound);
        }

        if(fields.status === TournamentRegistrationStatus.CONFIRMED)
        {
            const numOfConfirmedTeams = await this.tournamentRegistrationRepoRead.findTotalByTournamentId(tournamentId, TournamentRegistrationStatus.CONFIRMED)
            if(numOfConfirmedTeams >= tournament.tournamentMaxTeams)
            {
                this.logger.error("TournamentRegistrationService", "update failed", `Cannot add another team!`);
                return Result.Failure("Cannot add another team. Tournament already has max number of teams!", ErrorType.Validation);
            }
        }

        const res = await this.tournamentRegistrationRepoWrite.update(tournamentId, teamId, fields);
        return res? Result.Success(): Result.Failure("Could not update tournament registration", ErrorType.Internal);
    }

    async delete(tournamentId: number, teamId: number): Promise<Result<void>>{
        const tournament = await this.tournamentRepoRead.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure("Could not find tournament with id " + tournamentId, ErrorType.NotFound);

        const team = await this.teamRepo.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure("Could not find team with id "+teamId, ErrorType.NotFound);

        const tournamentReg = await this.tournamentRegistrationRepoRead.findByTournamentAndTeamId(tournamentId, teamId);
        if(tournamentReg.tournamentId === 0 && tournamentReg.teamId === 0)
        {
            this.logger.error("TournamentRegistrationService", "delete failed", `Tournament registration does not exist!`);
            return Result.Failure("Tournament registration with touranment id " + tournamentId + " and team id " + teamId + " does not exist!", ErrorType.NotFound);
        }

        const res = await this.tournamentRegistrationRepoWrite.delete(tournamentId, teamId);
        return res? Result.Success(): Result.Failure("Could not delete tournament registration!", ErrorType.Internal);
    }
}