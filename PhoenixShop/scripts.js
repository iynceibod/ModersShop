const tg = window.Telegram.WebApp;
const urlParams = new URLSearchParams(window.location.search);
const balls = urlParams.get("balls");

let currentPurchase = null;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded");

    const balanceElement = document.getElementById("user-balls");
    if (balanceElement) {
        balanceElement.textContent = balls ? `${balls} баллов` : "Недоступно";
    }

    try {
        tg.ready();
        tg.expand();
        tg.setBackgroundColor("#050505");
    } catch (e) {
        console.error("Telegram init error", e);
    }

    document.getElementById("roleName")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") document.getElementById("roleColor")?.focus();
    });

    document.getElementById("roleColor")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") buyPersonalRole();
    });

    document.getElementById("channelName")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") buyPersonalChannel();
    });

    const expInput = document.getElementById("exchangeAmount");
    if (expInput) {
        expInput.addEventListener("input", calculateExchange);
        expInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") buyExchange();
        });
    }
});


function calculateExchange() {
    const amountInput = document.getElementById("exchangeAmount");
    const result = document.getElementById("exchangeResult");
    const amount = parseInt(amountInput.value) || 0;

    if (!result) return;
    result.classList.remove("hidden");

    if (amount < 20) {
        result.textContent = "❌ Минимум 20 баллов";
        result.className = "exchange-result error-result";
    } else if (amount % 20 !== 0) {
        result.textContent = "❌ Должно быть кратно 20";
        result.className = "exchange-result error-result";
    } else {
        const exp = amount * 150;
        result.textContent = `✅ ${amount} баллов = ${exp.toLocaleString("ru-RU")} опыта`;
        result.className = "exchange-result success-result";
    }
}

function buyExchange() {
    const amount = parseInt(document.getElementById("exchangeAmount").value);

    if (!amount || amount < 20) return showNotification("❌ Минимум 20 баллов", "error");

    showLoading();
    setTimeout(() => {
        tg.sendData(JSON.stringify({
            type: "shop_purchase",
            item: "exchange_exp",
            amount: amount,
            cost: amount
        }));
        hideLoading();
    }, 500);
}

function buyDirect(item, cost, name) {
    currentPurchase = { item, cost, name };
    const modal = document.getElementById("confirmModal");
    const text = document.getElementById("confirmMessage");

    if (modal && text) {
        text.textContent = `Вы действительно хотите купить «${name}» за ${cost} баллов?`;
        modal.classList.remove("hidden");
    }
}

function processPurchase() {
    if (!currentPurchase) return;
    hideConfirmModal();
    showLoading();

    setTimeout(() => {
        tg.sendData(JSON.stringify({
            type: "shop_purchase",
            item: currentPurchase.item,
            cost: currentPurchase.cost
        }));
        hideLoading();
    }, 400);
}

function hideConfirmModal() {
    document.getElementById("confirmModal")?.classList.add("hidden");
    currentPurchase = null;
}

function showRoleForm() { document.getElementById("roleForm")?.classList.remove("hidden"); }
function hideRoleForm() { document.getElementById("roleForm")?.classList.add("hidden"); }

function buyPersonalRole() {
    const name = document.getElementById("roleName").value.trim();
    const color = document.getElementById("roleColor").value.trim();

    if (!name) return showNotification("❌ Введите название для роли", "error");
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) return showNotification("❌ Цвет в формате #RRGGBB", "error");

    showLoading();
    setTimeout(() => {
        tg.sendData(JSON.stringify({
            type: "shop_purchase",
            item: "personal_role_30",
            roleName: name,
            roleColor: color,
            cost: 300
        }));
        hideLoading();
        hideRoleForm();
    }, 500);
}


function showChannelForm() { document.getElementById("channelForm")?.classList.remove("hidden"); }
function hideChannelForm() { document.getElementById("channelForm")?.classList.add("hidden"); }

function buyPersonalChannel() {
    const name = document.getElementById("channelName").value.trim();
    if (!name) return showNotification("❌ Введите название для канала", "error");

    showLoading();
    setTimeout(() => {
        tg.sendData(JSON.stringify({
            type: "shop_purchase",
            item: "personal_channel_30",
            channelName: name,
            cost: 300
        }));
        hideLoading();
        hideChannelForm();
    }, 500);
}

function showLoading() { document.getElementById("loading")?.classList.remove("hidden"); }
function hideLoading() { document.getElementById("loading")?.classList.add("hidden"); }

function showNotification(text, type = "success") {
    const n = document.getElementById("notification");
    if (!n) return;
    n.textContent = text;
    n.className = `notification ${type}`;
    n.classList.remove("hidden");
    setTimeout(() => n.classList.add("hidden"), 3000);
}
