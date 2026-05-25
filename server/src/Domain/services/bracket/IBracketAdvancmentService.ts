import { Result } from "../../common/Result";
import { Match } from "../../models/Match";
import { MatchSlot } from "../../enums/MatchSlot";

export interface IBracketAdvancementService {

    validateAdvance(
        matchId: number,
        slot: MatchSlot,
        teamId: number
    ): Promise<Result<void>>;

    advanceTeam(
        matchId: number,
        slot: MatchSlot,
        teamId: number
    ): Promise<Result<void>>;

    advanceMatch(
        match: Match,
        winnerTeamId: number,
        loserTeamId: number
    ): Promise<Result<void>>;
}