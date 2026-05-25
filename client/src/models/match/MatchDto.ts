export type MatchStatus =  "scheduled" | "ongoing" | "completed"
type BracketType = "winner" | "loser" | "grand_finale"
type MatchSlot = "none" | "blue" | "red" 

export type MatchDto = {
    matchId : number,
    tournamentId: number,
    blueTeamId : number,
    blueTeamName : string,
    redTeamId : number,
    redTeamName : string,
    winnerTeamId : number,
    status : MatchStatus,
    roundNumber : number ,
    bracketType : BracketType, 
    blueTeamScore : number,
    redTeamScore : number,
    winnerToMatchId : number,
    winnerToSlot : MatchSlot,
    loserToMatchId : number ,
    loserToSlot : MatchSlot,
}