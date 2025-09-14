import { Request, Response } from "express";

// Import existing JS controller (keep runtime behavior)
// We import with `require` to match CommonJS runtime; TypeScript will type the wrappers below.
const userController = require("../controllers/userController");

// Typed wrappers — these simply forward to the JS controller functions but provide type signatures.
export const registerUser = async (req: Request, res: Response) => {
    return userController.registerUser(req, res);
};

export const loginUser = async (req: Request, res: Response) => {
    return userController.loginUser(req, res);
};

export const getUserProfile = async (req: Request, res: Response) => {
    return userController.getUserProfile(req, res);
};

// ...export other wrappers as needed for the demo
