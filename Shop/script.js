const tg = window.Telegram.WebApp;
const urlParams = new URLSearchParams(window.location.search);
const balls = urlParams.get("balls");
let currentPurchase = null;

document.getElementById("user-balls").innerText = balls ? `${balls} баллов` : "Недоступно";

tg.ready();
tg.expand();

tg.setBackgroundColor('#050505');

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
}
function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
}

function buyDirect(item, cost, name) {
    currentPurchase = { item, cost, name };

    const confirmMessage = document.getElementById('confirmMessage');
    const modal = document.getElementById('confirmModal');
    
    if (confirmMessage && modal) {
        confirmMessage.textContent = `Купить "${name}" за ${cost} баллов?`;
        modal.classList.remove('hidden');
    }
}

function hideConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
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
    }, 500);
}

function showNotification(message, type = "error") {
  const n = document.getElementById("notification");
  n.textContent = message;
  n.className = `notification ${type}`;
  n.classList.remove("hidden");
  setTimeout(() => n.classList.add("hidden"), 3000);
}

function adminReset() {
    localStorage.removeItem('nextSpinTime'); 
    
    if (timerInterval) clearInterval(timerInterval);
    
    enableSpinButton();
    
    alert("Таймер сброшен");
}

function buyItem(item, cost) {
  showLoading();
  setTimeout(() => {
    tg.sendData(JSON.stringify({ type: "shop_purchase", item, cost }));
    hideLoading();
  }, 400);
}

function calculateExchange() {
  const amount = parseInt(document.getElementById("exchangeAmount").value);
  const result = document.getElementById("exchangeResult");

  if (!amount || amount < 10) {
    result.textContent = "❌ Минимум 10 баллов для обмена";
    result.className = "exchange-result error-result";
    result.classList.remove("hidden");
    return;
  }

  const exp = amount * 250;
  result.textContent = `✅ ${amount} баллов = ${exp.toLocaleString("ru-RU")} опыта`;
  result.className = "exchange-result success-result";
  result.classList.remove("hidden");
}

function buyExchange() {
  const amount = parseInt(document.getElementById("exchangeAmount").value);
  if (!amount || amount < 10)
    return showNotification("❌ Минимум 10 баллов для обмена");

  showLoading();
  setTimeout(() => {
    tg.sendData(JSON.stringify({
      type: "shop_purchase",
      item: "exchange_exp",
      amount,
      cost: amount,
    }));
    hideLoading();
  }, 500);
}
function showNicknameForm() {
    document.getElementById('nicknameForm').classList.remove('hidden');
    document.getElementById('newNickname').focus();
}

function hideNicknameForm() {
    document.getElementById('nicknameForm').classList.add('hidden');
    document.getElementById('newNickname').value = '';
}

function buyNickname() {
    const nickname = document.getElementById('newNickname').value.trim();
    if (!nickname) {
        showNotification('❌ Введите новый никнейм');
        return;
    }
    showLoading();
    setTimeout(() => {
        tg.sendData(JSON.stringify({
            type: "shop_purchase",
            item: "change_nickname",
            nickname: nickname,
            cost: 50
        }));
        hideLoading();
    }, 500);
}

function showRoleForm() {
    document.getElementById('roleForm').classList.remove('hidden');
    document.getElementById('roleName').focus();
}

function hideRoleForm() {
    document.getElementById('roleForm').classList.add('hidden');
    document.getElementById('roleName').value = '';
    document.getElementById('roleColor').value = '';
}

function buyRole() {
    const roleName = document.getElementById('roleName').value.trim();
    const roleColor = document.getElementById('roleColor').value.trim();
    
    if (!roleName || !roleColor) {
        showNotification('❌ Заполните все поля');
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
            item: "create_personal_role",
            roleName: roleName,
            roleColor: roleColor,
            cost: 200
        }));
        hideLoading();
    }, 500);
}

document.getElementById('newNickname').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        buyNickname();
    }
});

document.getElementById('roleName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('roleColor').focus();
    }
});

document.getElementById('roleColor').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        buyRole();
    }
});


let isSpinning = false;
let rotation = 0;
let spinVelocity = 0;
let animationFrameId = null;
let timerInterval = null;
const spinDuration = 5000;

const prizes = [
    { text: "500 DP", weight: 100, icon: "fa-solid fa-coins" },
    { text: "1000 DP", weight: 50, icon: "fa-solid fa-sack-dollar" },
    { text: "50 баллов", weight: 30, icon: "fa-solid fa-star" },
    { text: "+1 предупреждение", weight: 10, icon: "fa-solid fa-triangle-exclamation" },
    { text: "Снятие любого наказания", weight: 3, icon: "fa-solid fa-handcuffs" },
    { text: "Отсутствие нормы на неделю", weight: 1, icon: "fa-solid fa-calendar-xmark" },
    { text: "Персональная роль", weight: 2, icon: "fa-solid fa-user-tag" },
    { text: "Понижение", weight: 0.01, icon: "fa-solid fa-arrow-trend-down" }
];
document.addEventListener("DOMContentLoaded", () => {
  renderPrizeList();
  checkPendingPrize();
});

function openRoulette() {
  const modal = document.getElementById("rouletteModal");
  modal.classList.remove("hidden");
  
  drawRoulette();
  resetUI();
  checkCooldown(); 
}

function closeRoulette() {
  document.getElementById("rouletteModal").classList.add("hidden");
  
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  isSpinning = false;
  if (timerInterval) clearInterval(timerInterval);
}

function checkPendingPrize() {
    const savedPrizeJson = localStorage.getItem('pendingPrize');
    
    if (savedPrizeJson) {
        const prize = JSON.parse(savedPrizeJson);
        
        const modal = document.getElementById("rouletteModal");
        modal.classList.remove("hidden");
        
        const index = prizes.findIndex(p => p.text === prize.text);
        
        if (index !== -1) {
            showResult(index);
        }
    }
}

function resetUI() {
  const resultDiv = document.getElementById("rouletteResult");
  const btn = document.getElementById("spinButton");
  
  resultDiv.classList.remove("visible");
  
  btn.disabled = false;
  btn.style.display = "block";
}

function checkCooldown() {
    const nextSpinTime = localStorage.getItem('nextSpinTime');
    const btn = document.getElementById("spinButton");

    if (!nextSpinTime) return false;

    const now = Date.now();
    const timeLeft = parseInt(nextSpinTime) - now;

    if (timeLeft > 0) {
        btn.disabled = true;
        btn.classList.add('cooldown');
        
        updateTimerText(timeLeft);
        
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            const newTimeLeft = parseInt(nextSpinTime) - Date.now();
            if (newTimeLeft <= 0) {
                clearInterval(timerInterval);
                enableSpinButton();
            } else {
                updateTimerText(newTimeLeft);
            }
        }, 1000);

        return true;
    } else {
        enableSpinButton();
        return false;
    }
}

function updateTimerText(ms) {
    const btn = document.getElementById("spinButton");
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    const h = hours < 10 ? "0" + hours : hours;
    const m = minutes < 10 ? "0" + minutes : minutes;
    const s = seconds < 10 ? "0" + seconds : seconds;

    btn.innerHTML = `Повтроное открытие: ${h}:${m}:${s}`;
}

function enableSpinButton() {
    const btn = document.getElementById("spinButton");
    btn.disabled = false;
    btn.classList.remove('cooldown');
    btn.innerHTML = "КРУТИТЬ";
    localStorage.removeItem('nextSpinTime'); 
}

function drawRoulette() {
  const canvas = document.getElementById("rouletteCanvas");
  const ctx = canvas.getContext("2d");
  const numSectors = prizes.length;
  const angle = (2 * Math.PI) / numSectors;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = Math.min(cx, cy) - 10;
  const colors = ["#2332ff", "#111", "#3163ff", "#151515", "#2332ff", "#111"];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numSectors; i++) {
    const start = angle * i + rotation;
    const end = start + angle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + angle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px 'Segoe UI', sans-serif";
    let text = prizes[i].text;
    if (text.length > 15) text = text.substring(0, 14) + "..";
    ctx.fillText(text, r - 15, 4);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 25, 0, 2 * Math.PI);
  ctx.fillStyle = "#0b0b0b";
  ctx.fill();
  ctx.strokeStyle = "#2b57ff";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function getWeightedPrizeIndex() {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  let rnd = Math.random() * totalWeight;
  for (let i = 0; i < prizes.length; i++) {
    rnd -= prizes[i].weight;
    if (rnd < 0) return i;
  }
  return prizes.length - 1;
}

function spinRoulette() {
  if (isSpinning) return;
  isSpinning = true;
  const btn = document.getElementById("spinButton");
  btn.disabled = true;

  const spinStartTime = Date.now();

  const targetIndex = getWeightedPrizeIndex();
  const numSectors = prizes.length;
  const anglePerSector = (2 * Math.PI) / numSectors;

  const targetSectorCenter = targetIndex * anglePerSector + anglePerSector / 2;
  const targetAngle = (3 * Math.PI / 2) - targetSectorCenter;
  const normalizedAngle = (targetAngle + 2 * Math.PI) % (2 * Math.PI);


  const extraRotations = 8; 
  const totalRotation = extraRotations * 2 * Math.PI + normalizedAngle;
  const startRotation = rotation;

  function animate() {
    const elapsed = Date.now() - spinStartTime;
    const progress = Math.min(elapsed / spinDuration, 1);

    const c1 = 1.70158;
    const c3 = c1 + 1;
    const easeOutBack = (x) =>
      1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);

    rotation = startRotation + totalRotation * easeOutBack(progress);
    drawRoulette();

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      showResult(targetIndex); 
    }
  }

  animationFrameId = requestAnimationFrame(animate);
}

function showResult(index) {
    const prize = prizes[index];
    const resultDiv = document.getElementById("rouletteResult");
    const spinBtn = document.getElementById("spinButton");
    const closeBtn = document.querySelector(".spin-close");
    const autoClaimDelay = 6000; // 6 секунд

    const cooldownTime = 24 * 60 * 60 * 1000;
    const nextSpin = Date.now() + cooldownTime;
    
    if (!localStorage.getItem('pendingPrize')) {
        localStorage.setItem('nextSpinTime', nextSpin);
        localStorage.setItem('pendingPrize', JSON.stringify(prize));
    }

    spinBtn.style.display = "none";
    if (closeBtn) closeBtn.style.display = "none";

    resultDiv.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; animation: fadeIn 0.5s;">
            
            <div style="font-size: 48px; color: #5d8aff; margin-bottom: 15px; filter: drop-shadow(0 0 20px rgba(93, 138, 255, 0.5));">
                <i class="${prize.icon}"></i>
            </div>
            
            <span style="color: #aaa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">
                Вы выиграли:
            </span>
            
            <span style="color: #fff; font-size: 24px; font-weight: 800; margin-bottom: 25px; text-align: center; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                ${prize.text}
            </span>

            <div style="width: 100%; background: #222; height: 4px; border-radius: 2px; overflow: hidden; position: relative;">
                <div id="autoClaimProgress" style="width: 100%; height: 100%; background: #4477ff; transition: width 6s linear;"></div>
            </div>
            <span id="autoStatus" style="color: #555; font-size: 10px; margin-top: 8px;">
                Приз выдан автоматически.
            </span>
        </div>
    `;

    resultDiv.classList.add("visible");
    resultDiv.classList.remove("hidden");
    
    checkCooldown();

    setTimeout(() => {
        const bar = document.getElementById("autoClaimProgress");
        if(bar) bar.style.width = "0%";
    }, 50);

    setTimeout(() => {
        claimPrize();
    }, autoClaimDelay); 
}

function claimPrize() {
    const savedPrizeJson = localStorage.getItem('pendingPrize');
    const statusText = document.getElementById("autoStatus");

    if (savedPrizeJson) {
        const prize = JSON.parse(savedPrizeJson);
        
        if (tg && tg.sendData) {
            try {
                tg.sendData(JSON.stringify({
                    type: "shop_purchase",
                    item: "roulette_spin",
                    prize: prize.text 
                }));
                
                localStorage.removeItem('pendingPrize');
                
                if (statusText) statusText.innerHTML = "✅ Приз зачислен.";
                setTimeout(() => tg.close(), 500);
                
            } catch (e) {
                if (statusText) statusText.innerHTML = "❌ ОШИБКА АВТО-ОТПРАВКИ! (См. консоль)";
            }
        } else {
            localStorage.removeItem('pendingPrize');
            if (statusText) statusText.innerHTML = "✅ Приз зачислен.";
            closeRoulette();
            document.querySelector(".spin-close").style.display = "block";
        }
    }
}

function renderPrizeList() {
    const list = document.getElementById("prizeList");
    list.innerHTML = prizes
        .map(p => `
            <li>
                <span class="prize-icon">
                    <i class="${p.icon}"></i>
                </span>
                ${p.text}
            </li>
        `)
        .join("");
}



