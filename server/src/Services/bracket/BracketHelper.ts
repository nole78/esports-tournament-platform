import { MatchStatus } from "../../Domain/enums/MatchStatus";
import { Match } from "../../Domain/models/Match";
import { BracketNode } from "../../Domain/types/BracketNode";
import { MatchRelationUpdate } from "../../Domain/types/MatchRelationUpdate";

export class BracketHelpers {

    public static mapNodeToMatch(node: BracketNode): Match {
        return new Match(
            0,
            node.tournamentId,
            node.blueTeamId,
            node.redTeamId,
            0,
            MatchStatus.SCHEDULED,
            node.roundNumber,
            node.bracketType,
            0,
            0
        );
    }

    public static createTempIdMap(nodes: BracketNode[], matches: Match[]): Map<number, number> {
        const map = new Map<number, number>();
        nodes.forEach((node, index) => {
            map.set(node.tempId, matches[index].matchId);
        });

        return map;
    }

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