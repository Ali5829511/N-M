#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
نظام إدارة المرور - خادم Python بسيط
Traffic Management System - Simple Python Server

استخدام / Usage:
    python3 simple-server.py [port]
    
مثال / Example:
    python3 simple-server.py 8080
"""

import http.server
import socketserver
import sys
import os
from pathlib import Path

# تحديد المنفذ الافتراضي
DEFAULT_PORT = 8080

def get_local_ip():
    """الحصول على عنوان IP المحلي"""
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "Unable to determine"

def main():
    # الحصول على رقم المنفذ من الوسائط أو استخدام الافتراضي
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    
    # التأكد من أننا في مجلد المشروع الصحيح
    if not Path('index.html').exists():
        print("⚠️  تحذير / Warning: index.html not found!")
        print("   تأكد من تشغيل السكريبت في مجلد المشروع")
        print("   Make sure you're running the script in the project directory")
        sys.exit(1)
    
    # إعداد الخادم
    Handler = http.server.SimpleHTTPRequestHandler
    
    # تخصيص المعالج لدعم ترميز UTF-8
    class CustomHandler(Handler):
        def end_headers(self):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.send_header('Expires', '0')
            super().end_headers()
    
    try:
        with socketserver.TCPServer(("", port), CustomHandler) as httpd:
            print("\n" + "=" * 60)
            print("🚀 نظام إدارة المرور - خادم Python بسيط")
            print("🚀 Traffic Management System - Simple Python Server")
            print("=" * 60)
            print(f"\n✅ الخادم يعمل الآن / Server is running!")
            print(f"\n📡 العنوان المحلي / Local Address:")
            print(f"   http://localhost:{port}")
            print(f"   http://127.0.0.1:{port}")
            
            local_ip = get_local_ip()
            if local_ip != "Unable to determine":
                print(f"\n🌐 عنوان الشبكة / Network Address:")
                print(f"   http://{local_ip}:{port}")
            
            print(f"\n💡 نصائح / Tips:")
            print(f"   - اضغط Ctrl+C لإيقاف الخادم / Press Ctrl+C to stop")
            print(f"   - افتح المتصفح على العنوان أعلاه / Open browser at address above")
            print(f"   - للمزيد من الميزات استخدم npm start / For more features use npm start")
            print("\n" + "=" * 60 + "\n")
            
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48 or e.errno == 98:  # Address already in use
            print(f"\n❌ خطأ / Error: المنفذ {port} مستخدم بالفعل!")
            print(f"   Port {port} is already in use!")
            print(f"\n💡 جرب منفذ آخر / Try another port:")
            print(f"   python3 simple-server.py 3000")
        else:
            print(f"\n❌ خطأ / Error: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⏹️  تم إيقاف الخادم بنجاح / Server stopped successfully")
        print("👋 شكراً لاستخدامك نظام إدارة المرور / Thank you for using the system\n")
        sys.exit(0)

if __name__ == "__main__":
    main()
