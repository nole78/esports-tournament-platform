import { ValidationResult } from '../../../Domain/types/validation/ValidationResult';

export const validateGameCreation = (n: string, g:string, p:number) : ValidationResult => {
    if(!n|| n.trim().length < 3 || n.trim().length > 100)
        return {valid:false, message:"Game name is mandatory, and must be at least 3 characters"};
    if(!g || g.trim().length < 3)
        return {valid:false, message:"Game genre is mandatory, and must be 3 to 100 characters long"};
    if(!p || typeof p !== "number" || p <= 0)
        return {valid:false, message:"Player count is mandatory and must be grater than 0"};
    return {valid:true}
}