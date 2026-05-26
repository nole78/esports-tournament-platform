import { BracketType } from "../../enums/BracketType";
import { MatchSlot } from "../../enums/MatchSlot";


export type BracketNode = {

    tempId: number;

    tournamentId: number;

    blueTeamId: number;
    redTeamId: number;

    roundNumber: number;

    bracketType: BracketType;

    winnerToTempId?: number;
    winnerToSlot?: MatchSlot;

    loserToTempId?: number;
    loserToSlot?: MatchSlot;
}