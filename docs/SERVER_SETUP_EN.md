# 🚀 Local Server Setup Guide
# دليل إعداد الخادم المحلي

## 📋 Overview / نظرة عامة

This Traffic Management System comes with three high-quality local server options:

### Available Options:

1. **Express.js Server** (Recommended ⭐)
   - Professional high-performance server
   - Automatic file compression
   - Advanced error handling
   - Full CORS support
   - Detailed logging

2. **HTTP-Server** (Fast & Simple)
   - Lightweight Node.js server
   - Auto-opens in browser
   - Quick reload

3. **Python HTTP Server** (Traditional)
   - No additional installation required
   - Simple and straightforward

---

## 🎯 Option 1: Express.js Server (Recommended)

### Features:
- ✅ High performance with file compression
- ✅ Professional error handling
- ✅ Detailed request logging
- ✅ Full CORS support
- ✅ Smart cache headers
- ✅ Custom Arabic error pages
- ✅ Displays local and network IP addresses

### Installation:

```bash
# Install dependencies
npm install
```

### Running:

```bash
# Standard start
npm start

# Or explicitly
npm run start:express

# Development mode with auto-reload
npm run dev
```

### Accessing the System:

After starting, you'll see:
- **Local Address**: `http://localhost:8080`
- **Network IP**: `http://192.168.x.x:8080` (for access from other devices)

### Stopping:

Press `Ctrl + C` in the terminal

---

## ⚡ Option 2: HTTP-Server

### Features:
- ✅ Very lightweight and fast
- ✅ Auto-opens browser
- ✅ Simple to use
- ✅ CORS support

### Installation:

```bash
npm install
```

### Running:

```bash
npm run start:http-server
```

Browser will open automatically at `http://localhost:8080`

---

## 🐍 Option 3: Python HTTP Server

### Features:
- ✅ No installation required (Python pre-installed)
- ✅ Very simple
- ✅ Good for quick testing

### Running:

```bash
npm run start:python
```

Or directly:

```bash
python3 -m http.server 8080
```

Manually open browser at `http://localhost:8080`

---

## 🔧 Advanced Configuration

### Changing the Port:

#### Express Server:
```bash
PORT=3000 npm start
```

#### HTTP-Server:
Edit `-p 8080` in `package.json` to your desired port

#### Python Server:
```bash
python3 -m http.server 3000
```

### Changing the Host:

```bash
HOST=127.0.0.1 PORT=8080 npm start
```

---

## 📊 Comparison

| Feature | Express.js | HTTP-Server | Python |
|---------|-----------|-------------|---------|
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Ease of Use** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Features** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Professional** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Installation** | Needs npm | Needs npm | None |
| **Error Handling** | Excellent | Good | Basic |
| **CORS** | Yes | Yes | No |
| **Compression** | Yes | No | No |
| **Logging** | Detailed | Basic | Basic |

---

## 🎓 Recommended Usage

### For Development & Testing:
- Use **Express.js** with `npm run dev` for auto-reload

### For Demo:
- Use **Express.js** with `npm start` for professional experience

### For Quick Testing:
- Use **HTTP-Server** with `npm run start:http-server`

### Without Node.js:
- Use **Python Server** with `npm run start:python`

---

## 🔐 Security

⚠️ **Important Warning:**

These servers are designed **for local development and testing only**!

### For Production Environment:

1. ✅ Use professional web server (Nginx, Apache)
2. ✅ Enable HTTPS/SSL
3. ✅ Configure Firewall
4. ✅ Use strong authentication
5. ✅ Review [SECURITY.md](SECURITY.md)
6. ✅ See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment

---

## 🌐 Access from Local Network

### To allow other devices to access:

1. Start the server using any method above
2. Get your IP address:

**Windows:**
```cmd
ipconfig
```

**Linux/Mac:**
```bash
ifconfig
# or
ip addr show
```

3. On other device, open browser and go to:
   ```
   http://[YOUR-IP]:8080
   ```

Example: `http://192.168.1.100:8080`

⚠️ **Note**: Make sure:
- No firewall blocking the connection
- Devices are on the same network

---

## 🆘 Common Issues & Solutions

### Issue: "Port already in use"

**Solution:**
```bash
# Try different port
PORT=3000 npm start
```

Or stop the application using the port:

**Windows:**
```cmd
netstat -ano | findstr :8080
taskkill /PID [PROCESS_ID] /F
```

**Linux/Mac:**
```bash
lsof -ti:8080 | xargs kill
```

### Issue: "npm: command not found"

**Solution:**
- Install Node.js from [nodejs.org](https://nodejs.org)
- Or use Python Server

### Issue: "Cannot GET /"

**Solution:**
- Make sure `index.html` exists in current directory
- Make sure you're running command from correct project folder

### Issue: Page doesn't refresh

**Solution:**
- Use `npm run dev` for auto-reload
- Or manually refresh (F5 or Ctrl+R)

### Issue: "EACCES: permission denied"

**Solution:**
```bash
# Use port above 1024
PORT=8080 npm start

# Or on Linux/Mac
sudo npm start  # (not recommended)
```

---

## 📱 Compatibility

### Requirements:

**For Express.js & HTTP-Server:**
- Node.js 14.0 or newer
- npm 6.0 or newer

**For Python Server:**
- Python 3.x

### Supported Browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### Operating Systems:
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Debian, Fedora, etc.)

---

## 📚 Additional Resources

- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[README.md](README.md)** - System information
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Full deployment guide
- **[SECURITY.md](SECURITY.md)** - Security guidelines
- **[SERVER_SETUP_AR.md](SERVER_SETUP_AR.md)** - Arabic version of this guide

---

## 💡 Performance Tips

1. **Use Express.js** for best performance
2. **Close other applications** that may use the same port
3. **Use modern browser** for optimal performance
4. **For development**: Use `npm run dev` for auto-reload
5. **Avoid running as root** (on Linux/Mac)

---

## 🎯 Quick Start (Recommended Method)

```bash
# 1. Install dependencies (one time only)
npm install

# 2. Start server
npm start

# 3. Open browser at
# http://localhost:8080

# 4. Enjoy the system! 🎉
```

---

## 🚀 Easy Start Scripts

### Windows:
Double-click on:
```
start-server.bat
```

### Linux/Mac:
Run in terminal:
```bash
./start-server.sh
```

---

**Prepared by:** Traffic Management System  
**Date:** 2025  
**License:** MIT

© 2025 - Imam Muhammad Ibn Saud Islamic University. All rights reserved.
