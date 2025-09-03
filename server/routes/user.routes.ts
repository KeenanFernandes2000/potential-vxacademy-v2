import express from "express";
const router = express.Router();
import { userControllers } from "../controller/user.controllers";

router.get("/", userControllers.getAllUsers);
router.post("/", userControllers.createUser);

export default router;
