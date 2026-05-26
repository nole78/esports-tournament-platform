import { ValidationResult } from '../../../Domain/types/validation/ValidationResult';

export const validateMatchResult = (teamRedScore?: number, teamBlueScore?:number) : ValidationResult => {
    if(!teamRedScore) 
        return {valid:false, message:"Red team score is mandatory"};
    if(teamRedScore < 0)
        return {valid:false, message:"Red team score can't be negative"};
    if(!teamBlueScore)
        return {valid:false, message:"Blue team score is mandatory"};
    if(teamBlueScore < 0)
        return {valid:false, message:"Blue team score can't be negatiev"};
    return {valid:true}
}