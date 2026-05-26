import { Result } from "../../Domain/common/Result";
import { ErrorType } from "../../Domain/common/ErrorType";

import { Match } from "../../Domain/models/Match";

import { MatchSlot } from "../../Domain/enums/MatchSlot";
import { MatchStatus } from "../../Domain/enums/MatchStatus";

import { IBracketAdvancementService } from "../../Domain/services/bracket/IBracketAdvancmentService";

import { IMatchReadRepository } from "../../Domain/repositories/matches/IMatchReadRepository";
import { IMatchWriteRepository } from "../../Domain/repositories/matches/IMatchWriteRepository";

export class BracketAdvancementService implements IBracketAdvancementService {
    constructor(
        private readonly matchReadRepo: IMatchReadRepository,
        private readonly matchWriteRepo: IMatchWriteRepository
    ) {}

    public async validateAdvance(matchId: number, slot: MatchSlot, teamId: number): Promise<Result<void>> {

        const nextMatch = await this.matchReadRepo.findById(matchId);

        if(nextMatch.matchId === 0)
            return Result.Failure("There is no match to advance to",ErrorType.NotFound);

        if(nextMatch.status === MatchStatus.COMPLETED)
            return Result.Failure("Can't add team to completed match", ErrorType.Conflict);

        if(slot === MatchSlot.BLUE && nextMatch.blueTeamId !== 0 && nextMatch.blueTeamId !== teamId
        ) {
            return Result.Failure( "There is already a team in the blue slot", ErrorType.Conflict);
        }

        if(slot === MatchSlot.RED && nextMatch.redTeamId !== 0 && nextMatch.redTeamId !== teamId
        ) {
            return Result.Failure("There is already a team in the red slot", ErrorType.Conflict);
        }

        return Result.Success();
    }

    public async advanceTeam( matchId: number, slot: MatchSlot,  teamId: number ): Promise<Result<void>> {

        const validation = await this.validateAdvance( matchId, slot, teamId);
        if(!validation.isSuccess)
            return validation;

        const ok = slot === MatchSlot.BLUE? 
                await this.matchWriteRepo.update(matchId, {blueTeamId: teamId })
                : await this.matchWriteRepo.update(matchId, {redTeamId: teamId });

        if(!ok)
            return Result.Failure("Couldn't advance team", ErrorType.Internal);

        return Result.Success();
    }

    public async advanceMatch(match: Match, winnerTeamId: number, loserTeamId: number): Promise<Result<void>> {
        // PRE VALIDATION
        if(match.winnerToMatchId) {

            const validation = await this.validateAdvance( match.winnerToMatchId, match.winnerToSlot, winnerTeamId);
            if(!validation.isSuccess)
                return validation;
        }

        if(match.loserToMatchId) {
            const validation = await this.validateAdvance( match.loserToMatchId, match.loserToSlot, loserTeamId);
            if(!validation.isSuccess)
                return validation;
        }
        // ADVANCE WINNER
        if(match.winnerToMatchId) {
            const result = await this.advanceTeam(match.winnerToMatchId, match.winnerToSlot, winnerTeamId);
            if(!result.isSuccess)
                return result;
        }
        // ADVANCE LOSER
        if(match.loserToMatchId) {
            const result = await this.advanceTeam(match.loserToMatchId, match.loserToSlot, loserTeamId);
            if(!result.isSuccess)
                return result;
        }

        return Result.Success();
    }
}