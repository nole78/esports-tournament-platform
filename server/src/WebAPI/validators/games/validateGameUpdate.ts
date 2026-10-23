import { ValidationResult } from '../../../Domain/types/validation/ValidationResult';

export const validateGameUpdate = (n?: string, g?:string, p?:number) : ValidationResult => {
    if(n != undefined && n.trim().length < 3)
        return {valid:false, message:"Game name must be at least 3 characters"};
    if(g != undefined && g.trim().length < 3)
        return {valid:false, message:"Game genre must be at least 3 characters"};
    if(p != undefined && p <= 0)
        return {valid:false, message:"Player count must be grater than 0"};
    return {valid:true}
}