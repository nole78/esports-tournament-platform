// Should be allright, need to check
import { MatchRound } from "../../enums/MatchRound";
import { MatchStatus } from "../../enums/MatchStatus";

export class MatchDto{
    constructor(
            public matchId : number = 0,
            public matchResult : string = "",
            public status : MatchStatus.SCHEDULED,
            public matchRound : MatchRound = MatchRound.ROUND_OF_16,
    ){}
}