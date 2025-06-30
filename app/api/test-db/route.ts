import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";

export async function GET() {
    try {
        console.log("Testing database connection...");
        await connectToDatabase();
        console.log("Database connection successful");

        // Test creating a user
        const testUser = {
            clerkId: "test_clerk_id_" + Date.now(),
            email: "test@example.com",
            username: "testuser_" + Date.now(),
            firstName: "Test",
            lastName: "User",
            photo: "https://example.com/photo.jpg",
        };

        console.log("Creating test user:", testUser);
        const newUser = await User.create(testUser);
        console.log("Test user created:", newUser);

        // Clean up - delete the test user
        await User.findByIdAndDelete(newUser._id);
        console.log("Test user deleted");

        return NextResponse.json({ 
            message: "Database connection and user creation test successful",
            testUser: newUser 
        });
    } catch (error) {
        console.error("Database test failed:", error);
        return NextResponse.json({ 
            error: "Database test failed", 
            details: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
} 