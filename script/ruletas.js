
// ===== CONFIGURACIÓN =====
const EXCHANGE_RATE = 3.8;

// ===== ESTADO DE LA APLICACIÓN =====
let appState = {
    currentCurrency: 'USD',
    hasClaimedWelcome: false,
    hasSpunThisMonth: false,
    totalBalance: 0,
    giftCards: []
};

// ===== FECHA Y MES =====
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();
const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ===== FUNCIONES DE MONEDA =====
function changeCurrency(currency) {
    appState.currentCurrency = currency;
    
    document.getElementById('usd-btn').classList.toggle('active', currency === 'USD');
    document.getElementById('pen-btn').classList.toggle('active', currency === 'PEN');

    updateAllAmounts();
}

function formatAmount(usd) {
    if (appState.currentCurrency === 'USD') {
        return `$${usd.toFixed(2)} USD`;
    } else {
        const penAmount = (usd * EXCHANGE_RATE).toFixed(2);
        return `S/${penAmount} PEN`;
    }
}

function updateAllAmounts() {
    // Welcome amount
    const welcomeAmount = document.getElementById('welcome-amount');
    if (welcomeAmount) {
        welcomeAmount.textContent = formatAmount(5);
    }

    // Total balance
    const totalBalance = document.getElementById('total-balance');
    if (totalBalance) {
        totalBalance.textContent = formatAmount(appState.totalBalance);
    }

    // Sidebar wallet
    const sidebarWallet = document.getElementById('sidebar-wallet');
    if (sidebarWallet) {
        if (appState.currentCurrency === 'USD') {
            sidebarWallet.textContent = `$${appState.totalBalance.toFixed(2)}`;
        } else {
            sidebarWallet.textContent = `S/${(appState.totalBalance * EXCHANGE_RATE).toFixed(2)}`;
        }
    }

    // Actualizar gift cards
    renderGiftCards();
}

// ===== FUNCIONES DE GIFT CARDS =====
function addGiftCard(type, value, description, isDiscount = false) {
    const giftCard = {
        id: Date.now(),
        type: type,
        value: value,
        description: description,
        isDiscount: isDiscount,
        active: true,
        claimedDate: new Date().toLocaleDateString('es-ES')
    };

    appState.giftCards.push(giftCard);
    
    // Solo sumar al balance si NO es descuento
    if (!isDiscount) {
        appState.totalBalance += value;
    }

    updateAllAmounts();
}

function renderGiftCards() {
    const container = document.getElementById('gift-cards-container');
    
    if (appState.giftCards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-gift"></i>
                <h3>No tienes gift cards activas aún</h3>
                <p>Reclama tu regalo de bienvenida o gira la ruleta mensual para obtener tus primeras recompensas.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = appState.giftCards.map(card => {
        const cardClass = card.isDiscount ? 'gift-card-item discount-card' : 'gift-card-item';
        const valueDisplay = card.isDiscount ? `${card.value}% OFF` : formatAmount(card.value);
        const iconClass = card.isDiscount ? 'percent' : 'gift';
        const statusText = card.isDiscount ? 'Disponible' : 'Activa';
        
        return `
            <div class="${cardClass}">
                <div class="gift-card-type">
                    <i class="fas fa-${iconClass}"></i> ${card.type}
                </div>
                <div class="gift-card-value">${valueDisplay}</div>
                <div class="gift-card-desc">${card.description}</div>
                <div class="gift-card-status">
                    <i class="fas fa-check-circle"></i> ${statusText}
                </div>
            </div>
        `;
    }).join('');
}

// ===== FUNCIONES DE REGALO DE BIENVENIDA =====
function claimWelcomeGift() {
    if (appState.hasClaimedWelcome) return;

    appState.hasClaimedWelcome = true;
    
    // Agregar gift card
    addGiftCard('Bienvenida', 5, 'Gift card de bienvenida. Válida para cualquier producto.', false);

    // Actualizar botón
    const btn = document.getElementById('claim-welcome');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-check"></i> Regalo Reclamado';

    // Habilitar ruleta
    enableWheel();

    // Mostrar modal
    const welcomePrize = document.getElementById('welcome-prize');
    welcomePrize.textContent = formatAmount(5);
    document.getElementById('welcome-modal').classList.add('active');
}

// ===== FUNCIONES DE RULETA =====
function enableWheel() {
    const spinBtn = document.getElementById('spin-btn');
    const spinInfo = document.getElementById('spin-info');
    
    spinBtn.disabled = false;
    spinInfo.innerHTML = `<i class="fas fa-calendar"></i> Disponible ahora - ¡Gira y gana!`;
}

function spinWheel() {
    if (appState.hasSpunThisMonth) {
        alert('Ya has girado la ruleta este mes. ¡Vuelve el próximo mes!');
        return;
    }

    if (!appState.hasClaimedWelcome) {
        alert('Primero debes reclamar tu regalo de bienvenida.');
        return;
    }

    const wheel = document.getElementById('wheel');
    const btn = document.getElementById('spin-btn');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Girando...';

    // Premios disponibles
    const prizes = [
        { 
            text: '$1 USD',
            value: 1,
            type: 'money',
            isDiscount: false,
            description: 'Premio de la ruleta mensual.',
            label: `Ruleta ${monthNames[currentMonth]} ${currentYear}`
        },
        { 
            text: '10% OFF',
            value: 10,
            type: 'discount',
            isDiscount: true,
            description: 'Aplica a 1 producto. No acumulable.',
            label: 'Descuento 10%'
        },
        { 
            text: '15% OFF',
            value: 15,
            type: 'discount',
            isDiscount: true,
            description: 'Aplica a 1 producto. No acumulable.',
            label: 'Descuento 15%'
        },
        { 
            text: '20% OFF',
            value: 20,
            type: 'discount',
            isDiscount: true,
            description: 'Aplica a 1 producto. No acumulable.',
            label: 'Descuento 20%'
        }
    ];

    // Seleccionar premio aleatorio
    const randomIndex = Math.floor(Math.random() * 4);
    const selectedPrize = prizes[randomIndex];
    
    // Calcular rotación (cada segmento es 90 grados)
    const baseRotation = 3600; // 10 vueltas completas
    const randomExtraDegrees = Math.random() * 60 + 15; // 15-75 grados extra para más realismo
    const segmentRotation = randomIndex * 90 + randomExtraDegrees;
    const finalRotation = baseRotation + segmentRotation;

    // Aplicar rotación
    wheel.style.transform = `rotate(${finalRotation}deg)`;

    // Después de la animación (5 segundos)
    setTimeout(() => {
        appState.hasSpunThisMonth = true;
        
        // Agregar premio
        addGiftCard(
            selectedPrize.label, 
            selectedPrize.value, 
            selectedPrize.description, 
            selectedPrize.isDiscount
        );

        // Mostrar modal con premio
        const prizeText = document.getElementById('prize-text');
        prizeText.textContent = selectedPrize.isDiscount 
            ? `${selectedPrize.value}% OFF` 
            : formatAmount(selectedPrize.value);
        
        document.getElementById('prize-modal').classList.add('active');

        // Actualizar botón y mensaje
        btn.innerHTML = '<i class="fas fa-check"></i> Ya Giraste Este Mes';
        
        const spinInfo = document.getElementById('spin-info');
        spinInfo.innerHTML = `<i class="fas fa-calendar"></i> Próxima ruleta disponible: 1 de ${monthNames[nextMonth]} ${nextMonthYear}`;
    }, 5000);
}

// ===== FUNCIONES DE MODAL =====
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar
    updateAllAmounts();

    // Currency buttons
    document.getElementById('usd-btn').addEventListener('click', () => changeCurrency('USD'));
    document.getElementById('pen-btn').addEventListener('click', () => changeCurrency('PEN'));

    // Claim welcome button
    document.getElementById('claim-welcome').addEventListener('click', claimWelcomeGift);

    // Spin button
    document.getElementById('spin-btn').addEventListener('click', spinWheel);

    // Cerrar modal al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });

    // Cerrar modal con botón cerrar (ya está conectado con onclick en HTML)
});
