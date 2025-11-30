class MarketPredictor {
    constructor() {
        this.isRunning = false;
        this.backgroundMode = false;
        this.monitorInterval = null;
        this.lastAnalysis = null;
        this.notificationsEnabled = true;
        
        this.initializeElements();
        this.bindEvents();
        this.log('Система инициализирована');
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
            this.log(`Уведомления ${this.notificationsEnabled ? 'включены' : 'отключены'}`);
        });
    }

    async startAnalysis() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateUI('analyzing');
        this.log('Начинаем анализ рынка...', 'info');
        
        try {
            
            const result = await this.performMarketAnalysis();
            
            this.displayPrediction(result);
            this.lastAnalysis = result;
            
         
            if (result.confidence < 80) {
                this.startBackgroundMonitoring();
                this.log(`Низкая уверенность (${result.confidence}%). Включаем фоновый мониторинг.`, 'warning');
            } else {
                this.updateUI('idle');
                this.log(`Анализ завершен. Высокая уверенность: ${result.confidence}%`, 'success');
            }
            
        } catch (error) {
            this.log(`Ошибка анализа: ${error.message}`, 'error');
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
        // Используем Alpha Vantage API для получения реальных данных EURUSD
        const API_KEY = 'XVNSTU7GPBFFDM2W'; // Используем более надежный ключ для API
        const SYMBOL = 'EURUSD';
        
        try {
            this.log('🔄 Запрос данных EURUSD с Alpha Vantage API...');
            // Запрос к Alpha Vantage API для получения данных по EURUSD
            const response = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${API_KEY}`);
            const data = await response.json();
            
            // Проверяем, получены ли данные
            if (data['Realtime Currency Exchange Rate']) {
                const exchangeData = data['Realtime Currency Exchange Rate'];
                const currentPrice = parseFloat(exchangeData['5. Exchange Rate']);
                const timestamp = exchangeData['6. Last Refreshed'];
                
                // Получаем дополнительные данные (для истории)
                const historyResponse = await fetch(`https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=EUR&to_symbol=USD&outputsize=compact&apikey=${API_KEY}`);
                const historyData = await historyResponse.json();
                
                let openPrice = currentPrice;
                let highPrice = currentPrice;
                let lowPrice = currentPrice;
                let change = 0;
                
                // Если есть исторические данные, используем их
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
                
                this.log('📊 Получены реальные данные EURUSD');
                
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
                throw new Error('Данные не получены от API');
            }
        } catch (error) {
            console.error('Ошибка получения рыночных данных:', error);
            this.log('⚠️ Ошибка получения данных. Используем симуляцию.');
            
            // Запасной вариант - симуляция данных
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
                source: 'Симуляция (API недоступен)'
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
        // Симуляция технического анализа для конкретного временного интервала
        const rsi = 30 + Math.random() * 40; // RSI от 30 до 70
        const macd = (Math.random() - 0.5) * 0.002;
        const sma20 = parseFloat(marketData.currentPrice) + (Math.random() - 0.5) * 0.005;
        const ema12 = parseFloat(marketData.currentPrice) + (Math.random() - 0.5) * 0.003;
        
        // Определяем направление на основе технических индикаторов
        let direction = 'NEUTRAL';
        let confidence = 50;
        let reason = '';

        if (rsi < 30 && macd > 0) {
            direction = 'UP';
            confidence = 70 + Math.random() * 20;
            reason = 'Перепродано + положительный MACD';
        } else if (rsi > 70 && macd < 0) {
            direction = 'DOWN';
            confidence = 70 + Math.random() * 20;
            reason = 'Перекуплено + отрицательный MACD';
        } else if (parseFloat(marketData.currentPrice) > sma20 && ema12 > sma20) {
            direction = 'UP';
            confidence = 60 + Math.random() * 15;
            reason = 'Цена выше SMA20 и EMA12';
        } else if (parseFloat(marketData.currentPrice) < sma20 && ema12 < sma20) {
            direction = 'DOWN';
            confidence = 60 + Math.random() * 15;
            reason = 'Цена ниже SMA20 и EMA12';
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
        // Объединяем результаты всех временных интервалов
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

        // Определяем финальное направление
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
        
        // Добавляем детальную информацию о временных интервалах
        this.displayTimeframeDetails(result);
        
        // Показываем уведомление если уверенность высокая
        if (result.confidence >= 80 && this.notificationsEnabled) {
            this.showNotification(
                'Анализ завершен',
                `${result.direction} - Уверенность: ${result.confidence}%`,
                'success'
            );
        }
    }

    displayTimeframeDetails(result) {
        // Создаем или обновляем секцию с деталями по временным интервалам
        let timeframeSection = document.getElementById('timeframeDetails');
        if (!timeframeSection) {
            timeframeSection = document.createElement('div');
            timeframeSection.id = 'timeframeDetails';
            timeframeSection.className = 'timeframe-details';
            document.querySelector('.prediction-details').appendChild(timeframeSection);
        }

        if (result.timeframes) {
            let html = '<h4>📊 Анализ по временным интервалам:</h4>';
            
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
        
        this.log('Фоновый мониторинг активирован', 'success');
        
        // Запускаем мониторинг каждые 5 минут (300000 мс)
        this.monitorInterval = setInterval(() => {
            this.performBackgroundCheck();
        }, 300000); // 5 минут
        
        // Первая проверка через 1 минуту
        setTimeout(() => this.performBackgroundCheck(), 60000);
    }

    async performBackgroundCheck() {
        this.updateLastCheckTime();
        
        try {
            // Симуляция фоновой проверки
            const result = await this.performMarketAnalysis();
            
            // Проверяем, изменилось ли направление или повысилась уверенность
            if (this.lastAnalysis && 
                (result.direction !== this.lastAnalysis.direction || 
                 result.confidence >= 85)) {
                
                this.log(`Обнаружено изменение: ${result.direction} (${result.confidence}%)`, 'warning');
                
                if (this.notificationsEnabled) {
                    this.showNotification(
                        'Важное изменение!',
                        `Направление: ${result.direction}, Уверенность: ${result.confidence}%`,
                        'warning'
                    );
                }
                
                this.lastAnalysis = result;
            }
            
        } catch (error) {
            this.log(`Ошибка фоновой проверки: ${error.message}`, 'error');
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
        this.log('Анализ остановлен', 'info');
    }

    updateUI(state) {
        this.statusDot.className = 'status-dot';
        
        switch (state) {
            case 'idle':
                this.statusText.textContent = 'Ожидание запуска';
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
                break;
            case 'analyzing':
                this.statusDot.classList.add('analyzing');
                this.statusText.textContent = 'Анализируем рынок...';
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                break;
            case 'active':
                this.statusDot.classList.add('active');
                this.statusText.textContent = 'Активный мониторинг';
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
    
    // Добавляем метод logEvent как алиас для log
    logEvent(message, type = 'info') {
        this.log(message, type);
    }

    showNotification(title, message, type = 'success') {
        // Проверяем поддержку уведомлений браузера
        if (!("Notification" in window)) {
            console.log("Этот браузер не поддерживает уведомления");
            return;
        }
        
        // Если разрешения уже получены
        if (Notification.permission === "granted") {
            this.createNotification(title, message, type);
        }
        // Если разрешения не запрещены (можно запросить)
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

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const app = new MarketPredictor();
    
    // Для тестирования можно добавить глобальную ссылку
    window.marketPredictor = app;
});

