import { Match } from "../../../Domain/models/Match";
import { Team } from "../../../Domain/models/Team";
import { ITeamRepositoryRead } from "../../../Domain/repositories/teams/ITeamRepositoryRead";

export class MatchTeamHelper {

    public static async getTeamsMap(matches: Match[], teamRepo: ITeamRepositoryRead): Promise<Map<number, Team>> {
        const ids = [...new Set(
                matches.flatMap(m => [m.redTeamId, m.blueTeamId])
                    .filter(id => id !== 0)
            )];

        const teams = await teamRepo.findByIds(ids);

        return new Map(teams.map(t => [t.teamId, t]));
    }
}