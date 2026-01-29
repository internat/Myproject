# 🚀 Quick Start MarketPredictor

## ⚡ Easiest Way (5 minutes)

### 1. Download Files
Ensure you have all files:
- `index.html` - главная страница
- `style.css` - стили
- `script.js` - логика приложения
- `start.py` - скрипт запуска (опционально)

### 2. Launch Site

#### Option A: Simply Open in Browser
```bash
# Дважды кликните на index.html
# Или откройте в браузере: file:///path/to/index.html
```

#### Option B: Through Python (recommended)
```bash
python start.py
```

#### Option C: Through Web Server
```bash
# Python 3
python -m http.server 8000

# Или Node.js
npx http-server -p 8000

# Затем откройте: http://localhost:8000
```

### 3. Use the Application
1. **Open site** in browser
2. **Allow notifications** when prompted
3. **Click "🚀 Start Analysis"**
4. **Wait for result** (2-5 seconds)
5. **View prediction** and event log

## 🎯 What You Get

### ✅ Works Immediately
- Beautiful modern interface
- Market analysis simulation
- Background monitoring
- Browser notifications
- Event log

### 📊 Features
- **Instant Analysis**: Get prediction in seconds
- **Smart Monitoring**: Automatically activates at low confidence
- **Notifications**: Receive alerts about important changes
- **Responsive Design**: Works on all devices

### 🔄 Working Logic
1. **Click "Start Analysis"** → System analyzes market
2. **If confidence ≥80%** → Shows result
3. **If confidence <80%** → Enables background monitoring
4. **When changes detected** → Sends notifications

## 🛠️ For Developers

### Running with C++ Server
```bash
# Установите зависимости
pip install -r requirements.txt

# Соберите C++ сервер
mkdir build && cd build
cmake ..
make

# Запустите сервер
./market_predictor_server

# В другом терминале запустите веб-интерфейс
python start.py
```

### Running with Machine Learning
```bash
# Обучите модель
python ml_demo.py

# Запустите приложение
python start.py
```

## 📱 Testing

### Check All Functions:
1. ✅ **Analysis**: Click button and wait for result
2. ✅ **Monitoring**: Will activate automatically at low confidence
3. ✅ **Notifications**: Allow in browser and wait for alert
4. ✅ **Log**: View entries in event log
5. ✅ **Responsiveness**: Open on mobile device

### Expected Results:
- **Analysis time**: 2-5 seconds
- **Directions**: UP, DOWN, NEUTRAL
- **Confidence**: 50-95%
- **Monitoring**: every 30 seconds
- **Notifications**: at confidence ≥85%

## 🚨 Troubleshooting

### Notifications Not Working
- Ensure you allowed notifications in browser
- Check that site is opened via HTTPS (for some browsers)

### Analysis Not Starting
- Check browser console (F12)
- Ensure all files are in same folder

### Server Not Starting
- Check that port 8080 is free
- Install dependencies: `pip install -r requirements.txt`

## 🎉 Done!

Your MarketPredictor is ready to use!

**Next Steps:**
- Study code in `script.js` to understand logic
- Set up real APIs for data retrieval
- Add machine learning with `ml_demo.py`
- Integrate with trading platforms

---

**💡 Tip**: This is a demo version with data simulation. For real usage, connect exchange APIs and set up machine learning!
