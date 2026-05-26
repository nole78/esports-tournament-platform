import { Result } from "../../common/Result";
import { BracketNode } from "../../types/bracket/BracketNode";

export interface IBracketGeneratorService {
    
    generateSingleElimination(tournamentId: number, seededTeamids: number[]) : Result<BracketNode[]>;
    generateDoubleElimination(tournamentId: number, seededTeamids: number[]) : Result<BracketNode[]>;
    generateRoundRobin(tournamentId: number, seededTeamids: number[]) : Result<BracketNode[]>;
}