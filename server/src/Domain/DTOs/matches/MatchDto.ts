// Should be allright, need to check
import { MatchSlot } from "../../enums/MatchSlot";
import { MatchStatus } from "../../enums/MatchStatus";

export class MatchDto{
    constructor(
        public matchId : number = 0,
        public tournamentId: number = 0,
        public blueTeamId : number = 0,
        public redTeamId : number = 0,
        public winnerTeamId : number  = 0,
        public status : MatchStatus = MatchStatus.SCHEDULED,
        public roundNumber : number = 0,
        public blueTeamScore : number = 0,
        public redTeamScore : number = 0,
        public WinnerToMatchId : number = 0,
        public WinnerToSlot : MatchSlot = MatchSlot.BLUE,
        public LoserToMatchId : number = 0,
        public LoserToSlot : MatchSlot = MatchSlot.BLUE,
    ){}
}