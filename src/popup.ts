import type { Settings } from "./types.js";

const kaggleInput = document.getElementById("kaggleUser") as HTMLInputElement;
const webhookInput = document.getElementById("webhook") as HTMLInputElement;
const saveBtn = document.getElementById("save") as HTMLButtonElement;
const status = document.getElementById("status") as HTMLParagraphElement;

// Load saved values
chrome.storage.sync.get(["kaggleUser", "webhook"], (data: Settings) => {
  if (data.kaggleUser) kaggleInput.value = data.kaggleUser;
  if (data.webhook) webhookInput.value = data.webhook;
});

saveBtn.addEventListener("click", async () => {
  const kaggleUser = kaggleInput.value.trim();
  const webhook = webhookInput.value.trim();

  if (!kaggleUser || !webhook) {
    status.textContent = "Please fill both fields.";
    return;
  }

  await chrome.storage.sync.set({ kaggleUser, webhook });
  status.textContent = "✅ Settings saved!";
});