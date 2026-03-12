import { Router } from "express";
import { register, verifyEmail,login,getMe } from "../controllers/auth.controller.js";
import { registerValidator ,loginValidator} from "../validators/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";
const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post("/register", registerValidator, register);

/**
 * @route POST/auth?login
 * @desc Login user and return JWT token
 * @access Public   
 * @body { email, password }
 */
authRouter.post("/login", loginValidator,login);

/** 
 * @route get /api/auth/get-me
 * @desc Get current logged in user details
 * @access Private
 */
authRouter.get("/get-me", getMe);
/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */




authRouter.get("/verify-email", verifyEmail )




export default authRouter;