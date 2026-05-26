import { Result } from "../../common/Result";
import { Match } from "../../models/Match";
import { BracketNode } from "../../types/BracketNode";



export interface IBracketGeneratorService {
    
    generateSingleElimination(tournamentId: number, seededTeamids: number[]) : Result<BracketNode[]>;
    generateDoubleElimination(tournamentId: number, seededTeamids: number[]) : Result<BracketNode[]>;
    generateRoundRobin(tournamentId: number, seededTeamids: number[]) : Result<BracketNode[]>;
}