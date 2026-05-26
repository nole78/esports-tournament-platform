import { ITournamentRegistrationWriteService } from "../../Domain/services/tournamentRegistration/ITournamentRegistrationWriteService";
import { ITournamentRegistrationWriteRepository } from "../../Domain/repositories/tournament_registrations/ITournamentRegistrationWriteRepository";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { TournamentRegistrationDto } from "../../Domain/DTOs/tournament_registrations/TournamentRegistrationDto";
import { CreateTournamentRegistrationDto } from "../../Domain/DTOs/tournament_registrations/CreateTournamentRegistrationDto";
import { TournamentRegistration } from "../../Domain/models/TournamentRegistration";
import { TournamentRegistrationStatus } from "../../Domain/enums/TournamentRegistrationStatus";
import { Result } from '../../Domain/common/Result';
import { ErrorType } from "../../Domain/common/ErrorType";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { TeamMemberDto } from "../../Domain/DTOs/team_members/TeamMemberDto";
import { ITeamMemberRepositoryRead } from "../../Domain/repositories/team_members/ITeamMemberRepositoryRead";
import { ITournamentReadRepository } from "../../Domain/repositories/tournaments/ITournamentReadRepository";
import { ITournamentRegistrationReadRepository } from '../../Domain/repositories/tournament_registrations/ITournamentRegistrationReadRepository';
import { ITeamRepositoryRead } from "../../Domain/repositories/teams/ITeamRepositoryRead";
import { TournamentStatus } from '../../Domain/enums/TournamentStatus';
import { ITournamentWriteRepository } from "../../Domain/repositories/tournaments/ITournamentWriteRepository";
import { MIN_TOURNAMENT_TEAMS } from "../../Domain/constants/Constants";
import { TournamentFormat } from "../../Domain/enums/TournamentFormat";
import { IBracketGeneratorService } from "../../Domain/services/bracket/IBracketGeneratorService";
import { BracketNode } from '../../Domain/types/BracketNode';
import { BracketHelpers } from "../bracket/BracketHelper";
import { IMatchWriteRepository } from "../../Domain/repositories/matches/IMatchWriteRepository";

export class TournamentRegistrationWriteService implements ITournamentRegistrationWriteService{
    public constructor(
        private readonly tournamentRegistrationWriteRepo: ITournamentRegistrationWriteRepository,
        private readonly tournamentRegistrationReadRepo: ITournamentRegistrationReadRepository,
        private readonly teamRepoRead: ITeamRepositoryRead,
        private readonly teamMemberRepoRead: ITeamMemberRepositoryRead,
        private readonly tournamentReadRepo : ITournamentReadRepository,
        private readonly tournamentWriteRepo : ITournamentWriteRepository,
        private readonly gameRepo: IGameRepository,
        private readonly logger: ILoggerService,
        private readonly generator: IBracketGeneratorService,
        private readonly matchWriteRepo: IMatchWriteRepository
    ){}

    async create(tr: CreateTournamentRegistrationDto): Promise<Result<TournamentRegistrationDto>>{
        const team = await this.teamRepoRead.findById(tr.teamId);
        if (team.teamId === 0) {
            this.logger.error("TournamentRegistrationService", "create failed", `Team with teamId "${tr.teamId}" not found`);
            return Result.Failure("Could not find team with id "+tr.teamId, ErrorType.NotFound);
        }
        const tournament = await this.tournamentReadRepo.findById(tr.tournamentId);
        if (!tournament) {
            this.logger.error("TournamentRegistrationService", "create failed", `Tournament with tournamentId "${tr.tournamentId}" not found`);
            return Result.Failure("Could not find tournament with id " + tr.tournamentId, ErrorType.NotFound);
        }

        const tournamentReg = await this.tournamentRegistrationReadRepo.findByTournamentAndTeamId(tr.tournamentId, tr.teamId);
        
        if(tournamentReg.tournamentId !== 0 && tournamentReg.teamId !== 0)
        {
            this.logger.error("TournamentRegistrationService", "create failed", `Tournament registration already exists!`);
            return Result.Failure("Team is already registered into this tournament!", ErrorType.Conflict);
        }

        if(tournament.tournamentStatus === TournamentStatus.ACTIVE || tournament.tournamentStatus === TournamentStatus.COMPLETED)
        {
            this.logger.error("TournamentRegistrationService", "create failed", `Tournament already started!`);
            return Result.Failure("You can't register to ongoing tournament!", ErrorType.Conflict);
        }

        const game = await this.gameRepo.findById(tournament.tournamentGameId);
        const team_members:TeamMemberDto[] = await this.teamMemberRepoRead.findByTeamId(team.teamId);
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

        const created = await this.tournamentRegistrationWriteRepo.create(newTournamentRegistration);
        const returnTr = new TournamentRegistrationDto(team.teamId, team.teamName, team.teamTag, team.teamLogotip, tournament.tournamentId, tournament.tournamentName, created.seed, created.status)
        return created.tournamentId !== 0 ? Result.Success(returnTr) : Result.Failure("Could not create new tournament registration!", ErrorType.Internal);
    } 

    async update(tournamentId: number, teamId: number, fields: Partial<TournamentRegistrationDto>): Promise<Result<void>>{
        const tournament = await this.tournamentReadRepo.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure("Could not find tournament with id " + tournamentId, ErrorType.NotFound);

        const team = await this.teamRepoRead.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure("Could not find team with id "+teamId, ErrorType.NotFound);

        const tournamentReg = await this.tournamentRegistrationReadRepo.findByTournamentAndTeamId(tournamentId, teamId);
        if(tournamentReg.tournamentId === 0 && tournamentReg.teamId === 0)
        {
            this.logger.error("TournamentRegistrationService", "update failed", `Tournament registration does not exists!`);
            return Result.Failure("Tournament registration with touranment id " + tournamentId + " and team id " + teamId + " does not exist!", ErrorType.NotFound);
        }

        if(fields.status === TournamentRegistrationStatus.CONFIRMED)
        {
            const numOfConfirmedTeams = await this.tournamentRegistrationReadRepo.findTotalByTournamentId(tournamentId, TournamentRegistrationStatus.CONFIRMED)
            if(numOfConfirmedTeams >= tournament.tournamentMaxTeams)
            {
                this.logger.error("TournamentRegistrationService", "update failed", `Cannot add another team!`);
                return Result.Failure("Cannot add another team. Tournament already has max number of teams!", ErrorType.Validation);
            }
        }

        const res = await this.tournamentRegistrationWriteRepo.update(tournamentId, teamId, fields);
        return res? Result.Success(): Result.Failure("Could not update tournament registration", ErrorType.Internal);
    }

    async delete(tournamentId: number, teamId: number): Promise<Result<void>>{
        const tournament = await this.tournamentReadRepo.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure("Could not find tournament with id " + tournamentId, ErrorType.NotFound);

        const team = await this.teamRepoRead.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure("Could not find team with id "+teamId, ErrorType.NotFound);

        const tournamentReg = await this.tournamentRegistrationReadRepo.findByTournamentAndTeamId(tournamentId, teamId);
        if(tournamentReg.tournamentId === 0 && tournamentReg.teamId === 0)
        {
            this.logger.error("TournamentRegistrationService", "delete failed", `Tournament registration does not exist!`);
            return Result.Failure("Team is not registered on tournament!", ErrorType.NotFound);
        }

        if(tournament.tournamentStatus === TournamentStatus.ACTIVE || tournament.tournamentStatus === TournamentStatus.COMPLETED)
        {
            this.logger.error("TournamentRegistrationService", "delete failed", `Tournament is active or started!`);
            return Result.Failure("You can't remove tournament registration of tournament that has already started!", ErrorType.NotFound);
        }

        const res = await this.tournamentRegistrationWriteRepo.delete(tournamentId, teamId);
        return res? Result.Success(): Result.Failure("Could not delete tournament registration!", ErrorType.Internal);
    }

    async generateBracket(id: number): Promise<Result<void>>{
        try
        {
            const tournament = await this.tournamentReadRepo.findById(id);
            if(tournament.tournamentId === 0)
            {
                this.logger.error("TournamentService", "generateBracket failed", `Tournament with tournamentId "${id}" not found`);
                return Result.Failure("Tournament with id "+id+"does not exist!", ErrorType.NotFound);
            }

            if(tournament.tournamentStatus === TournamentStatus.ACTIVE || tournament.tournamentStatus === TournamentStatus.COMPLETED)
            {
                this.logger.error("TournamentService", "generateBracket failed", `Bracket is already created!`);
                return Result.Failure("Bracket for this tournament is already created!", ErrorType.NotFound);
            }
            
            const tournamentRegs = await this.tournamentRegistrationReadRepo.findAllByTournamentId(id, TournamentRegistrationStatus.CONFIRMED);
            if(tournamentRegs.length == 0)
            {
                this.logger.error("TournamentRegistrationWriteService", "generateBracket failed", `Registered  not found`);
                return Result.Failure("Tournament with id "+id+"does not exist!", ErrorType.NotFound);
            }

            const numOfRegTeams = await this.tournamentRegistrationReadRepo.findTotalByTournamentId(id, TournamentRegistrationStatus.CONFIRMED);
            if(numOfRegTeams < MIN_TOURNAMENT_TEAMS)
            {
                this.logger.error("TournamentRegistrationWriteService", "generateBracket failed", `Not enough teams for tournament`);
                return Result.Failure("There must be atleast 2 teams to generate bracket!", ErrorType.NotFound);
            }
            if(tournament.tournamentFormat !== TournamentFormat.ROUND_ROBIN)
            {
                if((numOfRegTeams & (numOfRegTeams - 1)) !== 0)
                {
                    this.logger.error("TournamentRegistrationWriteService", "generateBracket failed", `Number of teams is not valid for tournament format`);
                    return Result.Failure("Number of teams must be a power of 2 (2, 4, 8, 16, 32, 64, ...) for formats other than round robin!", ErrorType.NotFound);
                }
            }

            for (let seed = 1; seed <= tournamentRegs.length; seed++) {
                const registration = tournamentRegs[seed - 1];
                const success = await this.tournamentRegistrationWriteRepo.update(
                    id, 
                    registration.teamId, 
                    {seed: seed}
                );
                if (!success) {
                    return Result.Failure("Failed to seed teams", ErrorType.Internal);
                }
            }

            const registrationIds = tournamentRegs.map(t => t.teamId);
            let nodes : BracketNode[];
            switch(tournament.tournamentFormat)
            {
                case TournamentFormat.DOUBLE_ELIMINATION:
                    {
                        const res = this.generator.generateDoubleElimination(id, registrationIds);
                        if(!res.isSuccess)
                            return Result.Failure("Couldn't generate bracket", ErrorType.Internal);
                        nodes = res.value as BracketNode[];
                    }
                    break;
                case TournamentFormat.ROUND_ROBIN:
                    {
                        const res = this.generator.generateRoundRobin(id, registrationIds);
                        if(!res.isSuccess)
                            return Result.Failure("Couldn't generate bracket", ErrorType.Internal);
                        nodes = res.value as BracketNode[];
                    }
                    break;
                default:
                    {
                        const res = this.generator.generateSingleElimination(id, registrationIds);
                        if(!res.isSuccess)
                            return Result.Failure("Couldn't generate bracket", ErrorType.Internal);
                        nodes = res.value as BracketNode[];
                    }
                    break;
            }

            const matches = nodes.map(BracketHelpers.mapNodeToMatch);

            const created = await this.matchWriteRepo.createBulk(matches);
            if(created.length === 0)
                return Result.Failure("Failed to create matches", ErrorType.Internal);

            const tempMap = BracketHelpers.createTempIdMap(nodes,created);

            const updates = BracketHelpers.generateRelationUpdates(nodes, tempMap);

            for(const update of updates) {
                await this.matchWriteRepo.update(update.matchId, update);
            }

            const updateRes = await this.tournamentWriteRepo.update(id, { tournamentStatus: TournamentStatus.ACTIVE });
            if(!updateRes)
            {
                this.logger.error("TournamentRegistrationWriteService", "generateBracket failed", `Could not update tournament!`);
                return Result.Failure("Could not update tournament with id "+id+"!", ErrorType.NotFound);
            }

            return Result.Success();
        }
        catch
        {
            return Result.Failure("Server error",  ErrorType.Internal);
        }
    }
}