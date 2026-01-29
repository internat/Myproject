# 📊 Guide to Adding Custom Indicators

## 🎯 How to Add Your Tested Indicators

### Step 1: Open file `custom_indicators.py`

This file already has templates for your indicators:

```python
@staticmethod
def your_custom_indicator_1(df, period=14):
    """
    Your first tested indicator
    Replace with real formula
    """
    # YOUR FORMULA HERE
    return indicator
```

### Step 2: Replace Formulas

Replace examples with your real formulas:

```python
@staticmethod
def your_custom_indicator_1(df, period=14):
    """
    My tested RSI and volume combination indicator
    """
    rsi = CustomIndicators.calculate_rsi(df['close'], period)
    volume_ratio = df['volume'] / df['volume'].rolling(window=period).mean()
    
    # Your formula
    indicator = rsi * volume_ratio * 0.5 + (df['close'] - df['close'].shift(1)) * 1000
    return indicator
```

### Step 3: Add New Indicators

If you need more indicators, add new methods:

```python
@staticmethod
def my_super_indicator(df, period=20):
    """
    My super indicator
    """
    # Your formula
    return indicator
```

### Step 4: Update Indicator List

In function `get_custom_indicators_list()` add new indicators:

```python
def get_custom_indicators_list():
    return [
        'custom_indicator_1',
        'custom_indicator_2', 
        'custom_indicator_3',
        'my_super_indicator'  # Add new
    ]
```

## 🔧 Available Base Indicators

Class `CustomIndicators` already has functions for calculating base indicators:

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

## 📈 Combination Examples

### Example 1: RSI + Volume
```python
def rsi_volume_indicator(df, period=14):
    rsi = CustomIndicators.calculate_rsi(df['close'], period)
    volume_ratio = df['volume'] / df['volume'].rolling(window=period).mean()
    return rsi * volume_ratio
```

### Example 2: MACD + Bollinger Bands
```python
def macd_bb_indicator(df):
    macd = CustomIndicators.calculate_macd(df['close'])
    upper, middle, lower = CustomIndicators.calculate_bollinger_bands(df['close'])
    bb_position = (df['close'] - lower) / (upper - lower)
    return macd * bb_position
```

### Example 3: Stochastic + Williams %R
```python
def stoch_williams_indicator(df, period=14):
    stoch_k, stoch_d = CustomIndicators.calculate_stochastic(df['high'], df['low'], df['close'], period)
    williams_r = CustomIndicators.calculate_williams_r(df['high'], df['low'], df['close'], period)
    return (stoch_k + stoch_d) / 2 + abs(williams_r) / 100
```

## 🚀 Integration with AI Model

After adding indicators, they will automatically be used in AI model training:

1. **Start training**:
   ```bash
   python ai_training.py
   ```

2. **Check feature importance** - your indicators will appear in analysis

3. **Model will use** your indicators for predictions

## 📊 Indicator Testing

Run indicator test:

```bash
python custom_indicators.py
```

This will show list of all available indicators.

## 💡 Tips

1. **Test on historical data** before adding
2. **Use different periods** for one indicator
3. **Combine indicators** for better results
4. **Add comments** to formulas
5. **Check for NaN values** in results

## 🔍 Debugging

If indicator doesn't work:

```python
# Add debug information
def debug_indicator(df, period=14):
    rsi = CustomIndicators.calculate_rsi(df['close'], period)
    print(f"RSI last 5 values: {rsi.tail()}")
    print(f"RSI statistics: {rsi.describe()}")
    return rsi
```

---

**🎯 Done!** Now your tested indicators will be used in market prediction system.
