#!/usr/bin/env node

/**
 * فحص حالة النشر - Deployment Status Checker
 * 
 * يفحص هذا السكريبت حالة النشر ويعطي تعليمات واضحة
 * This script checks deployment status and provides clear instructions
 */

console.log('🔍 فحص حالة النشر / Checking Deployment Status...\n');
console.log('============================================================\n');

// Check if we're in the right directory
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'index.html',
  'package.json',
  'server.js',
  '.github/workflows/deploy.yml'
];

console.log('✅ فحص الملفات المطلوبة / Checking required files:\n');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n============================================================\n');

if (!allFilesExist) {
  console.log('❌ بعض الملفات المطلوبة مفقودة / Some required files are missing');
  console.log('   تأكد من أنك في المجلد الصحيح / Make sure you\'re in the correct directory\n');
  process.exit(1);
}

console.log('✅ جميع الملفات المطلوبة موجودة / All required files present\n');
console.log('============================================================\n');

// Check deployment configuration
console.log('📋 حالة التكوين / Configuration Status:\n');

// Check if index.html exists and is valid
const indexPath = path.join(__dirname, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

if (indexContent.includes('<!DOCTYPE html>')) {
  console.log('   ✅ ملف index.html صالح / Valid index.html file');
} else {
  console.log('   ⚠️  ملف index.html قد يكون غير صالح / index.html might be invalid');
}

// Check workflow
const workflowPath = path.join(__dirname, '.github/workflows/deploy.yml');
const workflowContent = fs.readFileSync(workflowPath, 'utf8');

if (workflowContent.includes('actions/deploy-pages')) {
  console.log('   ✅ سير عمل النشر مُعَد بشكل صحيح / Deploy workflow properly configured');
} else {
  console.log('   ⚠️  سير عمل النشر قد يحتاج تحديث / Deploy workflow might need updates');
}

console.log('\n============================================================\n');

// Check if node_modules exists
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));

console.log('📦 الاعتماديات / Dependencies:\n');

if (nodeModulesExists) {
  console.log('   ✅ node_modules موجود / node_modules exists');
  console.log('   يمكنك تشغيل الخادم بـ: npm start');
  console.log('   You can run the server with: npm start\n');
} else {
  console.log('   ⚠️  node_modules غير موجود / node_modules not found');
  console.log('   قم بتشغيل: npm install');
  console.log('   Run: npm install\n');
}

console.log('============================================================\n');

// Provide deployment instructions
console.log('🚀 تعليمات النشر / Deployment Instructions:\n');
console.log('   المستودع جاهز للنشر تقنياً / Repository is technically ready for deployment\n');
console.log('   ⚠️  يحتاج إلى فتح القفل / Needs to be unlocked:\n');
console.log('   1️⃣  اجعل المستودع عاماً (Public)');
console.log('      Make repository public\n');
console.log('   2️⃣  فعّل GitHub Pages من Settings > Pages');
console.log('      Enable GitHub Pages from Settings > Pages\n');
console.log('   3️⃣  اختر Source: "GitHub Actions"');
console.log('      Select Source: "GitHub Actions"\n');
console.log('   📖 للتفاصيل الكاملة، راجع: UNLOCK_AND_DEPLOY.md');
console.log('      For full details, see: UNLOCK_AND_DEPLOY.md\n');

console.log('============================================================\n');

console.log('🌐 رابط النشر المتوقع / Expected Deployment URL:\n');
console.log('   https://ali5829511.github.io/N-M/\n');
console.log('   سيكون متاحاً بعد فتح القفل / Will be available after unlocking\n');

console.log('============================================================\n');

// Local server instructions
console.log('💻 اختبار محلي / Local Testing:\n');
console.log('   لاختبار النظام محلياً: npm start');
console.log('   To test locally: npm start\n');
console.log('   ثم افتح: http://localhost:8080');
console.log('   Then open: http://localhost:8080\n');

console.log('============================================================\n');

console.log('✅ الفحص اكتمل / Check complete!\n');
