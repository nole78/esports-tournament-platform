import { MatchSlot } from "../../enums/MatchSlot";

export type MatchRelationUpdate = {
    matchId: number;

    blueTeamId?: number;
    redTeamId?: number;

    winnerToMatchId?: number;
    winnerToSlot?: MatchSlot;

    loserToMatchId?: number;
    loserToSlot?: MatchSlot;
}