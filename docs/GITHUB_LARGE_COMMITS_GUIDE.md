# 📦 دليل فهم الالتزامات الكبيرة في GitHub
# Understanding GitHub Large Commits Guide

---

## 🔍 ما المقصود بـ "المحتوى المخفي" في الالتزامات الكبيرة؟
## What is "Hidden Content" in Large Commits?

### بالعربية 🇸🇦

عندما تحتوي الالتزامات (Commits) أو طلبات السحب (Pull Requests) في GitHub على تغييرات كبيرة جداً، يقوم GitHub **تلقائياً بإخفاء بعض المحتوى** لتحسين أداء الصفحة وسرعة التحميل.

#### 📌 متى يحدث هذا؟

يخفي GitHub المحتوى في الحالات التالية:

1. **الملفات الكبيرة جداً** (أكثر من 1 MB)
2. **عدد كبير من الملفات المتغيرة** (أكثر من 300 ملف)
3. **تغييرات ضخمة في ملف واحد** (آلاف الأسطر)
4. **ملفات ثنائية** (Binary files) مثل الصور والملفات المضغوطة
5. **ملفات تم توليدها تلقائياً** (Generated files) مثل ملفات البناء

#### 🔎 كيف يظهر المحتوى المخفي؟

عندما يكون هناك محتوى مخفي، ستشاهد إحدى هذه الرسائل:

```
⚠️ Large diffs are not rendered by default
⚠️ Some generated files are not rendered by default
⚠️ Binary files are not shown
⚠️ This file is too large to display
```

#### 🎯 كيفية الوصول إلى المحتوى المخفي

لديك عدة خيارات للوصول إلى المحتوى المخفي:

##### 1. **استخدام مربع البحث (Search Box)**

- يوفر GitHub مربع بحث في أعلى صفحة الالتزام
- اكتب اسم الملف أو جزء من المحتوى
- سيظهر لك الملفات المخفية المطابقة

**مثال:**
```
🔍 Search this commit...
```

##### 2. **النقر على "Load diff" (تحميل الفرق)**

- بعض الملفات تعرض زر "Load diff"
- انقر عليه لعرض المحتوى كاملاً
- قد يستغرق وقتاً طويلاً للملفات الكبيرة

##### 3. **عرض الملف الخام (View Raw)**

- انقر على زر "View file" في رأس الملف
- ثم اختر "Raw" لعرض المحتوى الخام
- مفيد للملفات الكبيرة جداً

##### 4. **استخدام Git محلياً**

الطريقة الأكثر موثوقية للملفات الكبيرة:

```bash
# استنساخ المستودع
git clone https://github.com/username/repository.git

# عرض تفاصيل الالتزام
git show <commit-hash>

# عرض التغييرات في ملف محدد
git show <commit-hash>:<path/to/file>

# عرض الفرق لملف محدد
git diff <commit-hash>^ <commit-hash> -- <path/to/file>
```

---

### In English 🇬🇧

When commits or pull requests in GitHub contain very large changes, GitHub **automatically hides some content** to improve page performance and loading speed.

#### 📌 When Does This Happen?

GitHub hides content in the following cases:

1. **Very large files** (more than 1 MB)
2. **Large number of changed files** (more than 300 files)
3. **Massive changes in a single file** (thousands of lines)
4. **Binary files** such as images and compressed files
5. **Generated files** such as build artifacts

#### 🔎 How Does Hidden Content Appear?

When there is hidden content, you'll see one of these messages:

```
⚠️ Large diffs are not rendered by default
⚠️ Some generated files are not rendered by default
⚠️ Binary files are not shown
⚠️ This file is too large to display
```

#### 🎯 How to Access Hidden Content

You have several options to access hidden content:

##### 1. **Use the Search Box**

- GitHub provides a search box at the top of the commit page
- Type the filename or part of the content
- Hidden files matching your search will appear

**Example:**
```
🔍 Search this commit...
```

##### 2. **Click "Load diff"**

- Some files show a "Load diff" button
- Click it to display the full content
- May take a long time for large files

##### 3. **View Raw File**

- Click the "View file" button in the file header
- Then choose "Raw" to view the raw content
- Useful for very large files

##### 4. **Use Git Locally**

The most reliable method for large files:

```bash
# Clone the repository
git clone https://github.com/username/repository.git

# View commit details
git show <commit-hash>

# View changes in a specific file
git show <commit-hash>:<path/to/file>

# View diff for a specific file
git diff <commit-hash>^ <commit-hash> -- <path/to/file>
```

---

## 💡 نصائح وأفضل الممارسات / Tips and Best Practices

### بالعربية 🇸🇦

#### ✅ لتجنب مشكلة المحتوى المخفي:

1. **قسّم الالتزامات الكبيرة**
   - بدلاً من التزام واحد كبير، قم بعدة التزامات صغيرة
   - كل التزام يجب أن يركز على مهمة واحدة

2. **استخدم .gitignore**
   - أضف الملفات المُولَّدة تلقائياً إلى `.gitignore`
   - تجنب رفع ملفات `node_modules`, `dist`, `build`, إلخ

3. **استخدم Git LFS للملفات الكبيرة**
   - Git Large File Storage للملفات الثنائية الكبيرة
   - مثل الصور، الفيديوهات، ملفات التصميم

4. **راجع التغييرات قبل الالتزام**
   ```bash
   git status
   git diff
   ```

#### ⚠️ متى يكون المحتوى المخفي طبيعياً؟

- **تحديث المكتبات**: مثل `package-lock.json`
- **ملفات الترجمة**: قد تكون كبيرة جداً
- **البيانات الأولية**: للتطوير والاختبار
- **التوثيق الكامل**: ملفات documentation كبيرة

### In English 🇬🇧

#### ✅ To Avoid Hidden Content Issues:

1. **Split Large Commits**
   - Instead of one large commit, make several small commits
   - Each commit should focus on a single task

2. **Use .gitignore**
   - Add generated files to `.gitignore`
   - Avoid uploading `node_modules`, `dist`, `build`, etc.

3. **Use Git LFS for Large Files**
   - Git Large File Storage for large binary files
   - Such as images, videos, design files

4. **Review Changes Before Committing**
   ```bash
   git status
   git diff
   ```

#### ⚠️ When is Hidden Content Normal?

- **Library Updates**: like `package-lock.json`
- **Translation Files**: can be very large
- **Seed Data**: for development and testing
- **Complete Documentation**: large documentation files

---

## 🎓 أمثلة عملية / Practical Examples

### مثال 1: البحث عن ملف مخفي
### Example 1: Search for a Hidden File

```
Scenario: تم إخفاء ملف package-lock.json في التزام كبير

1. افتح صفحة الالتزام (Commit page)
2. ستشاهد رسالة: "X files not shown"
3. استخدم مربع البحث: اكتب "package-lock.json"
4. سيظهر الملف مع خيار "Load diff"
5. انقر "Load diff" لعرض التغييرات
```

### مثال 2: عرض ملف كبير محلياً
### Example 2: View a Large File Locally

```bash
# استنساخ المشروع
git clone https://github.com/Ali5829511/N-M.git
cd N-M

# عرض التزام معين
git log --oneline  # للحصول على hash الالتزام

# عرض التغييرات في ملف محدد
git show abc1234:path/to/large-file.json

# أو عرض الفرق
git diff abc1234^ abc1234 -- path/to/large-file.json
```

### مثال 3: فحص حجم الملفات المتغيرة
### Example 3: Check Size of Changed Files

```bash
# عرض إحصائيات الالتزام
git show --stat <commit-hash>

# عرض حجم كل ملف متغير
git diff --stat <commit-hash>^ <commit-hash>

# عرض الملفات الكبيرة فقط
git diff --stat <commit-hash>^ <commit-hash> | grep "+.*|" | sort -k3 -n
```

---

## 🔗 روابط مفيدة / Useful Links

### وثائق GitHub الرسمية / GitHub Official Documentation
- [Working with large files](https://docs.github.com/en/repositories/working-with-files/managing-large-files)
- [About Git Large File Storage](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)
- [Viewing commit history](https://docs.github.com/en/pull-requests/committing-changes-to-your-project/viewing-and-comparing-commits)

### وثائق Git
- [Git Show Documentation](https://git-scm.com/docs/git-show)
- [Git Diff Documentation](https://git-scm.com/docs/git-diff)
- [Git Log Documentation](https://git-scm.com/docs/git-log)

---

## ❓ الأسئلة الشائعة / FAQ

### س: لماذا لا يعرض GitHub جميع التغييرات؟
**ج:** لتحسين الأداء وسرعة التحميل، خاصة للمستودعات الكبيرة.

### س: هل المحتوى المخفي محذوف أم مفقود؟
**ج:** لا، المحتوى موجود بالكامل في Git، فقط غير معروض في واجهة الويب.

### س: كيف أعرف ما هو مخفي؟
**ج:** ابحث عن الرسائل التحذيرية مثل "X files not shown" أو "Large diffs not rendered"

### س: هل يمكنني إجبار GitHub على عرض كل شيء؟
**ج:** لا، لكن يمكنك استخدام Git محلياً أو النقر على "Load diff" للملفات الفردية.

---

### Q: Why doesn't GitHub show all changes?
**A:** To improve performance and loading speed, especially for large repositories.

### Q: Is hidden content deleted or missing?
**A:** No, the content is fully present in Git, just not displayed in the web interface.

### Q: How do I know what's hidden?
**A:** Look for warning messages like "X files not shown" or "Large diffs not rendered"

### Q: Can I force GitHub to show everything?
**A:** No, but you can use Git locally or click "Load diff" for individual files.

---

## 📊 حدود GitHub / GitHub Limits

| النوع / Type | الحد / Limit | ملاحظات / Notes |
|-------------|--------------|-----------------|
| حجم الملف الواحد / Single file size | 100 MB | يُحذر عند 50 MB / Warning at 50 MB |
| حجم المستودع / Repository size | 5 GB موصى / Recommended | 100 GB حد صعب / Hard limit |
| عدد الملفات / File count | 300+ ملف / files | يبدأ الإخفاء / Hiding starts |
| الملفات الثنائية / Binary files | غير محدد / Unlimited | لكن مخفية / But hidden |
| حجم الالتزام / Commit size | غير محدد / Unlimited | بطيء للكبير / Slow for large |

---

## 🛠️ أدوات مساعدة / Helper Tools

### لفحص حجم المستودع / To Check Repository Size

```bash
# حجم المستودع الكلي
git count-objects -vH

# حجم كل مجلد
du -sh *

# أكبر الملفات في التاريخ
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort -n -k2 | \
  tail -20
```

### لتنظيف الملفات الكبيرة / To Clean Large Files

```bash
# إزالة ملف من التاريخ (احذر!)
git filter-branch --tree-filter 'rm -f path/to/large/file' HEAD

# أو استخدم BFG Repo-Cleaner (أسرع)
bfg --delete-files large-file.bin
```

---

## ✅ الخلاصة / Summary

### بالعربية 🇸🇦

- **المحتوى المخفي** هو محتوى موجود لكن غير معروض لتحسين الأداء
- **استخدم مربع البحث** للعثور على الملفات المخفية
- **Git محلياً** هو الحل الأفضل للملفات الكبيرة جداً
- **قسّم الالتزامات** وتجنب الملفات الكبيرة غير الضرورية

### In English 🇬🇧

- **Hidden content** exists but isn't displayed to improve performance
- **Use the search box** to find hidden files
- **Local Git** is the best solution for very large files
- **Split commits** and avoid unnecessary large files

---

© 2025 - Traffic Management System  
جامعة الإمام محمد بن سعود الإسلامية  
Imam Muhammad Ibn Saud Islamic University
