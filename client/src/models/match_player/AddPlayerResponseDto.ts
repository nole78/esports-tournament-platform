
export type AddPlayerErrorDto = {
    userId: number,
    reason: string
}

export type MatchPlayerDto = {
    userId : number,
    teamId : number,
    matchId : number,
    performanceNotes : string
}

export type AddPlayersResponseDto = {
    addedPlayers : MatchPlayerDto[],
    failedPlayers : AddPlayerErrorDto[]
}