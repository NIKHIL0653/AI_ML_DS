// API Configuration
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const MODEL_API_BASE = 'http://localhost:5000'; // Backend API endpoint

// DOM Elements
const welcomeScreen = document.querySelector('.welcome-screen');
const searchInput = document.querySelector('#coinSearch');
const suggestionsBox = document.querySelector('.suggestions');
const container = document.querySelector('.container');
const priceChart = document.querySelector('#priceChart');
let chart = null;

// State Management
let selectedCoin = null;
let coinList = [];
let priceData = [];

// Initialize the application
async function initApp() {
    try {
        const response = await fetch(`${COINGECKO_API_BASE}/coins/list`);
        coinList = await response.json();
        setupEventListeners();
    } catch (error) {
        showError('Failed to initialize application. Please try again later.');
    }
}

// Event Listeners Setup
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', () => {
        if (searchInput.value) {
            suggestionsBox.style.display = 'block';
        }
    });
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });
}

// Search Handling
async function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) {
        suggestionsBox.style.display = 'none';
        return;
    }

    const matches = coinList.filter(coin => 
        coin.name.toLowerCase().includes(query) || 
        coin.symbol.toLowerCase().includes(query)
    ).slice(0, 5);

    displaySuggestions(matches);
}

function displaySuggestions(matches) {
    if (!matches.length) {
        suggestionsBox.style.display = 'none';
        return;
    }

    suggestionsBox.innerHTML = matches.map(coin => `
        <div class="suggestion-item" onclick="selectCoin('${coin.id}')">
            <img src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" onerror="this.src='placeholder.png'" alt="${coin.name}">
            <span>${coin.name} (${coin.symbol.toUpperCase()})</span>
        </div>
    `).join('');
    
    suggestionsBox.style.display = 'block';
}

// Coin Selection and Data Loading
async function selectCoin(coinId) {
    selectedCoin = coinId;
    suggestionsBox.style.display = 'none';
    welcomeScreen.classList.add('minimized');
    container.classList.add('show');
    
    showLoading();
    await Promise.all([
        loadCoinData(),
        loadPriceHistory(),
        loadPredictions(),
        loadSentimentAnalysis()
    ]);
    hideLoading();
}

// Data Loading Functions
async function loadCoinData() {
    try {
        const response = await fetch(`${COINGECKO_API_BASE}/coins/${selectedCoin}`);
        const data = await response.json();
        updateCoinInfo(data);
    } catch (error) {
        showError('Failed to load coin data');
    }
}

async function loadPriceHistory() {
    try {
        const response = await fetch(
            `${COINGECKO_API_BASE}/coins/${selectedCoin}/market_chart?vs_currency=usd&days=30`
        );
        const data = await response.json();
        priceData = data.prices.map(price => ({
            t: new Date(price[0]),
            y: price[1]
        }));
        updatePriceChart();
    } catch (error) {
        showError('Failed to load price history');
    }
}

async function loadPredictions() {
    try {
        const response = await fetch(`${MODEL_API_BASE}/predict/${selectedCoin}`);
        const predictions = await response.json();
        updatePredictions(predictions);
    } catch (error) {
        showError('Failed to load predictions');
    }
}

async function loadSentimentAnalysis() {
    try {
        const response = await fetch(`${MODEL_API_BASE}/sentiment/${selectedCoin}`);
        const sentiment = await response.json();
        updateSentiment(sentiment);
    } catch (error) {
        showError('Failed to load sentiment analysis');
    }
}

// UI Update Functions
function updateCoinInfo(data) {
    const coinHeader = document.querySelector('.coin-header');
    coinHeader.innerHTML = `
        <img src="${data.image.large}" alt="${data.name}">
        <div class="coin-info">
            <h2>${data.name} (${data.symbol.toUpperCase()})</h2>
            <p>Rank #${data.market_cap_rank}</p>
        </div>
    `;

    updateMarketStats(data.market_data);
}

function updateMarketStats(marketData) {
    const statsGrid = document.querySelector('.stats-grid');
    statsGrid.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">Market Cap</div>
            <div class="stat-value">$${formatNumber(marketData.market_cap.usd)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">24h Volume</div>
            <div class="stat-value">$${formatNumber(marketData.total_volume.usd)}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">24h Change</div>
            <div class="stat-value ${marketData.price_change_percentage_24h >= 0 ? 'change-positive' : 'change-negative'}">
                ${marketData.price_change_percentage_24h.toFixed(2)}%
            </div>
        </div>
    `;
}

function updatePriceChart() {
    if (chart) {
        chart.destroy();
    }

    const ctx = priceChart.getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Price (USD)',
                data: priceData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function updatePredictions(predictions) {
    const predictionPanel = document.querySelector('#predictions');
    const recommendation = predictions.recommendation.toLowerCase();
    
    predictionPanel.innerHTML = `
        <h3>AI Predictions</h3>
        <div class="prediction-details">
            <p>Predicted Price (24h): $${predictions.predicted_price.toFixed(2)}</p>
            <p>Confidence Score: ${(predictions.confidence * 100).toFixed(1)}%</p>
            <div class="recommendation ${recommendation}">
                ${recommendation.toUpperCase()}
            </div>
        </div>
    `;
}

function updateSentiment(sentiment) {
    const sentimentPanel = document.querySelector('#sentiment');
    sentimentPanel.innerHTML = `
        <h3>Market Sentiment</h3>
        <div class="sentiment-score">
            Overall Score: ${sentiment.score.toFixed(2)}
        </div>
        <div class="news-feed">
            ${sentiment.recent_news.map(news => `
                <div class="news-item">
                    <div class="news-title">${news.title}</div>
                    <div class="news-meta">${new Date(news.date).toLocaleDateString()}</div>
                    <div class="news-sentiment sentiment-${news.sentiment.toLowerCase()}">
                        ${news.sentiment}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function showLoading() {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
    });
}

function hideLoading() {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => panel.classList.add('show'));
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    container.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 