/* eslint-disable camelcase */
import { createTransaction } from "@/lib/actions/transaction.actions";
import { NextResponse } from "next/server";
import stripe from "stripe";

export async function POST(request: Request) {
    const body = await request.text();
    console.log("Received webhook request");

    const sig = request.headers.get("stripe-signature") as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
        console.log("Webhook event constructed successfully:", event.type);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ message: "Webhook error", error: err });
    }

    // Get the ID and type
    const eventType = event.type;
    console.log("Processing event type:", eventType);

    // CREATE
    if (eventType === "checkout.session.completed") {
        const { id, amount_total, metadata } = event.data.object;
        console.log("Processing checkout session:", { id, amount_total, metadata });

        const transaction = {
            stripeId: id,
            amount: amount_total ? amount_total / 100 : 0,
            plan: metadata?.plan || "",
            credits: Number(metadata?.credits) || 0,
            buyerId: metadata?.buyerId || "",
            createdAt: new Date(),
        };
        console.log("Creating transaction:", transaction);

        try {
            const newTransaction = await createTransaction(transaction);
            console.log("Transaction created successfully:", newTransaction);
            return NextResponse.json({ message: "OK", transaction: newTransaction });
        } catch (error) {
            console.error("Error creating transaction:", error);
            return NextResponse.json({ message: "Error creating transaction", error }, { status: 500 });
        }
    }

    return new Response("", { status: 200 });
}