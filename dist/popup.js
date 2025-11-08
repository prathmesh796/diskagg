const kaggleInput = document.getElementById("kaggleUser");
const webhookInput = document.getElementById("webhook");
const saveBtn = document.getElementById("save");
const status = document.getElementById("status");
// Load saved values
chrome.storage.sync.get(["kaggleUser", "webhook"], (data) => {
    if (data.kaggleUser)
        kaggleInput.value = data.kaggleUser;
    if (data.webhook)
        webhookInput.value = data.webhook;
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
export {};
//# sourceMappingURL=popup.js.map