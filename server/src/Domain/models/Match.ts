//TODO: implement entity match

import { MatchRound } from "../enums/MatchRound";
import { MacthStatus } from "../enums/MatchStatus";

export class Match{
    constructor(
        public matchId : number = 0,
        public blueTeamId : number = 0,
        public redTeamId : number = 0,
        public matchResult : string = "",
        public status : MacthStatus.SCHEDULED,
        public matchRound : MatchRound = MatchRound.ROUND_OF_16,
    ){}
}