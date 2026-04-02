
import { Router } from "express";
import { register, verifyEmail,login,getMe, logout } from "../controllers/auth.controller.js";
import { registerValidator ,loginValidator} from "../validators/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";
import { getEmailStatus } from "../services/mail.service.js";
import userModel from "../models/user.model.js";
const authRouter = Router();

/**
 * @route POST /api/auth/logout
 * @desc Logout user (clear token cookie)
 * @access Public
 */
authRouter.post("/logout", logout);

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
authRouter.get("/get-me",authUser, getMe);
/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */
authRouter.get("/verify-email", verifyEmail );

/**
 * @route GET /api/auth/email-status
 * @desc Check email configuration status (debugging)
 * @access Public
 */
authRouter.get("/email-status", (req, res) => {
    const status = getEmailStatus();
    res.json({
        message: "Email service status",
        success: true,
        status
    });
});

/**
 * @route GET /api/auth/verify-manual/:email
 * @desc Manual verification for testing (development only)
 * @access Public
 */
authRouter.get("/verify-manual/:email", async (req, res) => {
    try {
        const user = await userModel.findOneAndUpdate(
            { email: req.params.email },
            { verified: true },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        res.json({
            message: "✅ Email verified successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Verification failed",
            success: false,
            err: error.message
        });
    }
});

export default authRouter;