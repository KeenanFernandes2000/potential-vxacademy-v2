import type { Request, Response, NextFunction, RequestHandler } from "express";

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.log("Async handler caught error:", error);
      next(error);
    });
  };

// Create a wrapper for Express Router that automatically applies asyncHandler
export const createAsyncRouter = () => {
  const express = require("express");
  const router = express.Router();

  // Override the router methods to automatically wrap handlers
  const originalGet = router.get.bind(router);
  const originalPost = router.post.bind(router);
  const originalPut = router.put.bind(router);
  const originalDelete = router.delete.bind(router);
  const originalPatch = router.patch.bind(router);

  router.get = (path: string, ...handlers: RequestHandler[]) => {
    const wrappedHandlers = handlers.map((handler) =>
      handler.length === 4 ? handler : asyncHandler(handler as any)
    );
    return originalGet(path, ...wrappedHandlers);
  };

  router.post = (path: string, ...handlers: RequestHandler[]) => {
    const wrappedHandlers = handlers.map((handler) =>
      handler.length === 4 ? handler : asyncHandler(handler as any)
    );
    return originalPost(path, ...wrappedHandlers);
  };

  router.put = (path: string, ...handlers: RequestHandler[]) => {
    const wrappedHandlers = handlers.map((handler) =>
      handler.length === 4 ? handler : asyncHandler(handler as any)
    );
    return originalPut(path, ...wrappedHandlers);
  };

  router.delete = (path: string, ...handlers: RequestHandler[]) => {
    const wrappedHandlers = handlers.map((handler) =>
      handler.length === 4 ? handler : asyncHandler(handler as any)
    );
    return originalDelete(path, ...wrappedHandlers);
  };

  router.patch = (path: string, ...handlers: RequestHandler[]) => {
    const wrappedHandlers = handlers.map((handler) =>
      handler.length === 4 ? handler : asyncHandler(handler as any)
    );
    return originalPatch(path, ...wrappedHandlers);
  };

  return router;
};

export default asyncHandler;
