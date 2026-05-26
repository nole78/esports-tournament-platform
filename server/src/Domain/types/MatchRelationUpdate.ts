import { MatchSlot } from "../enums/MatchSlot";

export type MatchRelationUpdate = {

    matchId: number;

    winnerToMatchId?: number;
    winnerToSlot?: MatchSlot;

    loserToMatchId?: number;
    loserToSlot?: MatchSlot;
}