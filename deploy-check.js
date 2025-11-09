#!/usr/bin/env node

/**
 * أداة فحص جاهزية النشر - Deployment Readiness Checker
 * 
 * هذه الأداة تتحقق من جاهزية النظام للنشر في بيئة الإنتاج
 * This tool verifies the system is ready for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('\n======================================================================');
console.log('🚀 فحص جاهزية النشر / Checking Deployment Readiness');
console.log('======================================================================\n');

let checksPassedCount = 0;
let totalChecks = 0;

function checkPass(message) {
    checksPassedCount++;
    totalChecks++;
    console.log(`   ✅ ${message}`);
}

function checkFail(message) {
    totalChecks++;
    console.log(`   ❌ ${message}`);
}

function checkWarning(message) {
    totalChecks++;
    console.log(`   ⚠️  ${message}`);
}

// 1. Check essential HTML files
console.log('1️⃣ فحص الملفات الأساسية / Checking essential files...');
const essentialFiles = [
    'index.html',
    'enhanced_immobilized_cars.html',
    'enhanced_stickers_management.html',
    'comprehensive_reports_enhanced.html',
    'plate_recognition.html',
    'resident_inquiry.html'
];

let allFilesExist = true;
essentialFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} موجود / found`);
    } else {
        checkFail(`${file} مفقود / missing`);
        allFilesExist = false;
    }
});

if (allFilesExist) {
    checkPass('جميع الملفات الأساسية موجودة / All essential files present');
} else {
    checkFail('بعض الملفات الأساسية مفقودة / Some essential files missing');
}

// 2. Check JavaScript files
console.log('\n2️⃣ فحص ملفات JavaScript / Checking JavaScript files...');
const jsFiles = [
    'js/auth.js',
    'js/database.js',
    'js/email-service.js'
];

let allJsExist = true;
jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} موجود / found`);
    } else {
        checkFail(`${file} مفقود / missing`);
        allJsExist = false;
    }
});

if (allJsExist) {
    checkPass('جميع ملفات JavaScript موجودة / All JavaScript files present');
} else {
    checkFail('بعض ملفات JavaScript مفقودة / Some JavaScript files missing');
}

// 3. Check deployment configurations
console.log('\n3️⃣ فحص ملفات الإعداد / Checking configuration files...');

if (fs.existsSync('.github/workflows/deploy.yml')) {
    checkPass('GitHub Pages workflow موجود / GitHub Pages workflow found');
} else {
    checkWarning('GitHub Pages workflow مفقود / GitHub Pages workflow missing');
}

if (fs.existsSync('render.yaml')) {
    checkPass('Render configuration موجود / Render configuration found');
} else {
    checkWarning('Render configuration مفقود / Render configuration missing');
}

if (fs.existsSync('.nojekyll')) {
    checkPass('.nojekyll file موجود / .nojekyll file found');
} else {
    checkWarning('.nojekyll file مفقود (قد يسبب مشاكل في GitHub Pages) / .nojekyll missing (may cause GitHub Pages issues)');
}

// 4. Check server files for local development
console.log('\n4️⃣ فحص ملفات الخادم المحلي / Checking local server files...');

if (fs.existsSync('server.js')) {
    checkPass('server.js موجود / server.js found');
} else {
    checkWarning('server.js مفقود / server.js missing');
}

if (fs.existsSync('package.json')) {
    checkPass('package.json موجود / package.json found');
    
    // Check if dependencies are installed
    if (fs.existsSync('node_modules')) {
        checkPass('node_modules موجود (التبعيات مثبتة) / node_modules found (dependencies installed)');
    } else {
        checkWarning('node_modules مفقود (قد تحتاج لتشغيل npm install) / node_modules missing (may need to run npm install)');
    }
} else {
    checkWarning('package.json مفقود / package.json missing');
}

// 5. Check image assets
console.log('\n5️⃣ فحص الصور / Checking image assets...');

const imageFiles = [
    'university_logo.png',
    'شعار.jpg'
];

imageFiles.forEach(file => {
    if (fs.existsSync(file)) {
        checkPass(`${file} موجود / found`);
    } else {
        checkWarning(`${file} مفقود / missing`);
    }
});

// 6. Check documentation
console.log('\n6️⃣ فحص الوثائق / Checking documentation...');

const docFiles = [
    'README.md',
    'SERVER_SETUP_AR.md',
    'DEPLOYMENT.md'
];

docFiles.forEach(file => {
    if (fs.existsSync(file)) {
        checkPass(`${file} موجود / found`);
    } else {
        checkWarning(`${file} مفقود / missing`);
    }
});

// 7. Check for security and best practices
console.log('\n7️⃣ فحص أمان وأفضل الممارسات / Checking security and best practices...');

// Check .gitignore
if (fs.existsSync('.gitignore')) {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    if (gitignoreContent.includes('node_modules')) {
        checkPass('.gitignore يستثني node_modules / .gitignore excludes node_modules');
    } else {
        checkWarning('.gitignore لا يستثني node_modules / .gitignore doesn\'t exclude node_modules');
    }
    
    if (gitignoreContent.includes('.env')) {
        checkPass('.gitignore يستثني .env / .gitignore excludes .env');
    } else {
        checkWarning('.gitignore لا يستثني .env (غير مطلوب للتطبيقات الثابتة) / .gitignore doesn\'t exclude .env (not required for static apps)');
    }
} else {
    checkWarning('.gitignore مفقود / .gitignore missing');
}

// 8. Deployment platform recommendations
console.log('\n8️⃣ توصيات منصة النشر / Deployment platform recommendations...');
console.log('   📌 خيارات النشر المتاحة / Available deployment options:');
console.log('      1. GitHub Pages (مجاني / free) - موصى به للمستودعات العامة');
console.log('      2. Render (مجاني / free) - يدعم المستودعات الخاصة');
console.log('      3. Netlify (مجاني / free) - ميزات متقدمة');
console.log('      4. Vercel (مجاني / free) - نشر سريع');

// Summary
console.log('\n======================================================================');
console.log(`📊 النتيجة / Results: ${checksPassedCount}/${totalChecks} فحص نجح / checks passed`);
console.log('======================================================================\n');

if (checksPassedCount === totalChecks) {
    console.log('✅ النظام جاهز تماماً للنشر! / System is fully ready for deployment!\n');
    console.log('📝 الخطوات التالية / Next steps:');
    console.log('   1. ادفع التغييرات إلى الفرع main / Push changes to main branch');
    console.log('   2. سيتم النشر تلقائياً إذا كان GitHub Pages مفعّل');
    console.log('      Automatic deployment will occur if GitHub Pages is enabled');
    console.log('   3. أو انشر يدوياً على Render أو Netlify');
    console.log('      Or deploy manually to Render or Netlify\n');
    process.exit(0);
} else if (checksPassedCount >= totalChecks * 0.8) {
    console.log('⚠️  النظام جاهز تقريباً للنشر مع بعض التحذيرات');
    console.log('⚠️  System is mostly ready for deployment with some warnings\n');
    console.log('💡 راجع التحذيرات أعلاه وقرر إذا كانت تحتاج إلى معالجة');
    console.log('💡 Review warnings above and decide if they need attention\n');
    process.exit(0);
} else {
    console.log('❌ النظام يحتاج إلى مزيد من الإعداد قبل النشر');
    console.log('❌ System needs more preparation before deployment\n');
    console.log('🔧 راجع الأخطاء أعلاه وقم بإصلاحها');
    console.log('🔧 Review errors above and fix them\n');
    process.exit(1);
}
