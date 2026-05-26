import { ValidationResult } from '../../../Domain/types/validation/ValidationResult';

export const validateGameCreation = (n: string, g:string, p:number) : ValidationResult => {
    if(!n|| n.length < 3)
        return {valid:false, message:"Game name is mandatory, and must be at least 3 characters"};
    if(!g || g.length < 3)
        return {valid:false, message:"Game genre is mandatory, and must be at least 3 characters"};
    if(!p || p <= 0)
        return {valid:false, message:"Player count is mandatory and must be grater than 0"};
    return {valid:true}
}