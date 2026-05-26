import { ValidationResult } from "../../../Domain/types/validation/ValidationResult"

export const validateTeams = (teamName: string, teamTag: string, teamLogotip: string, teamDescription: string) : ValidationResult =>{
    if (!teamName || teamName.trim().length === 0){
        return {valid:false, message:"Team name is required!"};
    }
    if (!teamTag || teamTag.trim().length === 0){
        return {valid:false, message:"Team tag is required!"};
    }
    if (!teamLogotip || teamLogotip.trim().length === 0){
        return {valid:false, message:"Team Logotip is required!"};
    }
    if (!teamDescription || teamDescription.trim().length === 0){
        return {valid:false, message:"Team Description is required!"};
    }
    if (teamName.length<2 || teamName.length >80){
        return {valid:false, message:"Team name must be between 2 and 80 characters"};
    }
    if (teamTag.length<2 || teamTag.length>6){
        return {valid:false, message:"Team tag must be between 2 and 6 characters"};
    }
    return {valid: true}
}