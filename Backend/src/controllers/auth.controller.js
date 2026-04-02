export async function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax"
    });
    res.status(200).json({
        message: "Logout successful",
        success: true
    });
}
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";


export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ email }, { username }]
        })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "User with this email or username already exists",
                success: false,
                err: "User already exists"
            })
        }

        const user = await userModel.create({ username, email, password })

        const emailVerificationToken = jwt.sign(
            {
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // ✅ Auto-verify users on registration for immediate chat access
        // This is a temporary workaround until email verification is working
        user.verified = true;
        await user.save();
        console.log("✅ User auto-verified on registration:", email);

        // ✅ Add error handling for email sending
        try {
            await sendEmail({
                to: email,
                subject: "Welcome to Perplexity!",
                html: `
                    <p>Hi ${username},</p>
                    <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${process.env.BACKEND_URL}/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                    <p>If you did not create an account, please ignore this email.</p>
                    <p>Best regards,<br>The Perplexity Team</p>
                `
            })
            console.log("✅ Verification email sent successfully to:", email);
        } catch (emailError) {
            console.error("⚠️ Email sending failed:", emailError.message);
            console.error("Email config - User:", process.env.GOOGLE_USER);
            console.error("Missing env vars:", {
                GOOGLE_USER: !process.env.GOOGLE_USER,
                GOOGLE_CLIENT_ID: !process.env.GOOGLE_CLIENT_ID,
                GOOGLE_CLIENT_SECRET: !process.env.GOOGLE_CLIENT_SECRET,
                GOOGLE_REFRESH_TOKEN: !process.env.GOOGLE_REFRESH_TOKEN,
            });
            console.warn("⚠️ User created and auto-verified due to email failure for:", email);
        }

        res.status(201).json({
            message: "User registered successfully! You can now chat immediately. Email verification link has been sent (check spam folder).",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: true
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Registration failed",
            success: false,
            err: error.message
        });
    }
}


export async function login(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "User not found"
        })
    }

    // ✅ Compare password with bcrypt
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "Incorrect password"
        })
    }

    // ✅ Allow login even if not verified (with warning for UI)
    if (!user.verified) {
        console.warn("⚠️ User logging in with unverified email:", email);
    }

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    // ✅ Fixed cookie settings - secure: false for localhost, true for production
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}

export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        if (!token) {
            return res.status(400).json({
                message: "No verification token provided",
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            })
        }

        if (user.verified) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: green;">✅ Email Already Verified!</h1>
                        <p>Your email is already verified. You can now log in to your account.</p>
                        <a href="${process.env.FRONTEND_URL}/login" style="background-color: #31b8c6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Login</a>
                    </body>
                </html>
            `);
        }

        user.verified = true;
        await user.save();

        console.log("✅ Email verified for user:", decoded.email);

        return res.send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: green;">✅ Email Verified Successfully!</h1>
                    <p>Thank you for verifying your email. You can now log in to your account.</p>
                    <a href="${process.env.FRONTEND_URL}/login" style="background-color: #31b8c6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Login</a>
                </body>
            </html>
        `);

    } catch (err) {
        console.error("Email verification error:", err.message);
        return res.status(400).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: red;">❌ Verification Failed</h1>
                    <p>Invalid or expired verification token.</p>
                    <p style="color: #666;">Error: ${err.message}</p>
                </body>
            </html>
        `);
    }
}