# MarketPredictor - Market Analysis and Prediction

Miniature website for market movement analysis and prediction with background monitoring and notifications.

## 🚀 Features

- **Instant Analysis**: Get market direction prediction in seconds
- **Background Monitoring**: Automatic monitoring at low confidence
- **Notifications**: Receive alerts about important changes
- **Modern UI**: Beautiful and responsive interface
- **Event Log**: Track all system actions

## 📁 Project Structure

```
MarketPredictor/
├── index.html          # Главная страница
├── style.css           # Стили
├── script.js           # JavaScript логика
├── web_server.py       # Веб-сервер
├── ai_training.py      # Тренировка ИИ модели
├── requirements.txt    # Python зависимости
├── README.md           # Документация
├── QUICK_START.md      # Быстрый старт
├── INSTALL.md          # Инструкции установки
├── api_examples.md     # Примеры API
├── CMakeLists.txt      # Сборка C++
├── server.cpp          # C++ сервер
├── ml_demo.py          # Машинное обучение
└── forme.txt           # Исходные требования
```

## 🛠️ Installation and Setup

### Quick Start (5 minutes)

1. **Download files** to one folder
2. **Start web server**:
   ```bash
   python web_server.py
   ```
3. **Open browser** at `http://localhost:8000`

### For AI model training:
```bash
python ai_training.py
```

### Alternative Launch Methods

#### Option A: Simply open in browser
```bash
# Дважды кликните на index.html
# Или откройте в браузере: file:///path/to/index.html
```

#### Option B: Through web server
```bash
# Python 3
python -m http.server 8000

# Или Node.js
npx http-server -p 8000

# Затем откройте: http://localhost:8000
```

## 📖 How to Use

### 1. Starting Analysis
- Click the **"🚀 Start Analysis"** button
- Wait for analysis completion (2-5 seconds)
- View result in prediction card

### 2. Background Monitoring
- If analysis confidence < 80%, background mode automatically activates
- System checks market every 30 seconds
- You'll receive notification when changes are detected

### 3. Notifications
- **Browser Notifications**: Appear in top-right corner of screen
- **Visual Notifications**: Displayed on page
- Can be disabled in monitoring settings

### 4. Event Log
- All system actions are recorded in log
- Time, status and details of each event
- Auto-scroll to new entries

## 🎯 Working Logic

### Analysis Algorithm
1. **Data Collection**: Getting current market data
2. **Technical Analysis**: Calculating indicators (RSI, MACD, SMA, EMA)
3. **Trend Analysis**: Determining movement direction
4. **Confidence Assessment**: Calculating prediction probability

### Operating Modes
- **Waiting**: System inactive
- **Analysis**: One-time analysis performed
- **Monitoring**: Background change tracking

### Confidence Levels
- **95-100%**: Very high confidence
- **80-94%**: High confidence
- **65-79%**: Medium confidence (monitoring activates)
- **<65%**: Low confidence

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Page structure
- **CSS3**: Styling and animations
- **JavaScript ES6+**: Application logic
- **Web Notifications API**: System notifications
- **Python**: Server-side and ML
- **C++**: High-performance computing

### Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Performance
- Analysis time: 2-5 seconds
- Monitoring frequency: every 30 seconds
- Data size: < 1MB

## 🚨 Important Notes

### Limitations
- This is a demo version with data simulation
- Real usage requires connection to exchange APIs
- Predictions are not financial recommendations

### Security
- All data processed locally in browser
- No data transmission to external servers
- Notifications work only when page is open

## 🔮 Development Plans

### Version 2.0
- [ ] Real exchange API connections
- [ ] Machine learning for predictions
- [ ] Multiple currency pairs
- [ ] Data export to CSV/JSON

### Version 3.0
- [ ] Mobile application
- [ ] Social features
- [ ] Integration with trading platforms
- [ ] Advanced analytics

## 📞 Support

If you have questions or suggestions:
1. Check event log on page
2. Ensure browser supports notifications
3. Try refreshing the page

## 📄 License

This project is created for educational purposes. Use at your own risk.

---

**⚠️ Disclaimer**: This application is for demonstration purposes only. Do not use it for making real trading decisions. Always consult with financial advisors.

