import { BracketType } from "../../enums/BracketType";
import { MatchSlot } from "../../enums/MatchSlot";
import { MatchStatus } from "../../enums/MatchStatus";

export class MatchDto{
    constructor(
        public matchId : number = 0,
        public tournamentId: number = 0,
        public blueTeamId : number = 0,
        public blueTeamName : string = "",
        public redTeamId : number = 0,
        public redTeamName : string = "",
        public winnerTeamId : number  = 0,
        public status : MatchStatus = MatchStatus.SCHEDULED,
        public roundNumber : number = 0,
        public bracketType : BracketType = BracketType.WINNER, 
        public blueTeamScore : number = 0,
        public redTeamScore : number = 0,
        public winnerToMatchId : number = 0,
        public winnerToSlot : MatchSlot = MatchSlot.NONE,
        public loserToMatchId : number = 0,
        public loserToSlot : MatchSlot = MatchSlot.NONE,
    ){}
}