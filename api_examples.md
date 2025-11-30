# API Примеры использования MarketPredictor

## 🌐 Веб API

### Базовый URL
```
http://localhost:8080/api
```

### 1. Анализ рынка

#### Запрос
```bash
curl -X POST http://localhost:8080/api/analyze \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Ответ
```json
{
  "direction": "UP",
  "confidence": 87.5,
  "reason": "Сильный восходящий тренд",
  "timestamp": "2024-01-15T14:30:00Z",
  "marketData": {
    "currentPrice": 1.0872,
    "change": 0.0012,
    "volume": 1250000
  }
}
```

### 2. Проверка состояния сервера

#### Запрос
```bash
curl http://localhost:8080/api/health
```

#### Ответ
```json
{
  "status": "ok",
  "timestamp": 1705321800
}
```

## 🔧 JavaScript Примеры

### 1. Базовый анализ

```javascript
async function analyzeMarket() {
    try {
        const response = await fetch('http://localhost:8080/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Результат анализа:', result);
        
        return result;
    } catch (error) {
        console.error('Ошибка анализа:', error);
        throw error;
    }
}

// Использование
analyzeMarket().then(result => {
    console.log(`Направление: ${result.direction}`);
    console.log(`Уверенность: ${result.confidence}%`);
});
```

### 2. Периодический мониторинг

```javascript
class MarketMonitor {
    constructor(intervalMs = 30000) {
        this.intervalMs = intervalMs;
        this.isRunning = false;
        this.intervalId = null;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('Мониторинг запущен');
        
        this.intervalId = setInterval(async () => {
            try {
                const result = await this.analyzeMarket();
                this.handleResult(result);
            } catch (error) {
                console.error('Ошибка мониторинга:', error);
            }
        }, this.intervalMs);
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('Мониторинг остановлен');
    }
    
    async analyzeMarket() {
        const response = await fetch('http://localhost:8080/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        
        return await response.json();
    }
    
    handleResult(result) {
        console.log(`[${new Date().toLocaleTimeString()}] ${result.direction} (${result.confidence}%)`);
        
        // Уведомление при высокой уверенности
        if (result.confidence >= 85) {
            this.showNotification(result);
        }
    }
    
    showNotification(result) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Важное изменение рынка!', {
                body: `${result.direction} - Уверенность: ${result.confidence}%`,
                icon: '/favicon.ico'
            });
        }
    }
}

// Использование
const monitor = new MarketMonitor(30000); // 30 секунд
monitor.start();

// Остановка через 5 минут
setTimeout(() => monitor.stop(), 5 * 60 * 1000);
```

### 3. Обработка ошибок

```javascript
async function robustAnalysis() {
    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            const response = await fetch('http://localhost:8080/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            
            if (response.status === 429) {
                // Rate limit - ждем
                const retryAfter = response.headers.get('Retry-After') || 60;
                console.log(`Rate limit. Ждем ${retryAfter} секунд...`);
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                retries++;
                continue;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            retries++;
            console.error(`Попытка ${retries}/${maxRetries} не удалась:`, error);
            
            if (retries >= maxRetries) {
                throw new Error(`Анализ не удался после ${maxRetries} попыток`);
            }
            
            // Экспоненциальная задержка
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
    }
}
```

## 🐍 Python Примеры

### 1. Базовый клиент

```python
import requests
import json
import time
from datetime import datetime

class MarketPredictorClient:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def analyze_market(self):
        """Выполняет анализ рынка"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/analyze",
                headers={'Content-Type': 'application/json'},
                json={}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Ошибка запроса: {e}")
            return None
    
    def check_health(self):
        """Проверяет состояние сервера"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Ошибка проверки состояния: {e}")
            return None

# Использование
client = MarketPredictorClient()

# Проверка состояния
health = client.check_health()
if health:
    print(f"Сервер работает: {health}")

# Анализ рынка
result = client.analyze_market()
if result:
    print(f"Направление: {result['direction']}")
    print(f"Уверенность: {result['confidence']}%")
```

### 2. Мониторинг с логированием

```python
import requests
import json
import time
import logging
from datetime import datetime

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('market_monitor.log'),
        logging.StreamHandler()
    ]
)

class MarketMonitor:
    def __init__(self, base_url="http://localhost:8080", interval=30):
        self.base_url = base_url
        self.interval = interval
        self.session = requests.Session()
        self.last_direction = None
        
    def run(self, duration_minutes=60):
        """Запускает мониторинг"""
        end_time = time.time() + (duration_minutes * 60)
        
        logging.info(f"Мониторинг запущен на {duration_minutes} минут")
        
        while time.time() < end_time:
            try:
                result = self.analyze_market()
                if result:
                    self.handle_result(result)
                
                time.sleep(self.interval)
                
            except KeyboardInterrupt:
                logging.info("Мониторинг остановлен пользователем")
                break
            except Exception as e:
                logging.error(f"Ошибка мониторинга: {e}")
                time.sleep(self.interval)
        
        logging.info("Мониторинг завершен")
    
    def analyze_market(self):
        """Выполняет анализ рынка"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/analyze",
                headers={'Content-Type': 'application/json'},
                json={}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f"Ошибка запроса: {e}")
            return None
    
    def handle_result(self, result):
        """Обрабатывает результат анализа"""
        direction = result['direction']
        confidence = result['confidence']
        
        # Логируем результат
        logging.info(f"Анализ: {direction} (уверенность: {confidence}%)")
        
        # Проверяем изменение направления
        if self.last_direction and self.last_direction != direction:
            logging.warning(f"Изменение направления: {self.last_direction} → {direction}")
        
        self.last_direction = direction
        
        # Уведомление при высокой уверенности
        if confidence >= 85:
            logging.warning(f"Высокая уверенность: {direction} ({confidence}%)")

# Использование
if __name__ == "__main__":
    monitor = MarketMonitor(interval=30)  # 30 секунд
    monitor.run(duration_minutes=60)  # 1 час
```

## 🔄 WebSocket Примеры (будущее развитие)

```javascript
// Пример для будущей WebSocket версии
class MarketPredictorWebSocket {
    constructor(url = 'ws://localhost:8080/ws') {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = () => {
                console.log('WebSocket соединение установлено');
                this.reconnectAttempts = 0;
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket соединение закрыто');
                this.reconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket ошибка:', error);
            };
            
        } catch (error) {
            console.error('Ошибка подключения WebSocket:', error);
        }
    }
    
    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000;
            
            console.log(`Переподключение через ${delay}ms (попытка ${this.reconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('Превышено максимальное количество попыток переподключения');
        }
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'prediction':
                console.log('Новое предсказание:', data.prediction);
                break;
            case 'alert':
                console.log('Алерт:', data.message);
                this.showNotification(data.message);
                break;
            default:
                console.log('Неизвестный тип сообщения:', data);
        }
    }
    
    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('MarketPredictor', {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Использование
const wsClient = new MarketPredictorWebSocket();
wsClient.connect();
```

## 📊 Примеры интеграции

### 1. Интеграция с TradingView

```javascript
// Пример для интеграции с TradingView Webhook
app.post('/webhook/tradingview', (req, res) => {
    const alert = req.body;
    
    // Анализируем сигнал от TradingView
    analyzeMarketSignal(alert).then(result => {
        console.log('Анализ сигнала TradingView:', result);
        
        // Отправляем результат в MarketPredictor
        return fetch('http://localhost:8080/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'tradingview',
                alert: alert,
                analysis: result
            })
        });
    }).then(response => response.json())
    .then(prediction => {
        console.log('Предсказание MarketPredictor:', prediction);
        res.json({ success: true, prediction });
    }).catch(error => {
        console.error('Ошибка обработки webhook:', error);
        res.status(500).json({ error: error.message });
    });
});
```

### 2. Интеграция с Telegram Bot

```python
import requests
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters

class MarketPredictorBot:
    def __init__(self, token, api_url="http://localhost:8080"):
        self.updater = Updater(token=token, use_context=True)
        self.api_url = api_url
        self.dp = self.updater.dispatcher
        
        # Регистрируем обработчики
        self.dp.add_handler(CommandHandler("analyze", self.analyze_command))
        self.dp.add_handler(CommandHandler("monitor", self.monitor_command))
        self.dp.add_handler(CommandHandler("stop", self.stop_command))
    
    def analyze_command(self, update, context):
        """Обработчик команды /analyze"""
        update.message.reply_text("🔍 Анализирую рынок...")
        
        try:
            response = requests.post(
                f"{self.api_url}/api/analyze",
                headers={'Content-Type': 'application/json'},
                json={}
            )
            response.raise_for_status()
            result = response.json()
            
            message = f"""
📊 Результат анализа:
🎯 Направление: {result['direction']}
📈 Уверенность: {result['confidence']}%
💡 Причина: {result['reason']}
⏰ Время: {result['timestamp']}
            """
            
            update.message.reply_text(message)
            
        except Exception as e:
            update.message.reply_text(f"❌ Ошибка анализа: {e}")
    
    def monitor_command(self, update, context):
        """Обработчик команды /monitor"""
        update.message.reply_text("🔄 Мониторинг запущен...")
        # Логика мониторинга
    
    def stop_command(self, update, context):
        """Обработчик команды /stop"""
        update.message.reply_text("⏹️ Мониторинг остановлен")
        # Логика остановки
    
    def run(self):
        """Запускает бота"""
        self.updater.start_polling()
        print("Telegram бот запущен")
        self.updater.idle()

# Использование
if __name__ == "__main__":
    bot = MarketPredictorBot("YOUR_TELEGRAM_BOT_TOKEN")
    bot.run()
```

---

**💡 Совет**: Все примеры можно адаптировать под ваши нужды. Не забудьте обработать ошибки и добавить логирование в продакшене!
