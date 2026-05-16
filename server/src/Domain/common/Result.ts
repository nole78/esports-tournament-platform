import { ErrorType } from './ErrorType';

export class Result<T = void>{
    public isSuccess: boolean = false;
    public errorMessage: string | null = null;
    public errorType: ErrorType | null = null;
    public value: T | null = null;

    protected constructor(isSuccess: boolean, value: T | null, errorMessage: string | null, errorType: ErrorType | null)
    {
        this.isSuccess = isSuccess;
        this.value = value;
        this.errorMessage = errorMessage;
        this.errorType = errorType;
    } 

    public static Success(): Result<void>;
    public static Success<T>(value: T): Result<T>;
    public static Success<T>(value?: T) : Result<T | void>{
        return new Result<T | void>(true,value ?? null,null,null)
    }

    public static Failure<T>(errorMessage: string, errorType: ErrorType) : Result<T>{
        return new Result<T>(false,null,errorMessage,errorType);
    }
}