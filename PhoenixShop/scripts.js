const tg = window.Telegram.WebApp;
const urlParams = new URLSearchParams(window.location.search);
const balls = urlParams.get("balls");

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
        console.error('Error initializing Telegram WebApp:', error);
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
    
    showLoading();
    setTimeout(() => {
        tg.sendData(JSON.stringify({
            type: "shop_purchase",
            item: item,
            cost: cost
        }));
        hideLoading();
    }, 400);
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
    
    showNotification(`✅ Запрос на создание канала "${channelName}" отправлен`, 'success');
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
