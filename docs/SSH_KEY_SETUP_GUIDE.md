# 🔐 دليل إضافة SSH Public Key - SSH Key Setup Guide

## 📋 نظرة عامة

هذا الدليل يشرح كيفية إنشاء وإضافة SSH Public Key للنشر التلقائي على GitHub و Render.com.

---

## 🔑 ما هو SSH Key؟

SSH Key هو زوج من المفاتيح (عام وخاص) يستخدم للمصادقة الآمنة:
- **Private Key** (المفتاح الخاص): يبقى سرياً على جهازك
- **Public Key** (المفتاح العام): يمكن مشاركته مع الخوادم

---

## 1️⃣ إنشاء SSH Key جديد

### على Windows:

#### استخدام Git Bash:
```bash
# فتح Git Bash
# ثم تشغيل:
ssh-keygen -t ed25519 -C "your_email@example.com"

# أو باستخدام RSA:
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

#### استخدام PowerShell:
```powershell
# فتح PowerShell كمسؤول
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### على Mac/Linux:
```bash
# فتح Terminal
ssh-keygen -t ed25519 -C "your_email@example.com"

# أو باستخدام RSA:
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

### الأسئلة التي ستظهر:
```
Enter file in which to save the key (/home/user/.ssh/id_ed25519): 
# اضغط Enter لقبول المسار الافتراضي

Enter passphrase (empty for no passphrase): 
# اختياري: أدخل كلمة مرور أو اتركها فارغة

Enter same passphrase again: 
# كرر كلمة المرور إذا أدخلتها
```

---

## 2️⃣ عرض المفتاح العام

### على Windows (Git Bash/PowerShell):
```bash
# عرض المفتاح
cat ~/.ssh/id_ed25519.pub

# أو نسخه مباشرة:
clip < ~/.ssh/id_ed25519.pub
```

### على Mac:
```bash
# عرض المفتاح
cat ~/.ssh/id_ed25519.pub

# أو نسخه مباشرة:
pbcopy < ~/.ssh/id_ed25519.pub
```

### على Linux:
```bash
# عرض المفتاح
cat ~/.ssh/id_ed25519.pub

# أو نسخه مباشرة (إذا كان xclip مثبت):
xclip -selection clipboard < ~/.ssh/id_ed25519.pub
```

---

## 3️⃣ إضافة SSH Key إلى GitHub

### الخطوة 1: فتح إعدادات GitHub
1. اذهب إلى: https://github.com/settings/keys
2. أو: GitHub → Settings → SSH and GPG keys

### الخطوة 2: إضافة مفتاح جديد
1. اضغط على **"New SSH key"**
2. املأ المعلومات:
   ```
   Title: My Deployment Key (أو أي اسم تريده)
   Key type: Authentication Key
   Key: (الصق المفتاح العام هنا)
   ```
3. اضغط **"Add SSH key"**
4. أدخل كلمة مرور GitHub للتأكيد

### الخطوة 3: التحقق من الاتصال
```bash
ssh -T git@github.com
```

يجب أن ترى:
```
Hi username! You've successfully authenticated...
```

---

## 4️⃣ إضافة Deploy Key لـ Repository محدد

إذا كنت تريد مفتاح خاص بـ repository واحد فقط:

### الخطوة 1: إنشاء مفتاح مخصص
```bash
ssh-keygen -t ed25519 -f ~/.ssh/n-m-deploy-key -C "n-m-deployment"
```

### الخطوة 2: إضافته للـ Repository
1. اذهب إلى: https://github.com/Ali5829511/N-M/settings/keys
2. اضغط **"Add deploy key"**
3. املأ:
   ```
   Title: Render.com Deploy Key
   Key: (الصق المفتاح العام)
   ☑ Allow write access (إذا كنت تحتاج الكتابة)
   ```
4. اضغط **"Add key"**

---

## 5️⃣ إضافة SSH Key إلى Render.com

### الخطوة 1: فتح Dashboard
اذهب إلى: https://dashboard.render.com/

### الخطوة 2: الوصول إلى SSH Keys
1. اضغط على اسمك في الأعلى
2. اختر **"Account Settings"**
3. من القائمة الجانبية، اختر **"SSH Public Keys"**

### الخطوة 3: إضافة المفتاح
1. اضغط **"Add SSH Public Key"**
2. املأ:
   ```
   Name: My Deployment Key
   Public Key: (الصق المفتاح العام هنا)
   ```
3. اضغط **"Save"**

---

## 6️⃣ استخدام SSH بدلاً من HTTPS

### تغيير remote إلى SSH:
```bash
# معرفة الـ remote الحالي
git remote -v

# تغيير من HTTPS إلى SSH
git remote set-url origin git@github.com:Ali5829511/N-M.git

# التحقق من التغيير
git remote -v
```

### للمشروع الحالي:
```bash
cd /path/to/N-M
git remote set-url origin git@github.com:Ali5829511/N-M.git
```

---

## 7️⃣ إضافة SSH Key إلى SSH Agent

### على Windows:
```bash
# تشغيل ssh-agent
eval $(ssh-agent -s)

# إضافة المفتاح
ssh-add ~/.ssh/id_ed25519
```

### على Mac:
```bash
# إضافة إلى keychain
ssh-add -K ~/.ssh/id_ed25519

# لجعله دائماً (إضافة لملف ~/.ssh/config):
cat >> ~/.ssh/config << EOF
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
EOF
```

### على Linux:
```bash
# تشغيل ssh-agent
eval "$(ssh-agent -s)"

# إضافة المفتاح
ssh-add ~/.ssh/id_ed25519
```

---

## 8️⃣ حل المشاكل الشائعة

### المشكلة 1: Permission denied (publickey)
**الحل:**
```bash
# التحقق من وجود المفتاح
ls -la ~/.ssh/

# التحقق من أن ssh-agent يعمل
ssh-add -l

# إضافة المفتاح إذا لم يكن موجوداً
ssh-add ~/.ssh/id_ed25519

# اختبار الاتصال
ssh -T git@github.com
```

### المشكلة 2: Bad permissions
**الحل:**
```bash
# إصلاح أذونات المجلد والملفات
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

### المشكلة 3: Key not found
**الحل:**
```bash
# التحقق من موقع المفتاح
ls -la ~/.ssh/

# استخدام مسار مخصص
ssh-add /path/to/your/key
```

---

## 9️⃣ أمان SSH Keys

### ✅ أفضل الممارسات:

1. **استخدم كلمة مرور قوية** للمفتاح الخاص
2. **لا تشارك المفتاح الخاص** أبداً
3. **استخدم مفاتيح مختلفة** لمشاريع مختلفة
4. **راجع المفاتيح بانتظام** واحذف القديمة
5. **استخدم Ed25519** بدلاً من RSA (أحدث وأسرع)

### ⚠️ ما يجب تجنبه:

- ❌ لا ترفع المفتاح الخاص إلى Git
- ❌ لا تشارك المفتاح الخاص عبر البريد
- ❌ لا تستخدم نفس المفتاح في كل مكان
- ❌ لا تترك المفتاح بدون كلمة مرور

---

## 🔟 مثال كامل للنشر

### الخطوة 1: إنشاء المفتاح
```bash
ssh-keygen -t ed25519 -C "ali5829511@project.com" -f ~/.ssh/n-m-key
```

### الخطوة 2: إضافة إلى GitHub
```bash
# نسخ المفتاح
cat ~/.ssh/n-m-key.pub
# ثم إضافته في GitHub Settings → SSH Keys
```

### الخطوة 3: إضافة إلى Render.com
```bash
# نفس المفتاح
cat ~/.ssh/n-m-key.pub
# ثم إضافته في Render Dashboard → SSH Public Keys
```

### الخطوة 4: تكوين Git
```bash
# تغيير remote
git remote set-url origin git@github.com:Ali5829511/N-M.git

# إضافة المفتاح لـ ssh-agent
eval $(ssh-agent -s)
ssh-add ~/.ssh/n-m-key

# اختبار
ssh -T git@github.com
```

### الخطوة 5: النشر
```bash
git push origin main
# سيستخدم SSH تلقائياً!
```

---

## 1️⃣1️⃣ SSH Config متقدم

### إنشاء ملف ~/.ssh/config:
```bash
# إنشاء/تعديل الملف
nano ~/.ssh/config
```

### إضافة تكوين للمشروع:
```
# GitHub - N-M Project
Host github.com-n-m
    HostName github.com
    User git
    IdentityFile ~/.ssh/n-m-key
    IdentitiesOnly yes

# Render.com
Host render.com
    HostName render.com
    User git
    IdentityFile ~/.ssh/n-m-key
    IdentitiesOnly yes
```

### الاستخدام:
```bash
# استخدام التكوين المخصص
git clone git@github.com-n-m:Ali5829511/N-M.git
```

---

## 1️⃣2️⃣ التحقق النهائي

### قائمة التحقق:
- [ ] تم إنشاء SSH Key بنجاح
- [ ] تم إضافة المفتاح العام إلى GitHub
- [ ] تم إضافة المفتاح العام إلى Render.com (إذا لزم)
- [ ] تم اختبار الاتصال: `ssh -T git@github.com`
- [ ] تم تغيير remote إلى SSH
- [ ] تم اختبار push: `git push origin main`
- [ ] المفتاح الخاص آمن ولم يتم مشاركته

---

## 📚 روابط مفيدة

### GitHub:
- https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- https://github.com/settings/keys

### Render.com:
- https://render.com/docs/ssh-keys
- https://dashboard.render.com/settings/ssh-keys

### عام:
- https://www.ssh.com/academy/ssh/keygen
- https://www.ssh.com/academy/ssh/agent

---

## 🎯 للمشروع الحالي (N-M)

### خطوات سريعة:

```bash
# 1. إنشاء مفتاح
ssh-keygen -t ed25519 -C "n-m-project" -f ~/.ssh/n-m-key

# 2. عرض المفتاح العام
cat ~/.ssh/n-m-key.pub

# 3. إضافته إلى GitHub
# اذهب إلى: https://github.com/settings/keys

# 4. تكوين Git
git remote set-url origin git@github.com:Ali5829511/N-M.git

# 5. إضافة للـ agent
eval $(ssh-agent -s)
ssh-add ~/.ssh/n-m-key

# 6. اختبار
ssh -T git@github.com

# 7. جاهز للنشر!
git push origin main
```

---

## ✨ الخلاصة

بعد إضافة SSH Key:
- ✅ نشر أسرع (لا حاجة لكلمة مرور كل مرة)
- ✅ أكثر أماناً من HTTPS
- ✅ يدعم النشر التلقائي
- ✅ متوافق مع GitHub Actions و Render.com

---

**تاريخ الإنشاء:** 8 نوفمبر 2025  
**الحالة:** ✅ جاهز للاستخدام  
**المشروع:** Ali5829511/N-M
