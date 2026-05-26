import { ValidationResult } from '../../../Domain/types/validation/ValidationResult';

export const validateAddPlayers = (teamId?: number, userIds?: number[]) : ValidationResult => {
    if(!teamId)
        return {valid:false, message:"Team Id is required!"};
    if(teamId <= 0)
        return {valid:false, message:"Team id must be grater than 0!"};
    if(!userIds || userIds.length === 0)
        return {valid:false, message:"No player for adding!"};
    for(const userId  of userIds)
    {
        if(userId  <= 0)
            return{valid:false, message:"All player ids  must be grater than 0"};
    }
    return {valid:true}
}