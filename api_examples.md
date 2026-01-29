# API Usage Examples for MarketPredictor

## 🌐 Web API

### Base URL
```
http://localhost:8080/api
```

### 1. Market Analysis

#### Request
```bash
curl -X POST http://localhost:8080/api/analyze \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Response
```json
{
  "direction": "UP",
  "confidence": 87.5,
  "reason": "Strong upward trend",
  "timestamp": "2024-01-15T14:30:00Z",
  "marketData": {
    "currentPrice": 1.0872,
    "change": 0.0012,
    "volume": 1250000
  }
}
```

### 2. Server Health Check

#### Request
```bash
curl http://localhost:8080/api/health
```

#### Response
```json
{
  "status": "ok",
  "timestamp": 1705321800
}
```

## 🔧 JavaScript Examples

### 1. Basic Analysis

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
        console.log('Analysis result:', result);
        
        return result;
    } catch (error) {
        console.error('Analysis error:', error);
        throw error;
    }
}

// Usage
analyzeMarket().then(result => {
    console.log(`Direction: ${result.direction}`);
    console.log(`Confidence: ${result.confidence}%`);
});
```

### 2. Periodic Monitoring

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
        console.log('Monitoring started');
        
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
        console.log('Monitoring stopped');
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
        
        // Notification at high confidence
        if (result.confidence >= 85) {
            this.showNotification(result);
        }
    }
    
    showNotification(result) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Important Market Change!', {
                body: `${result.direction} - Confidence: ${result.confidence}%`,
                icon: '/favicon.ico'
            });
        }
    }
}

// Usage
const monitor = new MarketMonitor(30000); // 30 seconds
monitor.start();

// Stop after 5 minutes
setTimeout(() => monitor.stop(), 5 * 60 * 1000);
```

### 3. Error Handling

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
                // Rate limit - wait
                const retryAfter = response.headers.get('Retry-After') || 60;
                console.log(`Rate limit. Waiting ${retryAfter} seconds...`);
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
                throw new Error(`Analysis failed after ${maxRetries} attempts`);
            }
            
            // Exponential delay
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
    }
}
```

## 🐍 Python Examples

### 1. Basic Client

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
            print(f"Request error: {e}")
            return None
    
    def check_health(self):
        """Checks server status"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Health check error: {e}")
            return None

# Usage
client = MarketPredictorClient()

# Check status
health = client.check_health()
if health:
    print(f"Server running: {health}")

# Market analysis
result = client.analyze_market()
if result:
    print(f"Direction: {result['direction']}")
    print(f"Confidence: {result['confidence']}%")
```

### 2. Monitoring with Logging

```python
import requests
import json
import time
import logging
from datetime import datetime

# Logging setup
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
        self.base_url = base_url;
        self.interval = interval;
        self.session = requests.Session();
        self.last_direction = None;
        
    def run(self, duration_minutes=60):
        """Starts monitoring"""
        end_time = time.time() + (duration_minutes * 60)
        
        logging.info(f"Monitoring started for {duration_minutes} minutes")
        
        while time.time() < end_time:
            try:
                result = self.analyze_market()
                if result:
                    self.handle_result(result)
                
                time.sleep(self.interval)
                
            except KeyboardInterrupt:
                logging.info("Monitoring stopped by user")
                break
            except Exception as e:
                logging.error(f"Monitoring error: {e}")
                time.sleep(self.interval)
        
        logging.info("Monitoring completed")
    
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
            logging.error(f"Request error: {e}")
            return None
    
    def handle_result(self, result):
        """Handles analysis result"""
        direction = result['direction']
        confidence = result['confidence']
        
        // Log result
        logging.info(f"Analysis: {direction} (confidence: {confidence}%)")
        
        // Check direction change
        if self.last_direction and self.last_direction != direction:
            logging.warning(f"Direction change: {self.last_direction} → {direction}")
        
        self.last_direction = direction
        
        // Notification at high confidence
        if confidence >= 85:
            logging.warning(f"High confidence: {direction} ({confidence}%)")

# Usage
if __name__ == "__main__":
    monitor = MarketMonitor(interval=30)  # 30 seconds
    monitor.run(duration_minutes=60)  # 1 hour
```

## 🔄 WebSocket Examples (future development)

```javascript
// Example for future WebSocket version
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
                console.log('WebSocket connection established');
                this.reconnectAttempts = 0;
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket connection closed');
                this.reconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('WebSocket connection error:', error);
        }
    }
    
    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000;
            
            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('Maximum reconnection attempts exceeded');
        }
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'prediction':
                console.log('New prediction:', data.prediction);
                break;
            case 'alert':
                console.log('Alert:', data.message);
                this.showNotification(data.message);
                break;
            default:
                console.log('Unknown message type:', data);
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

// Usage
const wsClient = new MarketPredictorWebSocket();
wsClient.connect();
```

## 📊 Integration Examples

### 1. TradingView Integration

```javascript
// Example for TradingView Webhook integration
app.post('/webhook/tradingview', (req, res) => {
    const alert = req.body;
    
    // Analyze signal from TradingView
    analyzeMarketSignal(alert).then(result => {
        console.log('TradingView signal analysis:', result);
        
        // Send result to MarketPredictor
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
        console.log('MarketPredictor prediction:', prediction);
        res.json({ success: true, prediction });
    }).catch(error => {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: error.message });
    });
});
```

### 2. Telegram Bot Integration

```python
import requests
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters

class MarketPredictorBot:
    def __init__(self, token, api_url="http://localhost:8080"):
        self.updater = Updater(token=token, use_context=True)
        self.api_url = api_url
        self.dp = self.updater.dispatcher
        
        # Register handlers
        self.dp.add_handler(CommandHandler("analyze", self.analyze_command))
        self.dp.add_handler(CommandHandler("monitor", self.monitor_command))
        self.dp.add_handler(CommandHandler("stop", self.stop_command))
    
    def analyze_command(self, update, context):
        """Handler for /analyze command"""
        update.message.reply_text("🔍 Analyzing market...");
        
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
            update.message.reply_text(f"❌ Analysis error: {e}")
    
    def monitor_command(self, update, context):
        """Handler for /monitor command"""
        update.message.reply_text("🔄 Monitoring started...");
        # Monitoring logic
    
    def stop_command(self, update, context):
        """Handler for /stop command"""
        update.message.reply_text("⏹️ Monitoring stopped");
        # Stop logic
    
    def run(self):
        """Starts the bot"""
        self.updater.start_polling()
        print("Telegram bot started")
        self.updater.idle()

# Usage
if __name__ == "__main__":
    bot = MarketPredictorBot("YOUR_TELEGRAM_BOT_TOKEN")
    bot.run()
```

---

**💡 Tip**: All examples can be adapted to your needs. Don't forget to handle errors and add logging in production!
