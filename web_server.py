#!/usr/bin/env python3
"""
Простой веб-сервер для MarketPredictor
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import os
import sys
from pathlib import Path

class MarketPredictorServer:
    def __init__(self, port=8000):
        self.port = port
        self.server = None
        
    def start_server(self):
        """Запускает веб-сервер"""
        try:
            handler = http.server.SimpleHTTPRequestHandler
            
            with socketserver.TCPServer(("", self.port), handler) as httpd:
                print(f"🌐 Веб-сервер запущен на http://localhost:{self.port}")
                print(f"📁 Обслуживаем файлы из: {os.getcwd()}")
                self.server = httpd
                httpd.serve_forever()
                
        except OSError as e:
            if e.errno == 48:  # Address already in use
                print(f"❌ Порт {self.port} уже занят!")
            else:
                print(f"❌ Ошибка запуска сервера: {e}")
    
    def open_browser(self):
        """Открывает браузер"""
        time.sleep(1)
        try:
            url = f"http://localhost:{self.port}/index.html"
            webbrowser.open(url)
            print(f"🌍 Браузер открыт: {url}")
        except Exception as e:
            print(f"❌ Ошибка открытия браузера: {e}")
    
    def check_files(self):
        """Проверяет наличие файлов"""
        required_files = ['index.html', 'style.css', 'script.js']
        missing_files = []
        
        for file in required_files:
            if not Path(file).exists():
                missing_files.append(file)
        
        if missing_files:
            print("❌ Отсутствуют файлы:")
            for file in missing_files:
                print(f"   - {file}")
            return False
        
        print("✅ Все необходимые файлы найдены")
        return True
    
    def run(self):
        """Запускает сервер"""
        print("🚀 MarketPredictor - Веб-сервер")
        print("=" * 40)
        
        if not self.check_files():
            return
        
        print(f"🚀 Запуск на порту {self.port}...")
        
        # Запускаем сервер в отдельном потоке
        server_thread = threading.Thread(target=self.start_server)
        server_thread.daemon = True
        server_thread.start()
        
        # Открываем браузер
        browser_thread = threading.Thread(target=self.open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        try:
            print("✅ Сервер запущен!")
            print("💡 Нажмите Ctrl+C для остановки")
            
            while True:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n🛑 Остановка сервера...")
            if self.server:
                self.server.shutdown()
            print("✅ Сервер остановлен")

def main():
    """Главная функция"""
    server = MarketPredictorServer()
    server.run()

if __name__ == "__main__":
    main()
