export class StatisticsDto {
  constructor(
    public totalUsers: number         = 0,
    public totalGames: number         = 0,
    public totalTournaments: number   = 0,
    public totalTeams: number         = 0,
    public totalMatches: number       = 0,
  ) {}
}
