#!/usr/bin/env python3
"""
Пользовательские технические индикаторы для MarketPredictor
Добавьте сюда свои проверенные индикаторы
"""

import numpy as np
import pandas as pd

class CustomIndicators:
    """
    Класс с пользовательскими техническими индикаторами
    """
    
    @staticmethod
    def your_custom_indicator_1(df, period=14):
        """
        Ваш первый проверенный индикатор
        Замените на реальную формулу
        """
        # Пример: комбинация RSI и MACD
        rsi = CustomIndicators.calculate_rsi(df['close'], period)
        macd = CustomIndicators.calculate_macd(df['close'])
        
        # Ваша логика
        indicator = rsi * 0.7 + macd * 1000  # Пример
        return indicator
    
    @staticmethod
    def your_custom_indicator_2(df, period=20):
        """
        Ваш второй проверенный индикатор
        Замените на реальную формулу
        """
        # Пример: комбинация Bollinger Bands и Volume
        bb_upper, bb_middle, bb_lower = CustomIndicators.calculate_bollinger_bands(df['close'], period)
        volume_sma = df['volume'].rolling(window=period).mean()
        
        # Ваша логика
        indicator = (df['close'] - bb_lower) / (bb_upper - bb_lower) * (df['volume'] / volume_sma)
        return indicator
    
    @staticmethod
    def your_custom_indicator_3(df, period=10):
        """
        Ваш третий проверенный индикатор
        Замените на реальную формулу
        """
        # Пример: комбинация Stochastic и Williams %R
        stoch_k, stoch_d = CustomIndicators.calculate_stochastic(df['high'], df['low'], df['close'], period)
        williams_r = CustomIndicators.calculate_williams_r(df['high'], df['low'], df['close'], period)
        
        # Ваша логика
        indicator = (stoch_k + stoch_d) / 2 + abs(williams_r) / 100
        return indicator
    
    # Вспомогательные функции для базовых индикаторов
    
    @staticmethod
    def calculate_rsi(prices, period=14):
        """RSI (Relative Strength Index)"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    @staticmethod
    def calculate_macd(prices, fast=12, slow=26, signal=9):
        """MACD (Moving Average Convergence Divergence)"""
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal).mean()
        histogram = macd_line - signal_line
        return histogram
    
    @staticmethod
    def calculate_bollinger_bands(prices, period=20, std_dev=2):
        """Bollinger Bands"""
        sma = prices.rolling(window=period).mean()
        std = prices.rolling(window=period).std()
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        return upper_band, sma, lower_band
    
    @staticmethod
    def calculate_stochastic(high, low, close, period=14):
        """Stochastic Oscillator"""
        lowest_low = low.rolling(window=period).min()
        highest_high = high.rolling(window=period).max()
        k_percent = 100 * ((close - lowest_low) / (highest_high - lowest_low))
        d_percent = k_percent.rolling(window=3).mean()
        return k_percent, d_percent
    
    @staticmethod
    def calculate_williams_r(high, low, close, period=14):
        """Williams %R"""
        highest_high = high.rolling(window=period).max()
        lowest_low = low.rolling(window=period).min()
        williams_r = -100 * ((highest_high - close) / (highest_high - lowest_low))
        return williams_r

def add_custom_indicators_to_dataframe(df):
    """
    Добавляет пользовательские индикаторы к DataFrame
    """
    print("🔧 Добавляем пользовательские индикаторы...")
    
    # Добавляем ваши индикаторы
    df['custom_indicator_1'] = CustomIndicators.your_custom_indicator_1(df)
    df['custom_indicator_2'] = CustomIndicators.your_custom_indicator_2(df)
    df['custom_indicator_3'] = CustomIndicators.your_custom_indicator_3(df)
    
    return df

def get_custom_indicators_list():
    """
    Возвращает список пользовательских индикаторов
    """
    return [
        'custom_indicator_1',
        'custom_indicator_2', 
        'custom_indicator_3'
    ]

# Пример использования
if __name__ == "__main__":
    print("📊 Пользовательские индикаторы загружены!")
    print("🔧 Доступные индикаторы:")
    for indicator in get_custom_indicators_list():
        print(f"   - {indicator}")
    
    print("\n💡 Замените формулы в функциях на ваши проверенные индикаторы!")
