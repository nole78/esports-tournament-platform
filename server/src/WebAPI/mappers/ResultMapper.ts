import { Result } from "../../Domain/common/Result";
import { Response } from "express";
import { mapErrorTypeToStatus } from "./HttpStatusMapper";

export function handleResult<T>(result: Result<T>, res: Response): Response {

    if (result.isSuccess) {
        return res.status(200).json({
            success: true,
            value: result.value
        });
    }

    const statusCode = mapErrorTypeToStatus(result.errorType);

    return res.status(statusCode).json({
        success: false,
        message: result.errorMessage
    });
}

