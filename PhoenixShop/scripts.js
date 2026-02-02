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
        console.log('Telegram WebApp initialized');
    } catch (error) {
    }
    
    const roleNameInput = document.getElementById('roleName');
    if (roleNameInput) {
        roleNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const roleColorInput = document.getElementById('roleColor');
                if (roleColorInput) roleColorInput.focus();
            }
        });
    }
    
    const roleColorInput = document.getElementById('roleColor');
    if (roleColorInput) {
        roleColorInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') buyPersonalRole();
        });
    }
    
    const channelNameInput = document.getElementById('channelName');
    if (channelNameInput) {
        channelNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') buyPersonalChannel();
        });
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

function showRoleForm() {
    console.log('Открытие формы для роли');
    const modal = document.getElementById('roleForm');
    if (modal) {
        modal.classList.remove('hidden');
        const roleNameInput = document.getElementById('roleName');
        if (roleNameInput) roleNameInput.focus();
    }
}

function hideRoleForm() {
    const modal = document.getElementById('roleForm');
    if (modal) {
        modal.classList.add('hidden');
        const roleNameInput = document.getElementById('roleName');
        const roleColorInput = document.getElementById('roleColor');
        if (roleNameInput) roleNameInput.value = '';
        if (roleColorInput) roleColorInput.value = '';
    }
}

function buyPersonalRole() {
    console.log('Покупка личной роли');
    
    const roleNameInput = document.getElementById('roleName');
    const roleColorInput = document.getElementById('roleColor');
    
    if (!roleNameInput || !roleColorInput) {
        showNotification('❌ Форма не найдена');
        return;
    }
    
    const roleName = roleNameInput.value.trim();
    const roleColor = roleColorInput.value.trim();
    
    if (!roleName) {
        showNotification('❌ Введите название роли');
        return;
    }
    
    if (!roleColor) {
        showNotification('❌ Введите цвет роли');
        return;
    }
    
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(roleColor)) {
        showNotification('❌ Неверный формат цвета. Используйте формат #RRGGBB');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        tg.sendData(JSON.stringify({
            type: "shop_purchase",
            item: "personal_role_30",
            roleName: roleName,
            roleColor: roleColor,
            cost: 300
        }));
        hideLoading();
        hideRoleForm();
    }, 500);
}

function showChannelForm() {
    console.log('Открытие формы для канала');
    const modal = document.getElementById('channelForm');
    if (modal) {
        modal.classList.remove('hidden');
        const channelNameInput = document.getElementById('channelName');
        if (channelNameInput) channelNameInput.focus();
    }
}

function hideChannelForm() {
    const modal = document.getElementById('channelForm');
    if (modal) {
        modal.classList.add('hidden');
        const channelNameInput = document.getElementById('channelName');
        if (channelNameInput) channelNameInput.value = '';
    }
}

function buyPersonalChannel() {
    console.log('Покупка личного канала');
    
    const channelNameInput = document.getElementById('channelName');
    if (!channelNameInput) {
        showNotification('❌ Форма не найдена');
        return;
    }
    
    const channelName = channelNameInput.value.trim();
    
    if (!channelName) {
        showNotification('❌ Введите название канала');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        tg.sendData(JSON.stringify({
            type: "shop_purchase",
            item: "personal_channel_30",
            channelName: channelName,
            cost: 300
        }));
        hideLoading();
        hideChannelForm();
    }, 500);
}

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

function showLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
        loadingElement.classList.remove("hidden");
    }
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
            showNotification('❌ Ошибка при отправке данных');
        } finally {
            hideLoading();
        }
    }, 400);
}

function hideLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
        loadingElement.classList.add("hidden");
    }
}

function hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentPurchase = null;
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
