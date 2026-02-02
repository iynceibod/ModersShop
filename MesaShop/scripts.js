const tg = window.Telegram.WebApp;
const urlParams = new URLSearchParams(window.location.search);
const balls = urlParams.get("balls");
let currentPurchase = null;

document.addEventListener("DOMContentLoaded", () => {
    console.log('DOM fully loaded');
    
    const balanceElement = document.getElementById("user-balls");
    if (balanceElement) {
        balanceElement.textContent = balls ? `${balls} баллов` : "Недоступно";
    }
    
    try {
        tg.ready();
        tg.expand();
        tg.setBackgroundColor('#050505');
    } catch (error) {
    }
});

function calculateExchange() {
    const amount = parseInt(document.getElementById("exchangeAmount").value);
    const result = document.getElementById("exchangeResult");

    if (!amount || amount < 20) {
        result.textContent = "❌ Минимум 20 баллов для обмена";
        result.className = "exchange-result error-result";
        result.classList.remove("hidden");
        return;
    }

    const exp = amount * 150;
    result.textContent = `✅ ${amount} баллов = ${exp.toLocaleString("ru-RU")} опыта`;
    result.className = "exchange-result success-result";
    result.classList.remove("hidden");
}

function buyExchange() {
    const amount = parseInt(document.getElementById("exchangeAmount").value);
    if (!amount || amount < 20) {
        showNotification("❌ Минимум 20 баллов для обмена");
        return;
    }

    const balanceElement = document.getElementById("user-balls");
    const balanceText = balanceElement.textContent;
    const balance = parseInt(balanceText) || 0;
    if (amount > balance) {
        showNotification("❌ Недостаточно баллов");
        return;
    }

    const exp = amount * 150;

    currentPurchase = { 
        item: "exchange_exp", 
        amount: amount, 
        cost: amount 
    };

    const confirmMessage = document.getElementById('confirmMessage');
    const modal = document.getElementById('confirmModal');

    if (confirmMessage && modal) {
        confirmMessage.textContent = `Вы действительно хотите обменять ${amount} баллов на ${exp.toLocaleString("ru-RU")} опыта?`;
        modal.classList.remove('hidden');
    }
}

function buyDirect(item, cost, name) {
    currentPurchase = { item, cost, name }; 
    
    const confirmMessage = document.getElementById('confirmMessage');
    const modal = document.getElementById('confirmModal');
    
    if (confirmMessage && modal) {
        confirmMessage.textContent = `Вы действительно хотите купить "${name}" за ${cost} баллов?`;
        modal.classList.remove('hidden');
    }
}

function hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentPurchase = null;
}

function processPurchase() {
    if (!currentPurchase) return;

    hideConfirmModal();
    showLoading();      

    setTimeout(() => {
        try {
            let sendData;
            if (currentPurchase.item === "exchange_exp") {
                sendData = {
                    type: "shop_purchase",
                    item: currentPurchase.item,
                    amount: currentPurchase.amount,
                    cost: currentPurchase.amount
                };
            } else {
                sendData = {
                    type: "shop_purchase",
                    item: currentPurchase.item,
                    cost: currentPurchase.cost
                };
            }
            tg.sendData(JSON.stringify(sendData));
        } catch (e) {
        } finally {
            hideLoading();
        }
    }, 400);
}

function showLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
        loadingElement.classList.remove("hidden");
    }
}

function hideLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
        loadingElement.classList.add("hidden");
    }
}

function showNotification(message, type = "success") {
    const notificationElement = document.getElementById("notification");
    if (notificationElement) {
        notificationElement.textContent = message;
        notificationElement.className = `notification ${type}`;
        notificationElement.classList.remove("hidden");
        setTimeout(() => notificationElement.classList.add("hidden"), 3000);
    }
}
