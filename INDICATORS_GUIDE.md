# 📊 Руководство по добавлению пользовательских индикаторов

## 🎯 Как добавить ваши проверенные индикаторы

### Шаг 1: Откройте файл `custom_indicators.py`

В этом файле уже есть заготовки для ваших индикаторов:

```python
@staticmethod
def your_custom_indicator_1(df, period=14):
    """
    Ваш первый проверенный индикатор
    Замените на реальную формулу
    """
    # ВАША ФОРМУЛА ЗДЕСЬ
    return indicator
```

### Шаг 2: Замените формулы

Замените примеры на ваши реальные формулы:

```python
@staticmethod
def your_custom_indicator_1(df, period=14):
    """
    Мой проверенный индикатор комбинации RSI и объема
    """
    rsi = CustomIndicators.calculate_rsi(df['close'], period)
    volume_ratio = df['volume'] / df['volume'].rolling(window=period).mean()
    
    # Ваша формула
    indicator = rsi * volume_ratio * 0.5 + (df['close'] - df['close'].shift(1)) * 1000
    return indicator
```

### Шаг 3: Добавьте новые индикаторы

Если нужно больше индикаторов, добавьте новые методы:

```python
@staticmethod
def my_super_indicator(df, period=20):
    """
    Мой супер-индикатор
    """
    # Ваша формула
    return indicator
```

### Шаг 4: Обновите список индикаторов

В функции `get_custom_indicators_list()` добавьте новые индикаторы:

```python
def get_custom_indicators_list():
    return [
        'custom_indicator_1',
        'custom_indicator_2', 
        'custom_indicator_3',
        'my_super_indicator'  # Добавьте новый
    ]
```

## 🔧 Доступные базовые индикаторы

В классе `CustomIndicators` уже есть функции для расчета базовых индикаторов:

### RSI (Relative Strength Index)
```python
rsi = CustomIndicators.calculate_rsi(df['close'], period=14)
```

### MACD (Moving Average Convergence Divergence)
```python
macd = CustomIndicators.calculate_macd(df['close'])
```

### Bollinger Bands
```python
upper, middle, lower = CustomIndicators.calculate_bollinger_bands(df['close'])
```

### Stochastic Oscillator
```python
k_percent, d_percent = CustomIndicators.calculate_stochastic(df['high'], df['low'], df['close'])
```

### Williams %R
```python
williams_r = CustomIndicators.calculate_williams_r(df['high'], df['low'], df['close'])
```

## 📈 Примеры комбинаций

### Пример 1: RSI + Volume
```python
def rsi_volume_indicator(df, period=14):
    rsi = CustomIndicators.calculate_rsi(df['close'], period)
    volume_ratio = df['volume'] / df['volume'].rolling(window=period).mean()
    return rsi * volume_ratio
```

### Пример 2: MACD + Bollinger Bands
```python
def macd_bb_indicator(df):
    macd = CustomIndicators.calculate_macd(df['close'])
    upper, middle, lower = CustomIndicators.calculate_bollinger_bands(df['close'])
    bb_position = (df['close'] - lower) / (upper - lower)
    return macd * bb_position
```

### Пример 3: Stochastic + Williams %R
```python
def stoch_williams_indicator(df, period=14):
    stoch_k, stoch_d = CustomIndicators.calculate_stochastic(df['high'], df['low'], df['close'], period)
    williams_r = CustomIndicators.calculate_williams_r(df['high'], df['low'], df['close'], period)
    return (stoch_k + stoch_d) / 2 + abs(williams_r) / 100
```

## 🚀 Интеграция с ИИ моделью

После добавления индикаторов, они автоматически будут использоваться в тренировке ИИ модели:

1. **Запустите тренировку**:
   ```bash
   python ai_training.py
   ```

2. **Проверьте важность признаков** - ваши индикаторы появятся в анализе

3. **Модель будет использовать** ваши индикаторы для предсказаний

## 📊 Проверка индикаторов

Запустите тест индикаторов:

```bash
python custom_indicators.py
```

Это покажет список всех доступных индикаторов.

## 💡 Советы

1. **Тестируйте на исторических данных** перед добавлением
2. **Используйте разные периоды** для одного индикатора
3. **Комбинируйте индикаторы** для лучших результатов
4. **Добавляйте комментарии** к формулам
5. **Проверяйте на NaN значения** в результатах

## 🔍 Отладка

Если индикатор не работает:

```python
# Добавьте отладочную информацию
def debug_indicator(df, period=14):
    rsi = CustomIndicators.calculate_rsi(df['close'], period)
    print(f"RSI последние 5 значений: {rsi.tail()}")
    print(f"RSI статистика: {rsi.describe()}")
    return rsi
```

---

**🎯 Готово!** Теперь ваши проверенные индикаторы будут использоваться в системе предсказания рынка.
