import { ValidationResult } from "../../../Domain/types/ValidationResult"

export const validateTeamsCreation = (teamName: string, teamTag: string, teamLogotip: string, teamDescription: string) : ValidationResult =>{
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
    return {valid: true}
}