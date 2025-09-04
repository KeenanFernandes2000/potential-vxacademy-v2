import type { Request, Response, NextFunction } from "express";

// Role specific strategy
export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: any = req.user; // Passport attaches user here
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(user.userType)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient rights" });
    }

    return next();
  };
}
