"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const discord_rich_presence_1 = __importDefault(require("discord-rich-presence"));
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv.config();
const DISCORD_CLIENT_ID = process.env.DISCORD_APP_CLIENT_ID;
if (!DISCORD_CLIENT_ID) {
    console.error("Please set DISCORD_CLIENT_ID in server.js (from Discord Developer Portal).");
    process.exit(1);
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const client = (0, discord_rich_presence_1.default)(DISCORD_CLIENT_ID);
let lastActivity = null;
function makePresencePayload(activity) {
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
    }
    else if (activity.type === "dataset") {
        base.details = `Viewing dataset: ${activity.title}`;
        base.state = "Browsing dataset";
    }
    else if (activity.type === "competition") {
        base.details = `Checking competition: ${activity.title}`;
        base.state = "Competition page";
    }
    else if (activity.type === "profile") {
        base.details = `Viewing profile: ${activity.title}`;
        base.state = "Profile";
    }
    return base;
}
app.post("/activity", (req, res) => {
    const body = req.body;
    if (!body || typeof body !== "object") {
        return res.status(400).send({ error: "Invalid payload" });
    }
    lastActivity = body;
    const payload = makePresencePayload(body);
    try {
        client.updatePresence(payload);
        console.log("Updated presence:", payload.details, payload.state);
        res.send({ ok: true });
    }
    catch (err) {
        console.error("RPC update error:", err);
        res.status(500).send({ error: "Failed to update presence" });
    }
});
// Optional: clear presence endpoint
app.post("/clear", (req, res) => {
    try {
        client.disconnect();
        console.log("Cleared presence (disconnected).");
        res.send({ ok: true });
    }
    catch (err) {
        res.status(500).send({ error: "Failed to clear presence" });
    }
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Kaggle RPC bridge running on http://localhost:${PORT}`);
});
