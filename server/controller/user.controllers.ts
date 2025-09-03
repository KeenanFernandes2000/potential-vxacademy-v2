import type { Request, Response } from "express";

export class userControllers {
  static async getAllUsers(req: Request, res: Response) {
    // TODO: Implement logic to fetch all users
    res.status(200).json({ message: "getAllUsers not implemented yet" });
    return;
  }

  static async createUser(req: Request, res: Response) {
    // TODO: Implement logic to create a new user
    res.status(201).json({ message: "createUser not implemented yet" });
    return;
  }
}
