import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://Shivanshunigam:Shivanshu100@shivanshu.npzqavr.mongodb.net/perplexity";
    console.log("Connecting to MongoDB with URI:", mongoUri);
    console.log("process.env.MONGODB_URI:", process.env.MONGODB_URI);
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;