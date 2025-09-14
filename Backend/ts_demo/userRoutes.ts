import express from "express";
import { registerUser, loginUser, getUserProfile } from "./userController";
import { authMiddleware } from "../authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);

export default router;
