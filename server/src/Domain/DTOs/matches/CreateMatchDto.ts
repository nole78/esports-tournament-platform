// TODO: implement class for Match DTO creation 

import { MatchRound } from "../../enums/MatchRound";
import { MatchStatus } from "../../enums/MatchStatus";

export class CreateMatchDto{
    constructor(
    public blueTeamId : number = 0,
    public redTeamId : number = 0,
    public matchRound : MatchRound = MatchRound.ROUND_OF_16,
    ){}
}