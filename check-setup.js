#!/usr/bin/env node

/**
 * أداة فحص إعداد الخادم - Server Setup Checker
 * تساعد في تشخيص مشاكل بدء الخادم
 * Helps diagnose server startup issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n' + '='.repeat(70));
console.log('🔍 فحص إعداد الخادم المحلي / Checking Local Server Setup');
console.log('='.repeat(70) + '\n');

let allChecksPass = true;

// Check 1: Node.js version
console.log('1️⃣ فحص إصدار Node.js / Checking Node.js version...');
try {
  const nodeVersion = process.version;
  console.log(`   ✅ Node.js ${nodeVersion} مثبّت / installed`);
  
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 14) {
    console.log(`   ⚠️  تحذير: يُفضّل Node.js 14+ (الحالي: ${nodeVersion})`);
    console.log(`   ⚠️  Warning: Node.js 14+ recommended (current: ${nodeVersion})`);
  }
} catch (err) {
  console.log('   ❌ خطأ في فحص Node.js / Error checking Node.js');
  allChecksPass = false;
}

// Check 2: package.json exists
console.log('\n2️⃣ فحص ملف package.json / Checking package.json...');
if (fs.existsSync(path.join(__dirname, 'package.json'))) {
  console.log('   ✅ package.json موجود / found');
} else {
  console.log('   ❌ package.json غير موجود / not found');
  allChecksPass = false;
}

// Check 3: node_modules exists
console.log('\n3️⃣ فحص المتطلبات / Checking dependencies...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('   ✅ node_modules موجود / found');
  
  // Check if express is installed
  try {
    require.resolve('express');
    console.log('   ✅ Express.js مثبّت / installed');
  } catch (err) {
    console.log('   ❌ Express.js غير مثبّت / not installed');
    console.log('   💡 شغّل / Run: npm install');
    allChecksPass = false;
  }
} else {
  console.log('   ❌ node_modules غير موجود / not found');
  console.log('   💡 المتطلبات غير مثبتة / Dependencies not installed');
  console.log('   💡 شغّل / Run: npm install');
  allChecksPass = false;
}

// Check 4: server.js exists
console.log('\n4️⃣ فحص ملف الخادم / Checking server file...');
if (fs.existsSync(path.join(__dirname, 'server.js'))) {
  console.log('   ✅ server.js موجود / found');
} else {
  console.log('   ❌ server.js غير موجود / not found');
  allChecksPass = false;
}

// Check 5: index.html exists
console.log('\n5️⃣ فحص الملفات الأساسية / Checking essential files...');
if (fs.existsSync(path.join(__dirname, 'index.html'))) {
  console.log('   ✅ index.html موجود / found');
} else {
  console.log('   ⚠️  index.html غير موجود / not found');
  console.log('   ⚠️  الخادم قد لا يعرض الصفحة الرئيسية / Server may not show homepage');
}

// Check 6: Port 8080 availability
console.log('\n6️⃣ فحص توفر المنفذ 8080 / Checking port 8080 availability...');
const net = require('net');
const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('   ⚠️  المنفذ 8080 مستخدم بالفعل / Port 8080 already in use');
    console.log('   💡 أوقف البرنامج الآخر أو استخدم منفذ مختلف:');
    console.log('   💡 Stop the other program or use a different port:');
    console.log('      PORT=3000 npm start');
  } else {
    console.log(`   ❌ خطأ في فحص المنفذ / Error checking port: ${err.message}`);
  }
});

server.once('listening', () => {
  console.log('   ✅ المنفذ 8080 متاح / Port 8080 available');
  server.close();
});

server.listen(8080, '127.0.0.1');

// Wait a bit for port check
setTimeout(() => {
  console.log('\n' + '='.repeat(70));
  
  if (allChecksPass) {
    console.log('✅ جميع الفحوصات نجحت! / All checks passed!');
    console.log('\n📝 لتشغيل الخادم / To start the server:');
    console.log('   npm start');
    console.log('\n🌐 ثم افتح / Then open:');
    console.log('   http://localhost:8080');
  } else {
    console.log('❌ بعض الفحوصات فشلت / Some checks failed');
    console.log('\n📝 خطوات الإصلاح / Fix steps:');
    console.log('   1. تأكد من وجودك في مجلد المشروع / Ensure you\'re in project folder');
    console.log('   2. شغّل: npm install');
    console.log('   3. شغّل: npm start');
    console.log('   4. افتح: http://localhost:8080');
  }
  
  console.log('\n📖 للمزيد من المساعدة / For more help:');
  console.log('   راجع / See: SERVER_SETUP_AR.md');
  console.log('='.repeat(70) + '\n');
}, 100);
