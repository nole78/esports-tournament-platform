import { TournamentFormat } from '../../../Domain/enums/TournamentFormat';
import { TournamentStatus } from '../../../Domain/enums/TournamentStatus';
import { ValidationResult } from '../../../Domain/types/ValidationResult';

export const validateTournamentCreation = (tname: string, tgame:string, tmaxteams:number, tappldeadline: Date, tprizefund: number, tformat?:TournamentFormat, tstatus?: TournamentStatus) : ValidationResult => {
    if(!tname || tname.trim().length === 0)
        return {valid:false, message:"Tournament name is mandatory"};
    if(!tgame || tgame.trim().length === 0)
        return {valid:false, message:"Game name is mandatory"};
    if(tmaxteams <= 0)
        return {valid:false, message:"Max teams must be greater than 0"};
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