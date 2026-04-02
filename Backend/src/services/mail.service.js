import nodemailer from "nodemailer";

let transporter;
let lastError = null;

function initializeTransporter() {
    try {
        const config = {
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                type: 'OAuth2',
                user: process.env.GOOGLE_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            }
        };

        console.log("📧 Initializing email transporter with config:", {
            host: config.host,
            port: config.port,
            user: config.auth.user?.substring(0, 10) + "***"
        });

        transporter = nodemailer.createTransport(config);
        
        transporter.verify()
            .then(() => { 
                console.log("✅ Email transporter verified and ready to send emails"); 
                lastError = null;
            })
            .catch((err) => { 
                lastError = err;
                console.error("❌ Email transporter verification failed:", err.message); 
                console.error("Error details:", err);
            });
    } catch (error) {
        lastError = error;
        console.error("❌ Failed to initialize email transporter:", error.message);
        console.error("Stack:", error.stack);
    }
}

// Initialize on module load
initializeTransporter();

export async function sendEmail({ to, subject, html, text }) {
    try {
        if (!transporter) {
            console.warn("⚠️ Transporter not initialized, reinitializing...");
            initializeTransporter();
        }

        if (!process.env.GOOGLE_USER || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
            throw new Error("Missing required Gmail OAuth2 environment variables");
        }

        const mailOptions = {
            from: `"Perplexity" <${process.env.GOOGLE_USER}>`,
            to,
            subject,
            html,
            text
        };

        console.log("📧 Sending email to:", to);
        const details = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully to:", to);
        lastError = null;
        return details;
    } catch (error) {
        lastError = error;
        console.error("❌ Failed to send email:", error.message);
        console.error("📧 Email error details:", {
            code: error.code,
            command: error.command,
            response: error.response,
            transporeterReady: transporter !== null
        });
        throw error;
    }
}

export function getEmailStatus() {
    return {
        transporter: transporter !== null ? "initialized" : "not initialized",
        lastError: lastError ? lastError.message : null,
        config: {
            googleUser: process.env.GOOGLE_USER ? "✅" : "❌",
            clientId: process.env.GOOGLE_CLIENT_ID ? "✅" : "❌",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "✅" : "❌",
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN ? "✅" : "❌"
        }
    }
}