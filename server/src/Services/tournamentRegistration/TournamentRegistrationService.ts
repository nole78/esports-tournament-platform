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

export class TournamentRegistrationService implements ITournamentRegistrationService{
    public constructor(
        private readonly tournamentRegistrationRepo: ITournamentRegistrationRepository,
        private readonly teamRepo: ITeamRepository,
        private readonly tournamentRepo : ITournamentRepository,
        private readonly logger: ILoggerService,
    ){}

    async getByTeamId(teamId: number, page?:number, limit?:number): Promise<PaginatedListDto<TournamentRegistrationDto>>{
        const tournamentRegs = await this.tournamentRegistrationRepo.findByTeamId(teamId, page, limit);
        if (!tournamentRegs) {
            return new PaginatedListDto([], 0, page, limit);
        }

        const tournamentIds = [...new Set(tournamentRegs.map(tr => tr.tournamentId))];
        const tournaments:Tournament[] = [];

        for(let i:number = 0; i < tournamentIds.length; i++)
        {
            const tournament = await this.tournamentRepo.findById(tournamentIds[i]);
            if(tournament != null)
                tournaments.push(tournament);
        }

        const team = await this.teamRepo.findById(teamId);

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

        return new PaginatedListDto(items, total, page, limit);
    }

    async getByTournamentId(tournamentId: number, page?:number, limit?:number): Promise<PaginatedListDto<TournamentRegistrationDto>>{
        const tournamentRegs = await this.tournamentRegistrationRepo.findByTournamentId(tournamentId, page, limit);
        if (!tournamentRegs) {
            return new PaginatedListDto([], 0, page, limit);
        }

        const teamIds = [...new Set(tournamentRegs.map(tr => tr.teamId))];
        const teams:Team[] = [];

        for(let i:number = 0; i < teamIds.length; i++)
        {
            const team = await this.teamRepo.findById(teamIds[i]);
            if(team != null)
                teams.push(team);
        }

        const tournament = await this.tournamentRepo.findById(tournamentId);

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

        return new PaginatedListDto(items, total, page, limit);
    }

    async create(tr: CreateTournamentRegistrationDto): Promise<TournamentRegistrationDto | null>{
        const team = await this.teamRepo.findById(tr.teamId);
        if (!team) {
            this.logger.error("TournamentRegistrationService", "create failed", `Team with teamId "${tr.teamId}" not found`);
            return null;
        }
        const tournament = await this.tournamentRepo.findById(tr.tournamentId);
        if (!tournament) {
            this.logger.error("TournamentRegistrationService", "create failed", `Tournament with tournamentId "${tr.tournamentId}" not found`);
            return null;
        }
        const newTournamentRegistration = new TournamentRegistration(
            tr.teamId,
            tr.tournamentId,
            0,
            TournamentRegistrationStatus.PENDING,
            new Date()
        )

        const created = await this.tournamentRegistrationRepo.create(newTournamentRegistration);
        const returnTr = new TournamentRegistrationDto(team.teamId, team.teamName, team.teamTag, team.teamLogotip, tournament.tournamentId, tournament.tournamentName, created.seed, created.status)
        return created.tournamentId !== 0 ? returnTr : null;
    } 

    async update(tournamentId: number, teamId: number, fields: Partial<TournamentRegistrationDto>): Promise<boolean>{
        return this.tournamentRegistrationRepo.update(tournamentId, teamId, fields);
    }

    async delete(tournamentId: number, teamId: number): Promise<boolean>{
        return this.tournamentRegistrationRepo.delete(tournamentId, teamId);
    }
}