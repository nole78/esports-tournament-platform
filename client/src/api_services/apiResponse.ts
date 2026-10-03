import axios from "axios";
import type { ApiResponse } from "../types/api/ApiResponse";

type ErrorPayload = {
  message?: unknown;
  error?: unknown;
};

function isErrorPayload(value: unknown): value is ErrorPayload {
  return typeof value === "object" && value !== null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const payload: unknown = error.response?.data;
    if (isErrorPayload(payload)) {
      if (typeof payload.message === "string" && payload.message.length > 0) {
        return payload.message;
      }
      if (typeof payload.error === "string" && payload.error.length > 0) {
        return payload.error;
      }
    }
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallback;
}

export function apiError<T>(error: unknown, fallback: string): ApiResponse<T> {
  return {
    success: false,
    message: getApiErrorMessage(error, fallback),
  };
}
