"use strict";
const LOCAL_BRIDGE = "http://localhost:3000/activity";
const POLL_INTERVAL_MS = 5000;
let lastSent = null;
let startTs = Date.now();
function detectActivity() {
    const url = window.location.href;
    const title = document.title ? document.title.replace(/\s*\|\s*Kaggle.*$/i, "").trim() : url;
    let type = "other";
    let cleanTitle = title;
    if (/\/code\//i.test(url) || /\/kernel\//i.test(url)) {
        type = "notebook";
    }
    else if (/\/datasets\//i.test(url)) {
        type = "dataset";
    }
    else if (/\/competitions\//i.test(url)) {
        type = "competition";
    }
    else if (/\/profile\//i.test(url) || /\/users\//i.test(url)) {
        type = "profile";
    }
    else {
        type = "other";
    }
    const h1 = document.querySelector("h1");
    if (h1 && h1.textContent && h1.textContent.trim().length > 0) {
        cleanTitle = h1.textContent.trim();
    }
    return {
        type,
        title: cleanTitle,
        url,
        startedAt: startTs
    };
}
async function sendActivity(payload) {
    try {
        await fetch(LOCAL_BRIDGE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    }
    catch (err) {
    }
}
function activityEquals(a, b) {
    if (!a || !b)
        return false;
    return a.type === b.type && a.title === b.title && a.url === b.url;
}
function tick() {
    const act = detectActivity();
    if (!activityEquals(act, lastSent)) {
        act.startedAt = Date.now();
        lastSent = act;
        sendActivity(act);
    }
    else {
    }
}
tick();
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        startTs = Date.now();
        tick();
    }
});
setInterval(tick, POLL_INTERVAL_MS);
