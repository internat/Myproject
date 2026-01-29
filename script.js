class MarketPredictor {
    constructor() {
        this.isRunning = false;
        this.backgroundMode = false;
        this.monitorInterval = null;
        this.lastAnalysis = null;
        this.notificationsEnabled = true;
        
        this.initializeElements();
        this.bindEvents();
        this.log('System initialized');
    }

    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.predictionCard = document.getElementById('predictionCard');
        this.backgroundMonitor = document.getElementById('backgroundMonitor');
        this.logContent = document.getElementById('logContent');
        this.notificationsCheckbox = document.getElementById('notificationsEnabled');
        this.lastCheckTime = document.getElementById('lastCheckTime');
        
        // Prediction elements
        this.directionValue = document.getElementById('directionValue');
        this.confidenceValue = document.getElementById('confidenceValue');
        this.analysisTime = document.getElementById('analysisTime');
        this.dataSource = document.getElementById('dataSource');
        this.directionText = document.querySelector('.direction-text');
        this.confidence = document.querySelector('.confidence');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startAnalysis());
        this.stopBtn.addEventListener('click', () => this.stopAnalysis());
        this.notificationsCheckbox.addEventListener('change', (e) => {
            this.notificationsEnabled = e.target.checked;
            this.log(`Notifications ${this.notificationsEnabled ? 'enabled' : 'disabled'}`);
        });
    }

    async startAnalysis() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateUI('analyzing');
        this.log('Starting market analysis...', 'info');
        
        try {
            
            const result = await this.performMarketAnalysis();
            
            this.displayPrediction(result);
            this.lastAnalysis = result;
            
         
            if (result.confidence < 80) {
                this.startBackgroundMonitoring();
                this.log(`Low confidence (${result.confidence}%). Enabling background monitoring.`, 'warning');
            } else {
                this.updateUI('idle');
                this.log(`Analysis complete. High confidence: ${result.confidence}%`, 'success');
            }
            
        } catch (error) {
            this.log(`Analysis error: ${error.message}`, 'error');
            this.updateUI('idle');
        }
        
        this.isRunning = false;
    }

    async performMarketAnalysis() {
        
        const marketData = await this.fetchRealMarketData();
        
        
        const analysisResults = await this.analyzeMultipleTimeframes(marketData);
        
        
        const finalResult = this.combineAnalysisResults(analysisResults);
        
        return {
            direction: finalResult.direction,
            confidence: finalResult.confidence,
            reason: finalResult.reason,
            timestamp: new Date().toISOString(),
            marketData: marketData,
            timeframes: analysisResults
        };
    }

    async fetchRealMarketData() {
        // Using Alpha Vantage API to get real EURUSD data
        const API_KEY = 'XVNSTU7GPBFFDM2W'; // Using more reliable API key
        const SYMBOL = 'EURUSD';
        
        try {
            this.log('🔄 Requesting EURUSD data from Alpha Vantage API...');
            // Request to Alpha Vantage API to get EURUSD data
            const response = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${API_KEY}`);
            const data = await response.json();
            
            // Check if data was received
            if (data['Realtime Currency Exchange Rate']) {
                const exchangeData = data['Realtime Currency Exchange Rate'];
                const currentPrice = parseFloat(exchangeData['5. Exchange Rate']);
                const timestamp = exchangeData['6. Last Refreshed'];
                
                // Get additional data (for history)
                const historyResponse = await fetch(`https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=EUR&to_symbol=USD&outputsize=compact&apikey=${API_KEY}`);
                const historyData = await historyResponse.json();
                
                let openPrice = currentPrice;
                let highPrice = currentPrice;
                let lowPrice = currentPrice;
                let change = 0;
                
                // If there is historical data, use it
                if (historyData['Time Series FX (Daily)']) {
                    const dates = Object.keys(historyData['Time Series FX (Daily)']);
                    if (dates.length > 0) {
                        const latestDate = dates[0];
                        const previousDate = dates.length > 1 ? dates[1] : dates[0];
                        
                        const latestData = historyData['Time Series FX (Daily)'][latestDate];
                        const previousData = historyData['Time Series FX (Daily)'][previousDate];
                        
                        openPrice = parseFloat(latestData['1. open']);
                        highPrice = parseFloat(latestData['2. high']);
                        lowPrice = parseFloat(latestData['3. low']);
                        
                        const previousClose = parseFloat(previousData['4. close']);
                        change = ((currentPrice - previousClose) / previousClose * 100);
                    }
                }
                
                this.log('📊 Real EURUSD data received');
                
                return {
                    symbol: SYMBOL,
                    currentPrice: currentPrice.toFixed(4),
                    openPrice: openPrice.toFixed(4),
                    highPrice: highPrice.toFixed(4),
                    lowPrice: lowPrice.toFixed(4),
                    volume: Math.floor(Math.random() * 1000000 + 500000), // Alpha Vantage не предоставляет объем для Forex
                    change: change.toFixed(2),
                    timestamp: timestamp,
                    source: 'Alpha Vantage API'
                };
            } else {
                throw new Error('Data not received from API');
            }
        } catch (error) {
            console.error('Error getting market data:', error);
            this.log('⚠️ Data retrieval error. Using simulation.');
            
            // Fallback option - data simulation
            const basePrice = 1.0850;
            const volatility = 0.002;
            const currentPrice = basePrice + (Math.random() - 0.5) * volatility;
            
            return {
                symbol: 'EURUSD',
                currentPrice: currentPrice.toFixed(4),
                openPrice: (basePrice + (Math.random() - 0.5) * 0.001).toFixed(4),
                highPrice: (currentPrice + Math.random() * 0.001).toFixed(4),
                lowPrice: (currentPrice - Math.random() * 0.001).toFixed(4),
                volume: Math.floor(Math.random() * 1000000 + 500000),
                change: ((currentPrice - basePrice) / basePrice * 100).toFixed(2),
                timestamp: new Date().toISOString(),
                source: 'Simulation (API unavailable)'
            };
        }
    }

    async analyzeMultipleTimeframes(marketData) {
        const timeframes = [
            { name: '5m', interval: 5, weight: 0.1 },
            { name: '15m', interval: 15, weight: 0.2 },
            { name: '30m', interval: 30, weight: 0.3 },
            { name: '1h', interval: 60, weight: 0.4 }
        ];

        const results = {};

        for (const timeframe of timeframes) {
            // Симуляция анализа для каждого временного интервала
            const analysis = await this.analyzeTimeframe(marketData, timeframe);
            results[timeframe.name] = analysis;
        }

        return results;
    }

    async analyzeTimeframe(marketData, timeframe) {
        // Simulate technical analysis for specific timeframe
        const rsi = 30 + Math.random() * 40; // RSI from 30 to 70
        const macd = (Math.random() - 0.5) * 0.002;
        const sma20 = parseFloat(marketData.currentPrice) + (Math.random() - 0.5) * 0.005;
        const ema12 = parseFloat(marketData.currentPrice) + (Math.random() - 0.5) * 0.003;
        
        // Determine direction based on technical indicators
        let direction = 'NEUTRAL';
        let confidence = 50;
        let reason = '';

        if (rsi < 30 && macd > 0) {
            direction = 'UP';
            confidence = 70 + Math.random() * 20;
            reason = 'Oversold + positive MACD';
        } else if (rsi > 70 && macd < 0) {
            direction = 'DOWN';
            confidence = 70 + Math.random() * 20;
            reason = 'Overbought + negative MACD';
        } else if (parseFloat(marketData.currentPrice) > sma20 && ema12 > sma20) {
            direction = 'UP';
            confidence = 60 + Math.random() * 15;
            reason = 'Price above SMA20 and EMA12';
        } else if (parseFloat(marketData.currentPrice) < sma20 && ema12 < sma20) {
            direction = 'DOWN';
            confidence = 60 + Math.random() * 15;
            reason = 'Price below SMA20 and EMA12';
        }

        return {
            direction,
            confidence: Math.round(confidence),
            reason,
            indicators: { rsi: Math.round(rsi), macd, sma20, ema12 },
            timeframe: timeframe.name
        };
    }

    combineAnalysisResults(timeframeResults) {
        // Combine results from all timeframes
        let totalWeight = 0;
        let weightedDirection = { UP: 0, DOWN: 0, NEUTRAL: 0 };
        let totalConfidence = 0;
        let reasons = [];

        const weights = { '5m': 0.1, '15m': 0.2, '30m': 0.3, '1h': 0.4 };

        for (const [timeframe, result] of Object.entries(timeframeResults)) {
            const weight = weights[timeframe];
            totalWeight += weight;
            
            weightedDirection[result.direction] += weight * result.confidence;
            totalConfidence += weight * result.confidence;
            reasons.push(`${timeframe}: ${result.reason}`);
        }

        // Determine final direction
        let finalDirection = 'NEUTRAL';
        if (weightedDirection.UP > weightedDirection.DOWN && weightedDirection.UP > weightedDirection.NEUTRAL) {
            finalDirection = 'UP';
        } else if (weightedDirection.DOWN > weightedDirection.UP && weightedDirection.DOWN > weightedDirection.NEUTRAL) {
            finalDirection = 'DOWN';
        }

        const finalConfidence = Math.round(totalConfidence / totalWeight);

        return {
            direction: finalDirection,
            confidence: finalConfidence,
            reason: reasons.join('; ')
        };
    }

    displayPrediction(result) {
        this.predictionCard.style.display = 'block';
        
        this.directionValue.textContent = result.direction;
        this.confidenceValue.textContent = `${result.confidence}%`;
        this.analysisTime.textContent = new Date(result.timestamp).toLocaleTimeString();
        this.dataSource.textContent = result.marketData.source || 'Неизвестно';
        
        // Обновляем визуальное отображение направления
        this.directionText.textContent = result.direction;
        this.directionText.className = `direction-text ${result.direction.toLowerCase()}`;
        this.confidence.textContent = `${result.confidence}%`;
        
        // Add detailed timeframe information
        this.displayTimeframeDetails(result);
        
        // Show notification if confidence is high
        if (result.confidence >= 80 && this.notificationsEnabled) {
            this.showNotification(
                'Analysis Complete',
                `${result.direction} - Confidence: ${result.confidence}%`,
                'success'
            );
        }
    }

    displayTimeframeDetails(result) {
        // Create or update timeframe details section
        let timeframeSection = document.getElementById('timeframeDetails');
        if (!timeframeSection) {
            timeframeSection = document.createElement('div');
            timeframeSection.id = 'timeframeDetails';
            timeframeSection.className = 'timeframe-details';
            document.querySelector('.prediction-details').appendChild(timeframeSection);
        }

        if (result.timeframes) {
            let html = '<h4>📊 Timeframe Analysis:</h4>';
            
            for (const [timeframe, analysis] of Object.entries(result.timeframes)) {
                const directionClass = analysis.direction.toLowerCase();
                html += `
                    <div class="timeframe-item">
                        <div class="timeframe-header">
                            <span class="timeframe-name">${timeframe}</span>
                            <span class="timeframe-direction ${directionClass}">${analysis.direction}</span>
                            <span class="timeframe-confidence">${analysis.confidence}%</span>
                        </div>
                        <div class="timeframe-reason">${analysis.reason}</div>
                    </div>
                `;
            }
            
            timeframeSection.innerHTML = html;
        }
    }

    startBackgroundMonitoring() {
        if (this.backgroundMode) return;
        
        this.backgroundMode = true;
        this.backgroundMonitor.style.display = 'block';
        this.updateUI('active');
        
        this.log('Background monitoring activated', 'success');
        
        // Start monitoring every 5 minutes (300000 ms)
        this.monitorInterval = setInterval(() => {
            this.performBackgroundCheck();
        }, 300000); // 5 minutes
        
        // First check after 1 minute
        setTimeout(() => this.performBackgroundCheck(), 60000);
    }

    async performBackgroundCheck() {
        this.updateLastCheckTime();
        
        try {
            // Simulate background check
            const result = await this.performMarketAnalysis();
            
            // Check if direction changed or confidence increased
            if (this.lastAnalysis && 
                (result.direction !== this.lastAnalysis.direction || 
                 result.confidence >= 85)) {
                
                this.log(`Change detected: ${result.direction} (${result.confidence}%)`, 'warning');
                
                if (this.notificationsEnabled) {
                    this.showNotification(
                        'Important Change!',
                        `Direction: ${result.direction}, Confidence: ${result.confidence}%`,
                        'warning'
                    );
                }
                
                this.lastAnalysis = result;
            }
            
        } catch (error) {
            this.log(`Background check error: ${error.message}`, 'error');
        }
    }

    stopAnalysis() {
        this.isRunning = false;
        this.backgroundMode = false;
        
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        
        this.updateUI('idle');
        this.backgroundMonitor.style.display = 'none';
        this.log('Analysis stopped', 'info');
    }

    updateUI(state) {
        this.statusDot.className = 'status-dot';
        
        switch (state) {
            case 'idle':
                this.statusText.textContent = 'Waiting to start';
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
                break;
            case 'analyzing':
                this.statusDot.classList.add('analyzing');
                this.statusText.textContent = 'Analyzing market...';
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                break;
            case 'active':
                this.statusDot.classList.add('active');
                this.statusText.textContent = 'Active monitoring';
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                break;
        }
    }

    updateLastCheckTime() {
        const now = new Date();
        this.lastCheckTime.textContent = now.toLocaleTimeString();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logItem = document.createElement('div');
        logItem.className = `log-item ${type}`;
        logItem.innerHTML = `<span class="log-time">${timestamp}</span> <span class="log-message">${message}</span>`;
        
        this.logContent.prepend(logItem);
        
        // Ограничиваем количество записей в логе
        if (this.logContent.children.length > 100) {
            this.logContent.removeChild(this.logContent.lastChild);
        }
    }
    
    // Add logEvent method as alias for log
    logEvent(message, type = 'info') {
        this.log(message, type);
    }

    showNotification(title, message, type = 'success') {
        // Check browser notification support
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return;
        }
        
        // If permissions already granted
        if (Notification.permission === "granted") {
            this.createNotification(title, message, type);
        }
        // If permissions not denied (can request)
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.createNotification(title, message, type);
                }
            });
        }
    }
    
    createNotification(title, message, type) {
        const notification = new Notification(title, {
            body: message,
            icon: type === 'success' ? 'https://img.icons8.com/color/48/000000/ok--v1.png' : 
                  type === 'warning' ? 'https://img.icons8.com/color/48/000000/high-priority.png' : 
                  'https://img.icons8.com/color/48/000000/info--v1.png'
        });
        
        // Автоматически закрываем через 5 секунд
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
}

// Initialize application on page load
document.addEventListener('DOMContentLoaded', () => {
    const app = new MarketPredictor();
    
    // For testing, can add global reference
    window.marketPredictor = app;
});

