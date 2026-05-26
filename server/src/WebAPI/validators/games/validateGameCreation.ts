import { ValidationResult } from '../../../Domain/types/validation/ValidationResult';

export const validateGameCreation = (n: string, g:string, p:number) : ValidationResult => {
    if(!n)
        return {valid:false, message:"Game name is mandatory"};
    if(!g)
        return {valid:false, message:"Game genre is mandatory"};
    if(!p || p <= 0)
        return {valid:false, message:"Player count is mandatory and must be grater than 0"};
    return {valid:true}
}