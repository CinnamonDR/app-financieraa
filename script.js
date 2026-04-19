// CONFIGURACIÓN DE API (Tu clave integrada)
const API_KEY = '08033232e6908afbc5fde2bf'; 
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/DOP`;

// Monedas a rastrear (12)
const targetCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'CHF', 'JPY', 'BRL', 'MXN', 'CNY', 'RUB', 'AUD', 'ARS'];

// Nombres legibles para el calculador
const currencyNames = {
    'USD': 'Dólar Estadounidense', 'EUR': 'Euro', 'GBP': 'Libra Esterlina',
    'CAD': 'Dólar Canadiense', 'CHF': 'Franco Suizo', 'JPY': 'Yen Japonés',
    'BRL': 'Real Brasileño', 'MXN': 'Peso Mexicano', 'CNY': 'Yuan Chino',
    'RUB': 'Rublo Ruso', 'AUD': 'Dólar Australiano', 'ARS': 'Peso Argentino'
};

let rates = {};

// 1. OBTENER DATOS DE LA API
async function fetchRates() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();
        
        if(data.result === "success") {
            rates = data.conversion_rates;
            document.getElementById('lastUpdate').innerText = `LAST_SYNC: ${new Date().toLocaleTimeString()}`;
            renderCards();
            initCalculator();
        } else {
            throw new Error("Error en respuesta de API");
        }
    } catch (error) {
        console.error("Error fetching rates:", error);
        document.getElementById('lastUpdate').innerText = "ERROR_CONEXION_API";
    }
}

// 2. RENDERIZAR TARJETAS
function renderCards() {
    const grid = document.getElementById('currencyGrid');
    grid.innerHTML = '';

    targetCurrencies.forEach(code => {
        const rateAgainstDOP = (1 / rates[code]).toFixed(2); // Valor de 1 moneda en DOP
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 col-xl-3';
        
        card.innerHTML = `
            <div class="glass-card currency-card border-neon-blue h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                        <img src="https://flagcdn.com/w40/${getCountryCode(code)}.png" class="flag-icon">
                        <span class="font-code text-white">${code}</span>
                    </div>
                    <span class="text-neon-yellow">DOP ${rateAgainstDOP}</span>
                </div>
                <div id="chart-${code}" class="mt-auto"></div>
            </div>
        `;
        grid.appendChild(card);
        createChart(code, rateAgainstDOP);
    });
}

// 3. GRÁFICOS APEXCHARTS
function createChart(code, currentRate) {
    const historyData = [];
    for(let i=0; i<8; i++) { // 8 puntos de datos para mejor visual
        const volatility = (Math.random() * 0.04) - 0.02; 
        historyData.push((parseFloat(currentRate) * (1 + volatility)).toFixed(2));
    }

    const options = {
        series: [{ name: 'Tasa (DOP)', data: historyData }],
        chart: { type: 'area', height: 100, sparkline: { enabled: true }, animations: { enabled: true, speed: 1000 } },
        stroke: { curve: 'smooth', width: 2, colors: ['#00f3ff'] },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0 } },
        colors: ['#00f3ff'],
        tooltip: { theme: 'dark' }
    };

    new ApexCharts(document.querySelector(`#chart-${code}`), options).render();
}

// 4. CALCULADOR MAESTRO (ACTUALIZADO PARA 12 MONEDAS)
function initCalculator() {
    const amountInput = document.getElementById('calcAmount');
    const targetSelect = document.getElementById('calcTarget');
    const resultDisplay = document.getElementById('calcResult');
    const symbolDisplay = document.getElementById('calcSymbol');

    // Llenar el Select dinámicamente con las 12 monedas
    targetSelect.innerHTML = ''; // Limpiar
    targetCurrencies.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.innerText = `${code} - ${currencyNames[code] || ''}`;
        targetSelect.appendChild(option);
    });

    const updateCalc = () => {
        const amount = amountInput.value || 0;
        const target = targetSelect.value;
        const rate = rates[target]; // 1 DOP = X Moneda
        const result = (amount * rate).toFixed(2);
        
        resultDisplay.innerText = result;
        symbolDisplay.innerText = target;
    };

    amountInput.addEventListener('input', updateCalc);
    targetSelect.addEventListener('change', updateCalc);
    updateCalc(); // Ejecución inicial
}

function getCountryCode(currency) {
    const mapping = { 'USD':'us', 'EUR':'eu', 'GBP':'gb', 'CAD':'ca', 'CHF':'ch', 'JPY':'jp', 'BRL':'br', 'MXN':'mx', 'CNY':'cn', 'RUB':'ru', 'AUD':'au', 'ARS':'ar' };
    return mapping[currency] || 'us';
}

window.onload = fetchRates;