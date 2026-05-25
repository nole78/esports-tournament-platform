
export type AddPlayerErrorDto = {
    userId: number,
    reason: string
}

export type MatchPlayerDto = {
    gamerTag: string,
    userId: number,
    teamId: number,
    matchId: number,
    performanceNotes: string,
}

export type AddPlayersResponseDto = {
    addedPlayers : MatchPlayerDto[],
    failedPlayers : AddPlayerErrorDto[]
}