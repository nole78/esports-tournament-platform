import { ErrorType } from "./ErrorType";

type Success<T> = {
    isSuccess: true;
    value: T;
};

type Failure = {
    isSuccess: false;
    errorMessage: string;
    errorType: ErrorType;
};

export type Result<T> = Success<T> | Failure;

export const Result = {
    success<T>(value: T): Result<T> {
        return {
            isSuccess: true,
            value
        };
    },

    failure<T>(errorMessage: string, errorType: ErrorType): Result<T> {
        return {
            isSuccess: false,
            errorMessage,
            errorType
        };
    }
};