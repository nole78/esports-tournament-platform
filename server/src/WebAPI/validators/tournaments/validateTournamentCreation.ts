import { TournamentFormat } from '../../../Domain/enums/TournamentFormat';
import { TournamentStatus } from '../../../Domain/enums/TournamentStatus';
import { ValidationResult } from '../../../Domain/types/ValidationResult';

const isPowerOfTwo = (n: number): boolean => {
  return n > 0 && (n & (n - 1)) === 0;
};

export const validateTournamentCreation = (tname: string, tgame:string, tmaxteams:number, tappldeadline: Date, tprizefund: number, tformat?:TournamentFormat, tstatus?: TournamentStatus) : ValidationResult => {
    if(!tname || tname.trim().length === 0)
        return {valid:false, message:"Tournament name is mandatory"};
    if(!tgame || tgame.trim().length === 0)
        return {valid:false, message:"Game name is mandatory"};
    if(tmaxteams < 4 || tmaxteams > 256)
        return {valid:false, message:"Maximum number of teams must be greater or equal to 4 and less or equal to 256"};
    if(!isPowerOfTwo(tmaxteams) && tformat !== TournamentFormat.ROUND_ROBIN)
        return {valid:false, message:"Maximum number of teams must be a power of 2 (2, 4, 8, 16, 32, 64, ...) for formats other than round robin"};
    if(tprizefund <= 0)
        return {valid:false, message:"Prize fund must be greater than 0"};
    if(!tformat)
        return {valid:false, message:"Invalid tournament format"};
    if(!tstatus)
        return {valid:false, message:"Invalid tournament status"};
    if(!tappldeadline || new Date(tappldeadline) <= new Date())
        return {valid:false, message:"Application deadline must be in the future"};
    return {valid:true}
}