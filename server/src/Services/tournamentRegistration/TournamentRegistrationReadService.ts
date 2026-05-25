import { ErrorType } from "../../Domain/common/ErrorType";
import { Result } from "../../Domain/common/Result";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { TournamentRegistrationDto } from "../../Domain/DTOs/tournament_registrations/TournamentRegistrationDto";
import { TournamentRegistrationStatus } from "../../Domain/enums/TournamentRegistrationStatus";
import { Team } from "../../Domain/models/Team";
import { Tournament } from "../../Domain/models/Tournament";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { ITournamentRegistrationReadRepository } from "../../Domain/repositories/tournament_registrations/ITournamentRegistrationReadRepository";
import { ITournamentReadRepository } from "../../Domain/repositories/tournaments/ITournamentReadRepository";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { ITournamentRegistrationReadService } from "../../Domain/services/tournamentRegistration/ITournamentRegistrationReadService";

export class TournamentRegistrationReadService implements ITournamentRegistrationReadService{
    public constructor(
        private readonly tournamentRegistrationReadRepo: ITournamentRegistrationReadRepository,
        private readonly teamRepo: ITeamRepository,
        private readonly tournamentReadRepo : ITournamentReadRepository,
        private readonly logger: ILoggerService,
    ){}

    async getByTeamId(teamId: number, page?:number, limit?:number): Promise<Result<PaginatedListDto<TournamentRegistrationDto>>>{
        const team = await this.teamRepo.findById(teamId);
        if(team.teamId === 0)
        {
            this.logger.error("TournamentRegistrationServiceRead", "getByTeamId failed", `Team with teamId "${teamId}" not found`);
            return Result.Failure("Could not find team with id "+teamId, ErrorType.NotFound);
        }
        const tournamentRegs = await this.tournamentRegistrationReadRepo.findByTeamId(teamId, page, limit);
        if (!tournamentRegs) {
            this.logger.error("TournamentRegistrationServiceRead", "getByTeamId failed", `Tournament registrations with teamId "${teamId}" not found`);
            return Result.Failure("Could not find any tournament registrations for team with id "+teamId, ErrorType.NotFound);
        }

        const tournamentIds = [...new Set(tournamentRegs.map(tr => tr.tournamentId))];
        const tournaments:Tournament[] = [];

        for(let i:number = 0; i < tournamentIds.length; i++)
        {
            const tournament = await this.tournamentReadRepo.findById(tournamentIds[i]);
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
        const total = await this.tournamentRegistrationReadRepo.findTotalByTeamId(teamId);

        return Result.Success(new PaginatedListDto(items, total, page, limit));
    }

    async getByTournamentId(tournamentId: number, status:TournamentRegistrationStatus, page?:number, limit?:number): Promise<Result<PaginatedListDto<TournamentRegistrationDto>>>{
        const tournament = await this.tournamentReadRepo.findById(tournamentId);
        if(tournament.tournamentId === 0)
        {
            this.logger.error("TournamentRegistrationServiceRead", "getByTournamentId failed", `Tournament with tournamentId "${tournamentId}" not found`);
            return Result.Failure("Could not find tournament with id " + tournamentId, ErrorType.NotFound);
        }
        const tournamentRegs = await this.tournamentRegistrationReadRepo.findByTournamentId(tournamentId, status, page, limit);
        if (!tournamentRegs) {
            this.logger.error("TournamentRegistrationServiceRead", "getByTournamentId failed", `Tournament registrations with tournamentId "${tournamentId}" not found`);
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
        const total = await this.tournamentRegistrationReadRepo.findTotalByTournamentId(tournamentId, status);

        return Result.Success(new PaginatedListDto(items, total, page, limit));
    }
}