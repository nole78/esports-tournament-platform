import { BracketNode } from "../../../Domain/types/bracket/BracketNode";
import { MatchRelationUpdate } from "../../../Domain/types/bracket/MatchRelationUpdate";

export class BracketRelationBuilder{
    public static generateRelationUpdates(nodes: BracketNode[],tempIdMap: Map<number, number>): MatchRelationUpdate[] {
        const updates: MatchRelationUpdate[] = [];

        for(const node of nodes) {
            const matchId = tempIdMap.get(node.tempId);

            if(!matchId) continue;

            const update: MatchRelationUpdate = {matchId};

            // TEAM IDS
            if(node.blueTeamId) {
                update.blueTeamId = node.blueTeamId;
            }
            if(node.redTeamId) {
                update.redTeamId = node.redTeamId;
            }

            // WINNER RELATIONS
            if(node.winnerToTempId) {
                const winnerToMatchId = tempIdMap.get(node.winnerToTempId);
                if(winnerToMatchId) {
                    update.winnerToMatchId = winnerToMatchId;
                    update.winnerToSlot = node.winnerToSlot;
                }
            }

            // LOSER RELATIONS
            if(node.loserToTempId) {
                const loserToMatchId =
                    tempIdMap.get( node.loserToTempId);
                if(loserToMatchId) {
                    update.loserToMatchId = loserToMatchId;
                    update.loserToSlot = node.loserToSlot;
                }
            }

            // ONLY PUSH IF THERE IS AT LEAST ONE RELATION
            if(update.winnerToMatchId || update.loserToMatchId || update.blueTeamId || update.redTeamId
            ) {
                updates.push(update);
            }
        }
        return updates;
    }
}