"use server";

import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createUser(user: CreateUserParams) {
    try {
        console.log("createUser called with:", user);
        await connectToDatabase();
        console.log("Database connected successfully");

        // Validate required fields
        if (!user.clerkId || !user.email || !user.username || !user.photo) {
            console.error("Missing required fields:", { clerkId: !!user.clerkId, email: !!user.email, username: !!user.username, photo: !!user.photo });
            throw new Error("Missing required fields for user creation");
        }

        const newUser = await User.create(user);
        console.log("User created in database:", newUser);

        return JSON.parse(JSON.stringify(newUser));
    } catch (error) {
        console.error("Error in createUser:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        handleError(error);
    }
}

// READ
export async function getUserById(userId: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });

        if (!user) throw new Error("User not found");

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        handleError(error);
    }
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
    try {
        await connectToDatabase();

        const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
            new: true,
        });

        if (!updatedUser) throw new Error("User update failed");

        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        handleError(error);
    }
}

// DELETE
export async function deleteUser(clerkId: string) {
    try {
        await connectToDatabase();

        // Find user to delete
        const userToDelete = await User.findOne({ clerkId });

        if (!userToDelete) {
            throw new Error("User not found");
        }

        // Delete user
        const deletedUser = await User.findByIdAndDelete(userToDelete._id);
        revalidatePath("/");

        return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
    } catch (error) {
        handleError(error);
    }
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
    try {
        await connectToDatabase();
        const updatedUserCredits = await User.findOneAndUpdate(
            { _id: userId },
            { $inc: { creditBalance: creditFee } },
            { new: true }
        )

        if(!updatedUserCredits) throw new Error("Error while updating the credits of the user")

        return JSON.parse(JSON.stringify(updatedUserCredits));
    } catch (error) {
        handleError(error)
    }
}