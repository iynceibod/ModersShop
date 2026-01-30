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

    const { item, cost } = currentPurchase;
    
    hideConfirmModal();
    showLoading();      
    
    setTimeout(() => {
        try {
            tg.sendData(JSON.stringify({
                type: "shop_purchase",
                item: item,
                cost: cost
            }));
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