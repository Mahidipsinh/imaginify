import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null, promise: null
    }
}


export const connectToDatabase = async () => {
    console.log("connectToDatabase called");
    if (!MONGODB_URL) {
        console.error("MONGODB_URL is not defined");
        throw new Error("MONGODB_URL is not defined");
    }
    if (cached.conn) {
        console.log("Using cached database connection");
        return cached.conn;
    }

    

    console.log("Connecting to MongoDB...");
    cached.promise =
        cached.promise ||
        mongoose.connect(MONGODB_URL, { dbName: 'Imaginify', bufferCommands: false })

    try {
        cached.conn = await cached.promise;
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database connection failed:", err);
        cached.conn = null;
        throw err;
    }

    return cached.conn;
}