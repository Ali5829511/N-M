# 🚀 دليل النشر السريع - Quick Publish Guide

## الحالة الحالية / Current Status
✅ **جاهز للنشر / Ready to Publish**

النظام جاهز تقنياً بنسبة 100% ويحتاج فقط إلى إجراءات يدوية بسيطة لإكمال النشر.

The system is 100% technically ready and only needs simple manual steps to complete publishing.

---

## ⚡ خطوات سريعة (5 دقائق) / Quick Steps (5 minutes)

### 1️⃣ تشغيل سكريبت النشر / Run Publish Script
```bash
./publish.sh
```
أو / Or:
```bash
npm run publish:prepare
```

هذا سيفحص جاهزية النظام ويعرض الخطوات التالية.

This will check system readiness and display next steps.

---

### 2️⃣ جعل المستودع عاماً / Make Repository Public

1. اذهب إلى / Go to: https://github.com/Ali5829511/N-M/settings
2. انتقل لأسفل إلى / Scroll to: **Danger Zone**
3. اضغط / Click: **Change visibility**
4. اختر / Select: **Make public**
5. أكد بكتابة اسم المستودع / Confirm by typing: `Ali5829511/N-M`

⏱️ **الوقت / Time:** 1 دقيقة / 1 minute

---

### 3️⃣ تفعيل GitHub Pages / Enable GitHub Pages

1. ابقَ في الإعدادات / Stay in Settings
2. اضغط على / Click on: **Pages** (في القائمة الجانبية / in sidebar)
3. في قسم المصدر / In Source section:
   - اختر / Select: **GitHub Actions**
4. احفظ / Save

⏱️ **الوقت / Time:** 1 دقيقة / 1 minute

---

### 4️⃣ دمج الـ PR / Merge the Pull Request

1. اذهب إلى / Go to: https://github.com/Ali5829511/N-M/pulls
2. افتح PR / Open PR: "Version 1.1.0: Add changelog, release notes..."
3. راجع التغييرات / Review changes (optional)
4. اضغط / Click: **Merge pull request**
5. أكد / Confirm: **Confirm merge**

⏱️ **الوقت / Time:** 1 دقيقة / 1 minute

---

### 5️⃣ انتظر النشر / Wait for Deployment

1. اذهب إلى / Go to: https://github.com/Ali5829511/N-M/actions
2. راقب سير العمل / Watch workflow: "Deploy to GitHub Pages"
3. انتظر حتى يكتمل / Wait until complete (✅ green check)

⏱️ **الوقت / Time:** 2-3 دقائق / 2-3 minutes

---

### 6️⃣ افتح الموقع / Open the Site

**رابط الموقع / Site URL:**
```
https://ali5829511.github.io/N-M/
```

**تسجيل الدخول / Login:**
- Admin: `admin` / `admin123`
- Violations Officer: `violations_officer` / `violations123`
- Inquiry User: `inquiry_user` / `inquiry123`

⚠️ **مهم / Important:** غيّر كلمات المرور فوراً! / Change passwords immediately!

---

## 📋 قائمة التحقق / Checklist

استخدم هذه القائمة لتتبع التقدم:

Use this checklist to track progress:

- [ ] 1. تشغيل `./publish.sh` / Run `./publish.sh`
- [ ] 2. جعل المستودع عاماً / Make repository public
- [ ] 3. تفعيل GitHub Pages / Enable GitHub Pages
- [ ] 4. دمج الـ PR / Merge PR
- [ ] 5. انتظار اكتمال النشر / Wait for deployment
- [ ] 6. فتح الرابط والتحقق / Open URL and verify
- [ ] 7. تغيير كلمات المرور / Change passwords
- [ ] 8. (اختياري) إنشاء GitHub Release / (Optional) Create GitHub Release

---

## 🎯 بعد النشر / After Deployment

### ✅ اختبر النظام / Test the System
1. افتح الرابط / Open URL
2. سجل دخول بكل مستخدم / Login with each user
3. جرب الميزات الأساسية / Try core features
4. تأكد من عمل كل شيء / Ensure everything works

### 🔐 غيّر كلمات المرور / Change Passwords
1. سجل دخول كـ Admin / Login as Admin
2. اذهب إلى إدارة المستخدمين / Go to User Management
3. غيّر كلمات المرور لجميع المستخدمين / Change passwords for all users

### 🎉 (اختياري) أنشئ GitHub Release / (Optional) Create GitHub Release
```bash
# اذهب إلى / Go to
https://github.com/Ali5829511/N-M/releases/new

# استخدم / Use
GITHUB_RELEASE.md (كقالب)
```

---

## 🔧 استكشاف الأخطاء / Troubleshooting

### المشكلة: لا يمكن الوصول للموقع / Problem: Can't access site
**الحل / Solution:**
1. تحقق من GitHub Actions (يجب أن يكون أخضر ✅)
2. انتظر 5 دقائق إضافية
3. امسح cache المتصفح
4. جرب في وضع التصفح الخفي / Try incognito mode

### المشكلة: صفحة 404 / Problem: 404 page
**الحل / Solution:**
1. تأكد من تفعيل GitHub Pages
2. تأكد من أن Source = GitHub Actions
3. تحقق من نجاح workflow النشر

### المشكلة: لا يمكن تسجيل الدخول / Problem: Can't login
**الحل / Solution:**
1. تأكد من استخدام المستخدم الصحيح
2. امسح localStorage: F12 → Console → `localStorage.clear()`
3. أعد تحميل الصفحة

---

## 📚 موارد إضافية / Additional Resources

### التوثيق / Documentation:
- 📖 [CHANGELOG.md](CHANGELOG.md) - سجل التغييرات / Version history
- 📖 [RELEASE_NOTES.md](RELEASE_NOTES.md) - ملاحظات الإصدار / Release notes
- 📖 [UPDATE_PUBLISH_SUMMARY.md](UPDATE_PUBLISH_SUMMARY.md) - ملخص كامل / Complete summary
- 📖 [GITHUB_RELEASE.md](GITHUB_RELEASE.md) - قالب الإصدار / Release template
- 📖 [UNLOCK_AND_DEPLOY.md](UNLOCK_AND_DEPLOY.md) - دليل مفصل / Detailed guide

### السكريبتات / Scripts:
```bash
./publish.sh                 # فحص الجاهزية / Readiness check
npm run publish:prepare      # نفس الأعلى / Same as above
npm run deploy:status        # حالة النشر / Deployment status
npm run test:server          # اختبار الخادم / Test server
npm start                    # تشغيل محلي / Run locally
```

---

## 💡 نصائح / Tips

1. **استخدم الوضع الخفي للاختبار / Use incognito for testing**
   - يمنع مشاكل cache / Prevents cache issues

2. **احفظ النسخة الاحتياطية / Backup first**
   - قبل تغيير الرؤية / Before changing visibility

3. **اختبر محلياً أولاً / Test locally first**
   ```bash
   npm start
   # ثم افتح / Then open: http://localhost:8080
   ```

4. **راقب GitHub Actions / Monitor GitHub Actions**
   - للتحقق من حالة النشر / To check deployment status

---

## 🎊 تهانينا! / Congratulations!

بمجرد اكتمال هذه الخطوات، سيكون نظامك منشوراً ومتاحاً للجميع!

Once these steps are complete, your system will be published and available to everyone!

**رابط الموقع المنشور / Published Site URL:**
```
https://ali5829511.github.io/N-M/
```

---

## 📞 الدعم / Support

إذا واجهت أي مشاكل:

If you encounter any issues:

1. راجع [UPDATE_PUBLISH_SUMMARY.md](UPDATE_PUBLISH_SUMMARY.md)
2. راجع [UNLOCK_AND_DEPLOY.md](UNLOCK_AND_DEPLOY.md)
3. تحقق من GitHub Actions للأخطاء
4. افتح issue في GitHub

---

**آخر تحديث / Last Updated:** 2025-11-10  
**الإصدار / Version:** 1.1.0  
**الحالة / Status:** ✅ جاهز / Ready
