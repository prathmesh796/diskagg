import express from "express";
import bodyParser from "body-parser";
import rpc from "discord-rich-presence";
import * as dotenv from 'dotenv'
import { Request, Response } from "express";
import cors from "cors";

dotenv.config()

const DISCORD_CLIENT_ID = process.env.DISCORD_APP_CLIENT_ID;

if (!DISCORD_CLIENT_ID) {
    console.error("Please set DISCORD_CLIENT_ID in server.js (from Discord Developer Portal).");
    process.exit(1);
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = rpc(DISCORD_CLIENT_ID);

let lastActivity = null;

function makePresencePayload(activity: any) {
    // Map activity types to presence fields
    const base = {
        details: activity.title,
        state: `On Kaggle (${activity.type})`,
        startTimestamp: activity.startedAt || Date.now(),
        largeImageKey: "kaggle_logo", // you must upload this asset in your Discord App
        largeImageText: "Kaggle",
        smallImageKey: "coding", // optional - use an uploaded asset or remove
        smallImageText: "Working",
    };

    // adjust details based on type
    if (activity.type === "notebook") {
        base.details = `Working on: ${activity.title}`;
        base.state = "Editing notebook";
    } else if (activity.type === "dataset") {
        base.details = `Viewing dataset: ${activity.title}`;
        base.state = "Browsing dataset";
    } else if (activity.type === "competition") {
        base.details = `Checking competition: ${activity.title}`;
        base.state = "Competition page";
    } else if (activity.type === "profile") {
        base.details = `Viewing profile: ${activity.title}`;
        base.state = "Profile";
    }

    return base;
}

app.post("/activity", (req: Request, res: Response) => {
    const body = req.body;
    if (!body || typeof body !== "object") {
        return res.status(400).send({ error: "Invalid payload" });
    }

    lastActivity = body;
    const payload = makePresencePayload(body);

    try {
        client.updatePresence(payload);
        console.log("Updated presence:", payload.details, payload.state);
        (res as any).send({ ok: true });
    } catch (err) {
        console.error("RPC update error:", err);
        (res as any).status(500).send({ error: "Failed to update presence" });
    }
});

// Optional: clear presence endpoint
app.post("/clear", (req: Request, res: Response) => {
    try {
        client.disconnect();
        console.log("Cleared presence (disconnected).");
        (res as any).send({ ok: true });
    } catch (err) {
        (res as any).status(500).send({ error: "Failed to clear presence" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Kaggle RPC bridge running on http://localhost:${PORT}`);
});