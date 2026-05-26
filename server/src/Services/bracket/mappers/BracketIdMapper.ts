import { Match } from "../../../Domain/models/Match";
import { BracketNode } from "../../../Domain/types/bracket/BracketNode";

export class BracketIdMapper{
    public static mapTempIdsToMatchIds(nodes: BracketNode[], matches: Match[]): Map<number, number> {
        const map = new Map<number, number>();
        nodes.forEach((node, index) => {
            map.set(node.tempId, matches[index].matchId);
        });

        return map;
    }
}