import { ErrorType } from './ErrorType';

export class Result<T = void>{
    public isSuccess: boolean = false;
    public errorMessage: string = "";
    public errorType: ErrorType | void;
    public value: T | void;

    protected constructor(isSuccess: boolean, value: T | void, errorMessage: string, errorType: ErrorType | void)
    {
        this.isSuccess = isSuccess;
        this.value = value;
        this.errorMessage = errorMessage;
        this.errorType = errorType;
    } 

    public static Success(): Result<void>;
    public static Success<T>(value: T): Result<T>;
    public static Success<T>(value?: T) : Result<T | void>{
        return new Result<T | void>(true,value,"",void 0)
    }

    public static Failure<T>(errorMessage: string, errorType: ErrorType) : Result<T>{
        return new Result<T>(false,void 0,errorMessage,errorType);
    }
}