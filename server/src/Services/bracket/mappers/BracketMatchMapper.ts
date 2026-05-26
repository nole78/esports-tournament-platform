import { MatchStatus } from "../../../Domain/enums/MatchStatus";
import { Match } from "../../../Domain/models/Match";
import { BracketNode } from "../../../Domain/types/bracket/BracketNode";

export class BracketMatchMapper {
    public static mapNodeToMatch(node: BracketNode): Match {
        return new Match(
            0,
            node.tournamentId,
            0,
            0,
            0,
            MatchStatus.SCHEDULED,
            node.roundNumber,
            node.bracketType,
            0,
            0
        );
    }
}