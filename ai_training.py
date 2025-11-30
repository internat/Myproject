#!/usr/bin/env python3
"""
MarketPredictor AI Training - Обучение модели для анализа и предсказания рынка EURUSD
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import requests
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.pipeline import Pipeline
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, LSTM
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import json
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import tqdm

# Настройки для воспроизводимости результатов
np.random.seed(42)
tf.random.set_seed(42)

class MarketDataProcessor:
    """
    Класс для загрузки и обработки рыночных данных EURUSD
    """
    
    def __init__(self, data_dir='data'):
        """Инициализация с указанием директории для данных"""
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
    
    def fetch_market_data(self, symbol='EURUSD', interval='daily', days=365):
        """
        Загружает реальные рыночные данные с Alpha Vantage API
        """
        print(f"📊 Загружаем реальные данные для {symbol} за {days} дней...")
        
        try:
            # Проверяем, есть ли сохраненные данные
            cache_file = f'{self.data_dir}/{symbol}_{interval}_{days}days.csv'
            if os.path.exists(cache_file):
                print(f"📁 Используем кэшированные данные из {cache_file}")
                df = pd.read_csv(cache_file)
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                return df
            
            # Используем Alpha Vantage API для получения данных (бесплатный ключ)
            # Можно получить бесплатный ключ на https://www.alphavantage.co/support/#api-key
            api_key = "demo"  # Замените на свой ключ
            
            # Определяем параметры запроса в зависимости от интервала
            if interval == 'daily':
                function = 'FX_DAILY'
                outputsize = 'full'
                interval_param = None
            else:
                function = 'FX_INTRADAY'
                outputsize = 'full'
                interval_param = interval
            
            # Формируем URL запроса
            url = f"https://www.alphavantage.co/query?function={function}&from_symbol=EUR&to_symbol=USD"
            if interval_param:
                url += f"&interval={interval_param}"
            url += f"&outputsize={outputsize}&apikey={api_key}"
            
            # Выполняем запрос
            print(f"🌐 Запрашиваем данные с Alpha Vantage API...")
            response = requests.get(url)
            data = response.json()
            
            # Проверяем наличие ошибок
            if 'Error Message' in data:
                print(f"❌ Ошибка API: {data['Error Message']}")
                return self.generate_demo_data(days, symbol)
            
            # Извлекаем данные из ответа
            if function == 'FX_DAILY':
                time_series_key = 'Time Series FX (Daily)'
            else:
                time_series_key = f'Time Series FX ({interval_param})'
            
            if time_series_key not in data:
                print(f"❌ Ошибка: Данные не найдены в ответе API")
                return self.generate_demo_data(days, symbol)
            
            # Преобразуем данные в DataFrame
            time_series = data[time_series_key]
            records = []
            
            for date, values in time_series.items():
                records.append({
                    'timestamp': date,
                    'open': float(values['1. open']),
                    'high': float(values['2. high']),
                    'low': float(values['3. low']),
                    'close': float(values['4. close']),
                    'volume': 0  # Alpha Vantage не предоставляет объем для Forex
                })
            
            df = pd.DataFrame(records)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            
            # Ограничиваем данные указанным количеством дней
            start_date = datetime.now() - timedelta(days=days)
            df = df[df['timestamp'] >= start_date]
            
            # Сохраняем данные в кэш
            df.to_csv(cache_file, index=False)
            print(f"💾 Данные сохранены в {cache_file}")
            
            return df
            
        except Exception as e:
            print(f"❌ Ошибка при получении данных: {e}")
            print("⚠️ Генерируем демонстрационные данные...")
            return self.generate_demo_data(days, symbol)
    
    def generate_demo_data(self, days=365, symbol='EURUSD'):
        """
        Генерирует демонстрационные рыночные данные
        Используется как запасной вариант, если API недоступен
        """
        print(f"📊 Генерируем демо-данные для {symbol} за {days} дней...")
        
        # Базовые параметры
        base_price = 1.0850
        volatility = 0.002
        trend_strength = 0.0001
        
        # Генерируем временные метки
        dates = pd.date_range(start=datetime.now() - timedelta(days=days), 
                            end=datetime.now(), freq='D')
        
        # Генерируем цены с трендом и волатильностью
        np.random.seed(42)  # Для воспроизводимости
        price_changes = np.random.normal(trend_strength, volatility, len(dates))
        prices = [base_price]
        
        for change in price_changes[1:]:
            new_price = prices[-1] + change
            prices.append(max(0.5, new_price))  # Минимальная цена 0.5
        
        # Создаем DataFrame
        df = pd.DataFrame({
            'timestamp': dates,
            'open': prices,
            'high': [p + abs(np.random.normal(0, 0.0005)) for p in prices],
            'low': [p - abs(np.random.normal(0, 0.0005)) for p in prices],
            'close': [p + np.random.normal(0, 0.0005) for p in prices],
            'volume': [int(np.random.normal(1000000, 200000)) for _ in prices]
        })
        
        # Сохраняем демо-данные
        cache_file = f'{self.data_dir}/{symbol}_daily_{days}days_demo.csv'
        df.to_csv(cache_file, index=False)
        print(f"💾 Демо-данные сохранены в {cache_file}")
        
        return df
    
    def add_technical_indicators(self, df):
        """
        Добавляет технические индикаторы к данным
        """
        print("📈 Добавляем технические индикаторы...")
        
        # Копируем DataFrame, чтобы не изменять оригинал
        df = df.copy()
        
        # Простые скользящие средние (SMA)
        df['sma5'] = df['close'].rolling(window=5).mean()
        df['sma20'] = df['close'].rolling(window=20).mean()
        df['sma50'] = df['close'].rolling(window=50).mean()
        
        # Экспоненциальные скользящие средние (EMA)
        df['ema12'] = df['close'].ewm(span=12, adjust=False).mean()
        df['ema26'] = df['close'].ewm(span=26, adjust=False).mean()
        
        # MACD (Moving Average Convergence Divergence)
        df['macd'] = df['ema12'] - df['ema26']
        df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
        df['macd_hist'] = df['macd'] - df['macd_signal']
        
        # RSI (Relative Strength Index)
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        df['bb_middle'] = df['close'].rolling(window=20).mean()
        df['bb_std'] = df['close'].rolling(window=20).std()
        df['bb_upper'] = df['bb_middle'] + 2 * df['bb_std']
        df['bb_lower'] = df['bb_middle'] - 2 * df['bb_std']
        
        # Стохастический осциллятор
        low_min = df['low'].rolling(window=14).min()
        high_max = df['high'].rolling(window=14).max()
        df['stoch_k'] = 100 * ((df['close'] - low_min) / (high_max - low_min))
        df['stoch_d'] = df['stoch_k'].rolling(window=3).mean()
        
        # ATR (Average True Range)
        tr1 = df['high'] - df['low']
        tr2 = abs(df['high'] - df['close'].shift())
        tr3 = abs(df['low'] - df['close'].shift())
        df['tr'] = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        df['atr'] = df['tr'].rolling(window=14).mean()
        
        # Momentum
        df['momentum'] = df['close'] - df['close'].shift(10)
        
        # Процентное изменение
        df['pct_change'] = df['close'].pct_change()
        
        # Целевая переменная: направление движения цены через N дней
        df['target_1d'] = np.where(df['close'].shift(-1) > df['close'], 1, 0)
        df['target_3d'] = np.where(df['close'].shift(-3) > df['close'], 1, 0)
        df['target_5d'] = np.where(df['close'].shift(-5) > df['close'], 1, 0)
        
        # Удаляем строки с NaN значениями
        df = df.dropna()
        
        return df
    
    def prepare_features_targets(self, df, target_column='target_1d', test_size=0.2):
        """
        Подготавливает признаки и целевые переменные для обучения
        """
        print("🔧 Подготавливаем данные для обучения...")
        
        # Выбираем признаки
        feature_columns = [
            'open', 'high', 'low', 'close', 'volume',
            'sma5', 'sma20', 'sma50', 'ema12', 'ema26',
            'macd', 'macd_signal', 'macd_hist',
            'rsi', 'bb_middle', 'bb_std', 'bb_upper', 'bb_lower',
            'stoch_k', 'stoch_d', 'atr', 'momentum', 'pct_change'
        ]
        
        # Создаем массивы признаков и целевых переменных
        X = df[feature_columns].values
        y = df[target_column].values
        
        # Разделяем данные на обучающую и тестовую выборки
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, shuffle=False
        )
        
        # Нормализуем данные
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        return X_train_scaled, X_test_scaled, y_train, y_test, scaler, feature_columns

class MarketPredictor:
    """
    Класс для обучения и оценки моделей машинного обучения
    """
    
    def __init__(self, models_dir='models'):
        """Инициализация с указанием директории для моделей"""
        self.models_dir = models_dir
        os.makedirs(models_dir, exist_ok=True)
    
    def train_ml_model(self, X_train, y_train, model_type='random_forest'):
        """
        Обучает модель машинного обучения
        """
        print(f"🧠 Обучаем модель машинного обучения ({model_type})...")
        
        if model_type == 'random_forest':
            # Настраиваем и обучаем случайный лес
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            model.fit(X_train, y_train)
            
        elif model_type == 'gradient_boosting':
            # Настраиваем и обучаем градиентный бустинг
            model = GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
            model.fit(X_train, y_train)
            
        else:
            raise ValueError(f"Неизвестный тип модели: {model_type}")
        
        return model
    
    def train_dl_model(self, X_train, y_train, epochs=100, batch_size=32):
        """
        Обучает модель глубокого обучения
        """
        print("🧠 Обучаем модель глубокого обучения...")
        
        # Определяем улучшенную архитектуру модели
        model = Sequential([
            Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
            Dropout(0.3),
            Dense(256, activation='relu'),
            Dropout(0.3),
            Dense(128, activation='relu'),
            Dropout(0.3),
            Dense(64, activation='relu'),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dense(1, activation='sigmoid')
        ])
        
        # Компилируем модель с оптимизированными параметрами
        optimizer = keras.optimizers.Adam(learning_rate=0.0005)
        model.compile(
            optimizer=optimizer,
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        # Настраиваем колбэки с улучшенными параметрами
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=20,
                restore_best_weights=True,
                verbose=1
            ),
            ModelCheckpoint(
                filepath=f"{self.models_dir}/dl_model_checkpoint.h5",
                monitor='val_loss',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Обучаем модель с увеличенным числом эпох
        history = model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            callbacks=callbacks,
            verbose=1
        )
        
        # Сохраняем историю обучения
        with open(f"{self.models_dir}/model_history.json", 'w') as f:
            json.dump(history.history, f)
        
        return model, history
    
    def evaluate_model(self, model, X_test, y_test, model_type='ml'):
        """
        Оценивает качество модели
        """
        print("📊 Оцениваем качество модели...")
        
        if model_type == 'dl':
            # Для моделей глубокого обучения
            y_pred_proba = model.predict(X_test)
            y_pred = (y_pred_proba > 0.5).astype(int).flatten()
        else:
            # Для моделей машинного обучения
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        # Рассчитываем метрики
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        # Выводим результаты
        print(f"Точность (Accuracy): {accuracy:.4f}")
        print(f"Точность (Precision): {precision:.4f}")
        print(f"Полнота (Recall): {recall:.4f}")
        print(f"F1-мера: {f1:.4f}")
        
        # Строим матрицу ошибок
        cm = confusion_matrix(y_test, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title('Матрица ошибок')
        plt.ylabel('Истинный класс')
        plt.xlabel('Предсказанный класс')
        plt.savefig('visualizations/confusion_matrix.png')
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'y_pred': y_pred,
            'y_pred_proba': y_pred_proba
        }
    
    def save_model(self, model, scaler, feature_columns, model_type='ml', version='v1'):
        """
        Сохраняет модель и связанные с ней данные
        """
        print(f"💾 Сохраняем модель ({model_type})...")
        
        if model_type == 'dl':
            # Сохраняем модель глубокого обучения с современным форматом
            model_path = f"{self.models_dir}/dl_model_{version}.keras"
            try:
                model.save(model_path, save_format='keras')
            except Exception as e:
                print(f"⚠️ Ошибка при сохранении в формате .keras: {e}")
                # Запасной вариант - сохраняем в формате h5
                model_path = f"{self.models_dir}/dl_model_{version}.h5"
                model.save(model_path, save_format='h5')
                print(f"✅ Модель сохранена в {model_path} (формат h5)")
        else:
            # Сохраняем модель машинного обучения
            model_path = f"{self.models_dir}/market_predictor_model_{version}.pkl"
            joblib.dump(model, model_path)
        
        # Сохраняем скейлер
        scaler_path = f"{self.models_dir}/scaler_{version}.pkl"
        joblib.dump(scaler, scaler_path)
        
        # Сохраняем список признаков
        features_path = f"{self.models_dir}/feature_columns_{version}.json"
        with open(features_path, 'w') as f:
            json.dump(feature_columns, f)
        
        print(f"✅ Модель сохранена в {model_path}")
        
        return model_path
    
    def plot_feature_importance(self, model, feature_columns):
        """
        Визуализирует важность признаков для модели
        """
        if not hasattr(model, 'feature_importances_'):
            print("⚠️ Модель не поддерживает важность признаков")
            return
        
        # Получаем важность признаков
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1]
        
        # Строим график
        plt.figure(figsize=(12, 8))
        plt.title('Важность признаков')
        plt.bar(range(len(importances)), importances[indices])
        plt.xticks(range(len(importances)), [feature_columns[i] for i in indices], rotation=90)
        plt.tight_layout()
        plt.savefig('feature_importance.png')
        
        return importances, indices
    
    def plot_training_history(self, history):
        """
        Визуализирует историю обучения модели глубокого обучения
        """
        plt.figure(figsize=(12, 5))
        
        # График точности
        plt.subplot(1, 2, 1)
        plt.plot(history.history['accuracy'])
        plt.plot(history.history['val_accuracy'])
        plt.title('Точность модели')
        plt.ylabel('Точность')
        plt.xlabel('Эпоха')
        plt.legend(['Обучение', 'Валидация'], loc='lower right')
        
        # График функции потерь
        plt.subplot(1, 2, 2)
        plt.plot(history.history['loss'])
        plt.plot(history.history['val_loss'])
        plt.title('Функция потерь')
        plt.ylabel('Потери')
        plt.xlabel('Эпоха')
        plt.legend(['Обучение', 'Валидация'], loc='upper right')
        
        plt.tight_layout()
        plt.savefig('visualizations/dl_training_history.png')
    
    def plot_predictions(self, df, y_test, y_pred, y_pred_proba):
        """
        Визуализирует предсказания модели
        """
        # Создаем DataFrame для визуализации
        test_df = df.iloc[-len(y_test):].copy()
        test_df['prediction'] = y_pred
        test_df['probability'] = y_pred_proba
        
        # Создаем интерактивный график с Plotly
        fig = make_subplots(rows=2, cols=1, shared_xaxes=True, 
                           vertical_spacing=0.1, 
                           subplot_titles=('Цена закрытия', 'Вероятность роста'))
        
        # График цены закрытия
        fig.add_trace(
            go.Scatter(x=test_df['timestamp'], y=test_df['close'], 
                      name='Цена закрытия', line=dict(color='blue')),
            row=1, col=1
        )
        
        # График вероятности роста
        fig.add_trace(
            go.Scatter(x=test_df['timestamp'], y=test_df['probability'], 
                      name='Вероятность роста', line=dict(color='green')),
            row=2, col=1
        )
        
        # Добавляем горизонтальную линию на уровне 0.5
        fig.add_shape(
            type='line', line=dict(dash='dash', color='red'),
            x0=test_df['timestamp'].iloc[0], y0=0.5,
            x1=test_df['timestamp'].iloc[-1], y1=0.5,
            row=2, col=1
        )
        
        # Настраиваем макет
        fig.update_layout(
            title='Предсказания модели',
            height=800,
            legend=dict(orientation='h', y=1.1),
            xaxis2=dict(title='Дата'),
            yaxis=dict(title='Цена (USD)'),
            yaxis2=dict(title='Вероятность')
        )
        
        # Сохраняем график
        fig.write_html('visualizations/final_prediction.html')

def main():
    """
    Основная функция для обучения и оценки моделей
    """
    print("🚀 Запуск обучения моделей MarketPredictor...")
    
    # Создаем директории для данных и визуализаций
    os.makedirs('data', exist_ok=True)
    os.makedirs('visualizations', exist_ok=True)
    
    # Инициализируем обработчик данных и предиктор
    data_processor = MarketDataProcessor()
    predictor = MarketPredictor()
    
    # Загружаем и обрабатываем данные
    df = data_processor.fetch_market_data(symbol='EURUSD', interval='daily', days=1000)
    df = data_processor.add_technical_indicators(df)
    
    # Подготавливаем данные для обучения
    X_train, X_test, y_train, y_test, scaler, feature_columns = data_processor.prepare_features_targets(
        df, target_column='target_1d', test_size=0.2
    )
    
    # Обучаем модель машинного обучения
    ml_model = predictor.train_ml_model(X_train, y_train, model_type='random_forest')
    ml_metrics = predictor.evaluate_model(ml_model, X_test, y_test, model_type='ml')
    predictor.save_model(ml_model, scaler, feature_columns, model_type='ml', version='v1')
    
    # Визуализируем важность признаков
    predictor.plot_feature_importance(ml_model, feature_columns)
    
    # Обучаем модель глубокого обучения с улучшенной архитектурой
    dl_model, history = predictor.train_dl_model(X_train, y_train, epochs=100, batch_size=32)
    dl_metrics = predictor.evaluate_model(dl_model, X_test, y_test, model_type='dl')
    predictor.save_model(dl_model, scaler, feature_columns, model_type='dl', version='v1')
    
    # Визуализируем историю обучения
    predictor.plot_training_history(history)
    
    # Визуализируем предсказания
    predictor.plot_predictions(df, y_test, dl_metrics['y_pred'], dl_metrics['y_pred_proba'])
    
    print("✅ Обучение моделей завершено!")
    print(f"📊 Точность ML модели: {ml_metrics['accuracy']:.4f}")
    print(f"📊 Точность DL модели: {dl_metrics['accuracy']:.4f}")
    print("📈 Графики сохранены в директории 'visualizations'")
    print("💾 Модели сохранены в директории 'models'")

if __name__ == "__main__":
    main()