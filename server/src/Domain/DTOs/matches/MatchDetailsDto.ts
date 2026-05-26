import { MatchStatus } from "../../enums/MatchStatus";

export class MatchDetailsDto{
    constructor(
        public matchId : number = 0,

        public status : MatchStatus = MatchStatus.SCHEDULED,
        public roundNumber : number = 0, 

        public blueTeamId : number = 0,
        public blueTeamName : string = "",
        public blueTeamTag: string = "",
        public blueTeamLogo: string = "",
        
        public redTeamId : number = 0,
        public redTeamName : string = "",
        public redTeamTag: string = "",
        public redTeamLogo: string = "",

        public winnerTeamId : number  = 0,

        public blueTeamScore : number = 0,
        public redTeamScore : number = 0,

        public tournamentId: number = 0,
        public tournamentName: string = "",

        public gameName: string = "",
        public playersPerTeam: number = 0,
    ){}
}