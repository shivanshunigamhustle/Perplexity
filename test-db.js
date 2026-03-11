import "dotenv/config";
import mongoose from "mongoose";

console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("All env vars:", Object.keys(process.env).filter(k => k.includes('MONGO')));

const dbUri = process.env.MONGODB_URI || "mongodb+srv://Shivanshunigam:Shivanshu100@shivanshu.npzqavr.mongodb.net/perplexity";

mongoose.connect(dbUri)
    .then(() => {
        console.log("✓ MongoDB connected successfully!");
        process.exit(0);
    })
    .catch(err => {
        console.error("✗ MongoDB connection failed:", err.message);
        process.exit(1);
    });
