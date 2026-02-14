import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  statusCode: number;
  statusText: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const sendSuccess = <T>(res: Response, statusCode: number, data: T, statusText = 'Success'): void => {
  const response: ApiResponse<T> = {
    statusCode,
    statusText,
    data,
  };
  res.status(statusCode).send(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  errorCode: string,
  message: string,
  statusText = 'Error'
): void => {
  const response: ApiResponse = {
    statusCode,
    statusText,
    error: {
      code: errorCode,
      message,
    },
  };
  res.status(statusCode).send(response);
};
