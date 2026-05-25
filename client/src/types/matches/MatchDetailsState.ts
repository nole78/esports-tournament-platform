import type { MatchDto } from "../../models/match/MatchDto";
import type { TeamDto } from "../../models/team/TeamDto";

export type MatchDetailState = {
    loading: boolean;
    error: string;

    match: MatchDto | null;

    blueTeam: TeamDto | null;
    redTeam: TeamDto | null;

    tournament: string;
    game: string;
};