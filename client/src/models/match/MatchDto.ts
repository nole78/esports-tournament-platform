type MatchStatus =  "scheduled" | "ongoing" | "completed"
type BracketType = "winner" | "loser" | "grand_finale"

export type MatchDto = {
    matchId : number,
    tournamentId: number,
    blueTeamId : number,
    redTeamId : number,
    winnerTeamId : number,
    status : MatchStatus,
    roundNumber : number ,
    bracketType : BracketType, 
    blueTeamScore : number,
    redTeamScore : number
}