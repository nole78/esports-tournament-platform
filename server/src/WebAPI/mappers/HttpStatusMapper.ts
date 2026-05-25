import { ErrorType } from "../../Domain/common/ErrorType";

export function mapErrorTypeToStatus(errorType: ErrorType | void): number {

    switch (errorType) {

        case ErrorType.NotFound:
            return 404;

        case ErrorType.Conflict:
            return 409;

        case ErrorType.Validation:
            return 400;

        case ErrorType.Unauthorized:
            return 401;

        default:
            return 500;
    }
}