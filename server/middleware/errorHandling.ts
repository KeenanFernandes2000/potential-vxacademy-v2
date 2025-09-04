import type { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  errors?: string[];
}

// Express error middleware - must have 4 parameters: (err, req, res, next)
export default (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.error(err); // log stack or forward to logger

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const response: any = {
    success: false,
    message,
  };

  console.log("response", response);
  // Include validation errors if they exist
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  res.status(status).json(response);
};
