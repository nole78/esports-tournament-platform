import { ITournamentRegistrationService } from "../../Domain/services/tournamentRegistration/ITournamentRegistrationService";
import { ITournamentRegistrationRepository } from "../../Domain/repositories/tournament_registrations/ITournamentRegistrationRepository";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { TournamentRegistrationDto } from "../../Domain/DTOs/tournament_registrations/TournamentRegistrationDto";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { Team } from "../../Domain/models/Team";
import { CreateTournamentRegistrationDto } from "../../Domain/DTOs/tournament_registrations/CreateTournamentRegistrationDto";
import { TournamentRegistration } from "../../Domain/models/TournamentRegistration";
import { Tournament } from "../../Domain/models/Tournament";
import { TournamentRegistrationStatus } from "../../Domain/enums/TournamentRegistrationStatus";
import { Result } from '../../Domain/common/Result';
import { ErrorType } from "../../Domain/common/ErrorType";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITeamMemberRepository } from "../../Domain/repositories/team_members/ITeamMemberRepository";
import { TeamMemberDto } from "../../Domain/DTOs/team_members/TeamMemberDto";

export class TournamentRegistrationService implements ITournamentRegistrationService{
    public constructor(
        private readonly tournamentRegistrationRepo: ITournamentRegistrationRepository,
        private readonly teamRepo: ITeamRepository,
        private readonly teamMemberRepo: ITeamMemberRepository,
        private readonly tournamentRepo : ITournamentRepository,
        private readonly gameRepo: IGameRepository,
        private readonly logger: ILoggerService,
    ){}

    async getByTeamId(teamId: number, page?:number, limit?:number): Promise<Result<PaginatedListDto<TournamentRegistrationDto>>>{
        const team = await this.teamRepo.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure("Could not find team with id "+teamId, ErrorType.NotFound);

        const tournamentRegs = await this.tournamentRegistrationRepo.findByTeamId(teamId, page, limit);
        if (!tournamentRegs) {
            return Result.Failure("Could not find any tournament registrations for team with id "+teamId, ErrorType.NotFound);
        }

        const tournamentIds = [...new Set(tournamentRegs.map(tr => tr.tournamentId))];
        const tournaments:Tournament[] = [];

        for(let i:number = 0; i < tournamentIds.length; i++)
        {
            const tournament = await this.tournamentRepo.findById(tournamentIds[i]);
            if(tournament.tournamentId !== 0)
                tournaments.push(tournament);
        }

        

        const tournamentMap = new Map(tournaments.map(t => [t.tournamentId, t]));

        const items = tournamentRegs.map(tr => 
              new TournamentRegistrationDto(
                team.teamId,
                team.teamName,
                team.teamTag,
                team.teamLogotip,
                tournamentMap.get(tr.tournamentId)?.tournamentId,
                tournamentMap.get(tr.tournamentId)?.tournamentName,
                tr.seed,
                tr.status
              )
        );  
        const total = await this.tournamentRegistrationRepo.findTotalByTeamId(teamId);

        return Result.Success(new PaginatedListDto(items, total, page, limit));
    }

    async getByTournamentId(tournamentId: number, page?:number, limit?:number): Promise<Result<PaginatedListDto<TournamentRegistrationDto>>>{
        const tournament = await this.tournamentRepo.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure("Could not find tournament with id " + tournamentId, ErrorType.NotFound);

        const tournamentRegs = await this.tournamentRegistrationRepo.findByTournamentId(tournamentId, page, limit);
        if (!tournamentRegs) {
            return Result.Failure("Could not find any tournament registrations for tournament with id " + tournamentId, ErrorType.NotFound);
        }

        const teamIds = [...new Set(tournamentRegs.map(tr => tr.teamId))];
        const teams:Team[] = [];

        for(let i:number = 0; i < teamIds.length; i++)
        {
            const team = await this.teamRepo.findById(teamIds[i]);
            if(team.teamId !== 0)
                teams.push(team);
        }

        const teamMap = new Map(teams.map(t => [t.teamId, t]));

        const items = tournamentRegs.map(tr => 
              new TournamentRegistrationDto(
                teamMap.get(tr.teamId)?.teamId,
                teamMap.get(tr.teamId)?.teamName,
                teamMap.get(tr.teamId)?.teamTag,
                teamMap.get(tr.teamId)?.teamLogotip,
                tournamentId,
                tournament.tournamentName,
                tr.seed,
                tr.status
              )
        );  
        const total = await this.tournamentRegistrationRepo.findTotalByTournamentId(tournamentId);

        return Result.Success(new PaginatedListDto(items, total, page, limit));
    }

    async create(tr: CreateTournamentRegistrationDto): Promise<Result<TournamentRegistrationDto>>{
        const team = await this.teamRepo.findById(tr.teamId);
        if (team.teamId === 0) {
            this.logger.error("TournamentRegistrationService", "create failed", `Team with teamId "${tr.teamId}" not found`);
            return Result.Failure("Could not find team with id "+tr.teamId, ErrorType.NotFound);
        }
        const tournament = await this.tournamentRepo.findById(tr.tournamentId);
        if (!tournament) {
            this.logger.error("TournamentRegistrationService", "create failed", `Tournament with tournamentId "${tr.tournamentId}" not found`);
            return Result.Failure("Could not find tournament with id " + tr.tournamentId, ErrorType.NotFound);
        }

        const tournamentReg = await this.tournamentRegistrationRepo.findByTournamentAndTeamId(tr.tournamentId, tr.teamId);
        if(tournamentReg.tournamentId !== 0 && tournamentReg.teamId !== 0)
        {
            this.logger.error("TournamentRegistrationService", "create failed", `Tournament registration already exists!`);
            return Result.Failure("Tournament registration with touranment id " + tr.tournamentId + " and team id " + tr.teamId + " already exists!", ErrorType.Conflict);
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

        const created = await this.tournamentRegistrationRepo.create(newTournamentRegistration);
        const returnTr = new TournamentRegistrationDto(team.teamId, team.teamName, team.teamTag, team.teamLogotip, tournament.tournamentId, tournament.tournamentName, created.seed, created.status)
        return created.tournamentId !== 0 ? Result.Success(returnTr) : Result.Failure("Could not create new tournament registration!", ErrorType.Internal);
    } 

    async update(tournamentId: number, teamId: number, fields: Partial<TournamentRegistrationDto>): Promise<Result<void>>{
        const tournament = await this.tournamentRepo.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure("Could not find tournament with id " + tournamentId, ErrorType.NotFound);

        const team = await this.teamRepo.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure("Could not find team with id "+teamId, ErrorType.NotFound);

        const tournamentReg = await this.tournamentRegistrationRepo.findByTournamentAndTeamId(tournamentId, teamId);
        if(tournamentReg.tournamentId === 0 && tournamentReg.teamId === 0)
        {
            this.logger.error("TournamentRegistrationService", "update failed", `Tournament registration does not exists!`);
            return Result.Failure("Tournament registration with touranment id " + tournamentId + " and team id " + teamId + " does not exist!", ErrorType.NotFound);
        }

        const res = await this.tournamentRegistrationRepo.update(tournamentId, teamId, fields);
        return res? Result.Success(): Result.Failure("Could not update tournament registration", ErrorType.Internal);
    }

    async delete(tournamentId: number, teamId: number): Promise<Result<void>>{
        const tournament = await this.tournamentRepo.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure("Could not find tournament with id " + tournamentId, ErrorType.NotFound);

        const team = await this.teamRepo.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure("Could not find team with id "+teamId, ErrorType.NotFound);

        const tournamentReg = await this.tournamentRegistrationRepo.findByTournamentAndTeamId(tournamentId, teamId);
        if(tournamentReg.tournamentId === 0 && tournamentReg.teamId === 0)
        {
            this.logger.error("TournamentRegistrationService", "delete failed", `Tournament registration does not exist!`);
            return Result.Failure("Tournament registration with touranment id " + tournamentId + " and team id " + teamId + " does not exist!", ErrorType.NotFound);
        }

        const res = await this.tournamentRegistrationRepo.delete(tournamentId, teamId);
        return res? Result.Success(): Result.Failure("Could not delete tournament registration!", ErrorType.Internal);
    }
}