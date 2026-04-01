import nodemailer from "nodemailer";

let transporter;

function initializeTransporter() {
    try {
        transporter = nodemailer.createTransport({
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
        })
        
        transporter.verify()
            .then(() => { 
                console.log("✅ Email transporter is ready to send emails"); 
            })
            .catch((err) => { 
                console.error("❌ Email transporter verification failed:", err.message); 
            });
    } catch (error) {
        console.error("❌ Failed to initialize email transporter:", error.message);
        throw error;
    }
}

// Initialize on module load
initializeTransporter();

export async function sendEmail({ to, subject, html, text }) {
    try {
        if (!transporter) {
            initializeTransporter();
        }

        const mailOptions = {
            from: `"Perplexity" <${process.env.GOOGLE_USER}>`,
            to,
            subject,
            html,
            text
        };

        const details = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully to:", to);
        return details;
    } catch (error) {
        console.error("❌ Failed to send email:", error.message);
        throw error;
    }
}