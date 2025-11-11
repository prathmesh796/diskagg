type ActivityType = "notebook" | "dataset" | "competition" | "profile" | "other";

interface ActivityPayload {
  type: ActivityType;
  title: string;
  url: string;
  startedAt?: number;
}

const LOCAL_BRIDGE = "http://localhost:3000/activity";
const POLL_INTERVAL_MS = 5000; // 5s

let lastSent: ActivityPayload | null = null;
let startTs = Date.now();

function detectActivity(): ActivityPayload {
  const url = window.location.href;
  const title = document.title ? document.title.replace(/\s*\|\s*Kaggle.*$/i, "").trim() : url;
  let type: ActivityPayload["type"] = "other";
  let cleanTitle = title;

  if (/\/code\//i.test(url) || /\/kernel\//i.test(url)) {
    type = "notebook";
    // Usually title contains notebook title
  } else if (/\/datasets\//i.test(url)) {
    type = "dataset";
  } else if (/\/competitions\//i.test(url)) {
    type = "competition";
  } else if (/\/profile\//i.test(url) || /\/users\//i.test(url)) {
    type = "profile";
  } else {
    type = "other";
  }

  // Try to extract a friendly title from the page
  // Many Kaggle pages put the resource title in <h1> or document.title before the '| Kaggle'
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

async function sendActivity(payload: ActivityPayload) {
  try {
    await fetch(LOCAL_BRIDGE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    // console.log("Sent activity to bridge:", payload);
  } catch (err) {
    // Local bridge might not be running — ignore silently (or optionally show console warning).
    // console.warn("Could not reach RPC bridge:", err);
  }
}

function activityEquals(a?: ActivityPayload | null, b?: ActivityPayload | null) {
  if (!a || !b) return false;
  return a.type === b.type && a.title === b.title && a.url === b.url;
}

function tick() {
  const act = detectActivity();
  // If changed, reset startedAt
  if (!activityEquals(act, lastSent)) {
    act.startedAt = Date.now();
    lastSent = act;
    sendActivity(act);
  } else {
    // occasionally resend to refresh presence timestamps (if you want)
    // sendActivity(act);
  }
}

// immediate run
tick();

// also run on visibility change (tab switches)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    startTs = Date.now();
    tick();
  }
});

// poll periodically
setInterval(tick, POLL_INTERVAL_MS);