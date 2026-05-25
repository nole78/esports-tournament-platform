import type { MatchStatus } from "./MatchDto"

export type MatchDetailsDto = {
         matchId : number,

         status : MatchStatus
         roundNumber : number, 

         blueTeamId : number,
         blueTeamName : string,
         blueTeamTag: string,
         blueTeamLogo: string,
        
         redTeamId : number,
         redTeamName : string,
         redTeamTag: string,
         redTeamLogo: string,

         winnerTeamId : number,

         blueTeamScore : number,
         redTeamScore : number,

         tournamentId: number,
         tournamentName: string,

         gameName: string,
}