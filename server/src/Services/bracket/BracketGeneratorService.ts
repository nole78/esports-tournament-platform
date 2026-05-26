import { ErrorType } from "../../Domain/common/ErrorType";
import { Result } from "../../Domain/common/Result";
import { BracketType } from "../../Domain/enums/BracketType";
import { MatchSlot } from "../../Domain/enums/MatchSlot";
import { IBracketGeneratorService } from "../../Domain/services/bracket/IBracketGeneratorService";
import { BracketNode } from "../../Domain/types/bracket/BracketNode";

export class BracketGeneratorService implements IBracketGeneratorService{
    
    public generateSingleElimination(tournamentId: number, seededTeamIds: number[]) : Result<BracketNode[]>{
        if(seededTeamIds.length < 2) {
            return Result.Failure("Not enough teams", ErrorType.Validation);
        }
        const nodes: BracketNode[] = [];
        let tempId = 1;

        // ROUND 1
        const round1: BracketNode[] = [];
        let left = 0;
        let right = seededTeamIds.length - 1;
        while(left < right) {
            const node: BracketNode = {
                tempId: tempId++,
                tournamentId,
                blueTeamId: seededTeamIds[left],
                redTeamId: seededTeamIds[right],
                roundNumber: 1,
                bracketType: BracketType.WINNER
            };
            round1.push(node);
            nodes.push(node);

            left++;
            right--;
        }

        // BUILD NEXT ROUNDS
        let currentRound = round1;
        let roundNumber = 2;

        while(currentRound.length > 1) {
            const nextRound: BracketNode[] = [];
            for(let i = 0; i < currentRound.length; i += 2) {
                const parent: BracketNode = {
                    tempId: tempId++,
                    tournamentId,
                    blueTeamId: 0,
                    redTeamId: 0,
                    roundNumber,
                    bracketType: BracketType.WINNER,
                };

                // LEFT CHILD ADVANCES
                currentRound[i].winnerToTempId = parent.tempId;
                currentRound[i].winnerToSlot = MatchSlot.BLUE;

                // RIGHT CHILD ADVANCES
                currentRound[i + 1].winnerToTempId = parent.tempId;
                currentRound[i + 1].winnerToSlot = MatchSlot.RED;

                nextRound.push(parent);
                nodes.push(parent);
            }
            currentRound = nextRound;
            roundNumber++;
        }
        return Result.Success(nodes);    
    }

    public generateDoubleElimination(tournamentId: number, seededTeamIds: number[]): Result<BracketNode[]> {
        if(seededTeamIds.length < 2) {
            return Result.Failure("Not enough teams", ErrorType.Validation);
        }
        const nodes: BracketNode[] = [];
        let tempId = 1;

        //UPPER BRACKET (WINNER)
        const upperFirstRound: BracketNode[] = [];
        let left = 0;
        let right = seededTeamIds.length - 1;
        while(left < right) {
            const node: BracketNode = {
                tempId: tempId++,
                tournamentId,
                blueTeamId: seededTeamIds[left],
                redTeamId: seededTeamIds[right],
                roundNumber: 1,
                bracketType: BracketType.WINNER
            };

            upperFirstRound.push(node);
            nodes.push(node);

            left++;
            right--;
        }
        // build upper bracket rounds
        let currentRound = upperFirstRound;
        let roundNumber = 2;
        const upperRounds: BracketNode[][] = [];
        upperRounds.push(upperFirstRound);

        while(currentRound.length > 1) {
            const nextRound: BracketNode[] = [];
            for(let i = 0; i < currentRound.length; i += 2) {
                const parent: BracketNode = {
                    tempId: tempId++,
                    tournamentId,
                    blueTeamId: 0,
                    redTeamId: 0,
                    roundNumber,
                    bracketType: BracketType.WINNER
                };

                currentRound[i].winnerToTempId = parent.tempId;
                currentRound[i].winnerToSlot = MatchSlot.BLUE;

                currentRound[i + 1].winnerToTempId = parent.tempId;
                currentRound[i + 1].winnerToSlot = MatchSlot.RED;

                nextRound.push(parent);
                nodes.push(parent);
            }
            upperRounds.push(nextRound);
            currentRound = nextRound;
            roundNumber++;
        }


        // 2. LOWER BRACKET (LOSER)
        const lowerRounds: BracketNode[][] = [];
        let lowerRound: BracketNode[] = [];
        // first lower round comes from loser of first upper round
        const firstUpperRound = upperRounds[0];

        // Pair losers from adjacent matches in the upper bracket
        for(let i = 0; i < firstUpperRound.length; i += 2) {
            const node: BracketNode = {
                tempId: tempId++,
                tournamentId,
                blueTeamId: 0,
                redTeamId: 0,
                roundNumber: 1,
                bracketType: BracketType.LOSER
            };

            lowerRound.push(node);
            nodes.push(node);

            // loser from first match goes to blue
            firstUpperRound[i].loserToTempId = node.tempId;
            firstUpperRound[i].loserToSlot = MatchSlot.BLUE;

            // loser from second match goes to red
            firstUpperRound[i + 1].loserToTempId = node.tempId;
            firstUpperRound[i + 1].loserToSlot = MatchSlot.RED;
        }

        lowerRounds.push(lowerRound);
        // build lower bracket rounds (simplified chain)
        let lowerRoundNumber = 2;

        while(lowerRound.length > 1) {
            const nextLower: BracketNode[] = [];
            for(let i = 0; i < lowerRound.length; i += 2) {
                const parent: BracketNode = {
                    tempId: tempId++,
                    tournamentId,
                    blueTeamId: 0,
                    redTeamId: 0,
                    roundNumber: lowerRoundNumber,
                    bracketType: BracketType.LOSER
                };

                lowerRound[i].winnerToTempId = parent.tempId;
                lowerRound[i].winnerToSlot = MatchSlot.BLUE;

                lowerRound[i + 1].winnerToTempId = parent.tempId;
                lowerRound[i + 1].winnerToSlot = MatchSlot.RED;

                nextLower.push(parent);
                nodes.push(parent);
            }

            lowerRounds.push(nextLower);
            lowerRound = nextLower;
            lowerRoundNumber++;
        }

        // 3. GRAND FINAL
        const grandFinal: BracketNode = {
            tempId: tempId++,
            tournamentId,

            blueTeamId: 0,
            redTeamId: 0,

            roundNumber: roundNumber,
            bracketType: BracketType.GRAND_FINALE
        };

        // winner bracket final -> grand final
        const upperFinal = upperRounds[upperRounds.length - 1][0];
        upperFinal.winnerToTempId = grandFinal.tempId;
        upperFinal.winnerToSlot = MatchSlot.BLUE;

        // lower bracket winner -> grand final
        const lowerFinal = lowerRounds[lowerRounds.length - 1][0];
        lowerFinal.winnerToTempId = grandFinal.tempId;
        lowerFinal.winnerToSlot = MatchSlot.RED;

        nodes.push(grandFinal);

        return Result.Success(nodes);
    }

    public generateRoundRobin(tournamentId: number, seededTeamIds: number[]) : Result<BracketNode[]>{
        if(seededTeamIds.length < 2) {
            return Result.Failure("Not enough teams", ErrorType.Validation);
        }
        
        const nodes: BracketNode[] = [];
        const n = seededTeamIds.length;

        // Generate all matchups
        const matches: Array<{i: number, j: number}> = [];
        for(let i=0; i<n; i++) {
            for(let j=i+1; j<n; j++) {
                matches.push({i, j});
            }
        }

        // Assign rounds ensuring each team plays at most once per round
        const teamRoundsUsed: Set<number>[] = Array(n).fill(null).map(() => new Set());
        let nextTempId = 1;

        for(const match of matches) {
            let round = 1;
            while(teamRoundsUsed[match.i].has(round) || teamRoundsUsed[match.j].has(round)) {
                round++;
            }
            
            nodes.push({
                tempId: nextTempId++, 
                tournamentId: tournamentId,
                blueTeamId: seededTeamIds[match.i],
                redTeamId: seededTeamIds[match.j],  
                roundNumber: round,
                bracketType: BracketType.WINNER
            });

            teamRoundsUsed[match.i].add(round);
            teamRoundsUsed[match.j].add(round);
        }

        return Result.Success(nodes);    
    }
}