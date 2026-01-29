#!/usr/bin/env python3
"""
Simple web server for MarketPredictor
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
        """Starts web server"""
        try:
            handler = http.server.SimpleHTTPRequestHandler
            
            with socketserver.TCPServer(("", self.port), handler) as httpd:
                print(f"🌐 Web server started at http://localhost:{self.port}")
                print(f"📁 Serving files from: {os.getcwd()}")
                self.server = httpd
                httpd.serve_forever()
                
        except OSError as e:
            if e.errno == 48:  # Address already in use
                print(f"❌ Port {self.port} already in use!")
            else:
                print(f"❌ Server startup error: {e}")
    
    def open_browser(self):
        """Opens browser"""
        time.sleep(1)
        try:
            url = f"http://localhost:{self.port}/index.html"
            webbrowser.open(url)
            print(f"🌍 Browser opened: {url}")
        except Exception as e:
            print(f"❌ Browser opening error: {e}")
    
    def check_files(self):
        """Checks for file presence"""
        required_files = ['index.html', 'style.css', 'script.js']
        missing_files = []
        
        for file in required_files:
            if not Path(file).exists():
                missing_files.append(file)
        
        if missing_files:
            print("❌ Missing files:")
            for file in missing_files:
                print(f"   - {file}")
            return False
        
        print("✅ All required files found")
        return True
    
    def run(self):
        """Starts server"""
        print("🚀 MarketPredictor - Web Server")
        print("=" * 40)
        
        if not self.check_files():
            return
        
        print(f"🚀 Starting on port {self.port}...")
        
        # Start server in separate thread
        server_thread = threading.Thread(target=self.start_server)
        server_thread.daemon = True
        server_thread.start()
        
        # Open browser
        browser_thread = threading.Thread(target=self.open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        try:
            print("✅ Server started!")
            print("💡 Press Ctrl+C to stop")
            
            while True:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping server...")
            if self.server:
                self.server.shutdown()
            print("✅ Server stopped")

def main():
    """Main function"""
    server = MarketPredictorServer()
    server.run()

if __name__ == "__main__":
    main()
