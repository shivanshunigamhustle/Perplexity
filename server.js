import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { testAI } from "./src/services/ai.service.js";
const PORT = process.env.PORT || 3000;

connectDB()
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});