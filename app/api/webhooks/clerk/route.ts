/* eslint-disable camelcase */
import { clerkClient } from '@clerk/nextjs/server'
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
    console.log("Webhook received");
    const client = await clerkClient();
   
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("WEBHOOK_SECRET is not defined");
        throw new Error(
            "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
        );
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error("Missing svix headers");
        return new Response("Error occured -- no svix headers", {
            status: 400,
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
        console.log("Webhook verified successfully");
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occured", {
            status: 400,
        });
    }

    // Get the ID and type
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Processing webhook event: ${eventType} for user: ${id}`);

    // CREATE
    if (eventType === "user.created") {
        console.log("Processing user.created event");
        const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;
        console.log("User data from webhook:", { id, email_addresses, image_url, first_name, last_name, username });
        
        // Retrieves the user data from the evt.data
        const user = {
            clerkId: id,
            email: email_addresses[0].email_address,
            username: username || id,
            firstName: first_name || "",
            lastName: last_name || "",
            photo: image_url,
        };

        console.log("Creating user with data:", user);

        try {
            const newUser = await createUser(user);
            console.log("User created successfully:", newUser);
            
            // Above function creates the new User in the MongoDB and returns it to newUser
            // Set public metadata
            if (newUser) {
                await client.users.updateUserMetadata(id, {
                    publicMetadata: {
                        userId: newUser._id,
                    },
                });
                console.log("User metadata updated successfully");
            }
            // Above just simply merges the clerk ID with our database user ID
            
            return NextResponse.json({ message: "OK", user: newUser });
        } catch (error) {
            console.error("Error creating user:", error);
            return NextResponse.json({ message: "Error creating user", error: error }, { status: 500 });
        }
    }

    // UPDATE
    if (eventType === "user.updated") {
        console.log("Processing user.updated event");
        const { id, image_url, first_name, last_name, username } = evt.data;

        const user = {
            firstName: first_name || "",
            lastName: last_name || "",
            userName: username!,
            photo: image_url,
        };

        const updatedUser = await updateUser(id, user);

        return NextResponse.json({ message: "OK", user: updatedUser });
    }

    // DELETE
    if (eventType === "user.deleted") {
        console.log("Processing user.deleted event");
        const { id } = evt.data;

        const deletedUser = await deleteUser(id!);

        return NextResponse.json({ message: "OK", user: deletedUser });
    }

    console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
    console.log("Webhook body:", body);

    return new Response("", { status: 200 });
}
