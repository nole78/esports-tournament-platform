import { ValidationResult } from '../../../Domain/types/validation/ValidationResult';

export const validatePerformanceNotes = (notes?: string) : ValidationResult => {
    if(!notes) 
        return {valid:false, message:"Performance notes text is required"};
    return {valid:true}
}