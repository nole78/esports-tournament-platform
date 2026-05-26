import { MatchDto } from "../../../Domain/DTOs/matches/MatchDto";
import { Match } from "../../../Domain/models/Match";
import { Team } from "../../../Domain/models/Team";

export class MatchMapper {

    public static toMatchDto(match: Match, teamsMap: Map<number, Team>): MatchDto {

        const redTeam = teamsMap.get(match.redTeamId);
        const blueTeam = teamsMap.get(match.blueTeamId);

        return new MatchDto(
            match.matchId,
            match.tournamentId,

            match.blueTeamId,
            blueTeam?.teamName ?? "",

            match.redTeamId,
            redTeam?.teamName ?? "",

            match.winnerTeamId,
            match.status,
            match.roundNumber,
            match.bracketType,
            match.blueTeamScore,
            match.redTeamScore,
            match.winnerToMatchId,
            match.winnerToSlot,
            match.loserToMatchId,
            match.loserToSlot
        );
    }
}