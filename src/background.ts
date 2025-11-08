import type { Settings } from "./types.js";

chrome.alarms.create("checkKaggle", { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "checkKaggle") return;

  const { kaggleUser, webhook, lastMedalCount } = await chrome.storage.sync.get([
    "kaggleUser",
    "webhook",
    "lastMedalCount"
  ]) as Settings;

  if (!kaggleUser || !webhook) return;

  try {
    const res = await fetch(`https://www.kaggle.com/${kaggleUser}`);
    const html = await res.text();

    const medalMatches = html.match(/Medal/g) || [];
    const currentCount = medalMatches.length;

    if (currentCount > (lastMedalCount ?? 0)) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🏅 ${kaggleUser} just earned a new Kaggle medal! Total: ${currentCount}`
        })
      });

      await chrome.storage.sync.set({ lastMedalCount: currentCount });
    }
  } catch (err) {
    console.error("Error fetching Kaggle data:", err);
  }
});
