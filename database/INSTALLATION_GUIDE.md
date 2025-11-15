# 🚀 دليل التثبيت والإعداد - قاعدة بيانات نظام إدارة المرور

**وحدة إسكان هيئة التدريس**  
**جامعة الإمام محمد بن سعود الإسلامية**

---

## 📋 المتطلبات الأساسية

### متطلبات النظام

| المتطلب | الإصدار الموصى به | ملاحظات |
|---------|-------------------|----------|
| **MySQL** | 8.0+ | أو MariaDB 10.5+ |
| **PHP** | 7.4+ | للواجهة الخلفية |
| **Apache/Nginx** | أحدث إصدار | خادم الويب |
| **Node.js** | 16+ | للأدوات الإضافية |
| **مساحة القرص** | 5 GB | الحد الأدنى |
| **الذاكرة RAM** | 2 GB | الحد الأدنى |

---

## 📦 الخطوة 1: تثبيت MySQL

### على Ubuntu/Debian

```bash
# تحديث النظام
sudo apt update
sudo apt upgrade -y

# تثبيت MySQL Server
sudo apt install mysql-server -y

# تأمين التثبيت
sudo mysql_secure_installation
```

### على CentOS/RHEL

```bash
# تثبيت MySQL Repository
sudo yum install mysql-server -y

# تشغيل الخدمة
sudo systemctl start mysqld
sudo systemctl enable mysqld

# تأمين التثبيت
sudo mysql_secure_installation
```

### على Windows

1. تحميل MySQL Installer من [الموقع الرسمي](https://dev.mysql.com/downloads/installer/)
2. تشغيل الملف وتثبيت MySQL Server
3. اختيار "Developer Default" للتثبيت الكامل
4. تعيين كلمة مرور قوية لحساب root

---

## 🔧 الخطوة 2: إنشاء قاعدة البيانات

### 1. الاتصال بـ MySQL

```bash
mysql -u root -p
```

### 2. إنشاء قاعدة البيانات

```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS traffic_management_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- التحقق من الإنشاء
SHOW DATABASES;

-- الخروج
EXIT;
```

---

## 📥 الخطوة 3: استيراد المخطط

### الطريقة الأولى: عبر سطر الأوامر

```bash
# الانتقال إلى مجلد قاعدة البيانات
cd /path/to/N-M/database/

# استيراد المخطط
mysql -u root -p traffic_management_system < schema.sql

# التحقق من الاستيراد
mysql -u root -p -e "USE traffic_management_system; SHOW TABLES;"
```

### الطريقة الثانية: عبر phpMyAdmin

1. فتح phpMyAdmin في المتصفح
2. اختيار قاعدة البيانات `traffic_management_system`
3. الضغط على تبويب "Import"
4. اختيار ملف `schema.sql`
5. الضغط على "Go"

### الطريقة الثالثة: عبر MySQL Workbench

1. فتح MySQL Workbench
2. الاتصال بالخادم
3. اختيار قاعدة البيانات
4. File → Run SQL Script
5. اختيار ملف `schema.sql`
6. تنفيذ السكريبت

---

## 🎲 الخطوة 4: إدراج البيانات التجريبية (اختياري)

```bash
# استيراد البيانات التجريبية
mysql -u root -p traffic_management_system < sample_data.sql

# التحقق من البيانات
mysql -u root -p traffic_management_system -e "
SELECT 
    (SELECT COUNT(*) FROM buildings) as buildings_count,
    (SELECT COUNT(*) FROM residential_units) as units_count,
    (SELECT COUNT(*) FROM residents) as residents_count,
    (SELECT COUNT(*) FROM vehicles) as vehicles_count;
"
```

---

## 👤 الخطوة 5: إنشاء مستخدم قاعدة البيانات

### إنشاء مستخدم للتطبيق

```sql
-- الاتصال بـ MySQL
mysql -u root -p

-- إنشاء المستخدم
CREATE USER 'traffic_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON traffic_management_system.* TO 'traffic_user'@'localhost';

-- تطبيق التغييرات
FLUSH PRIVILEGES;

-- التحقق من الصلاحيات
SHOW GRANTS FOR 'traffic_user'@'localhost';

-- الخروج
EXIT;
```

### للوصول عن بُعد (اختياري)

```sql
-- إنشاء مستخدم للوصول عن بُعد
CREATE USER 'traffic_user'@'%' IDENTIFIED BY 'YourStrongPassword123!';

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON traffic_management_system.* TO 'traffic_user'@'%';

-- تطبيق التغييرات
FLUSH PRIVILEGES;
```

**⚠️ تحذير أمني:** استخدم الوصول عن بُعد فقط في بيئات آمنة ومع جدار ناري مناسب.

---

## ⚙️ الخطوة 6: تكوين ملف الاتصال

### إنشاء ملف `config.php`

```php
<?php
// ملف تكوين قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_NAME', 'traffic_management_system');
define('DB_USER', 'traffic_user');
define('DB_PASS', 'YourStrongPassword123!');
define('DB_CHARSET', 'utf8mb4');

// إنشاء الاتصال
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    die("خطأ في الاتصال بقاعدة البيانات: " . $e->getMessage());
}
?>
```

---

## 🔐 الخطوة 7: تأمين قاعدة البيانات

### 1. تعيين كلمات مرور قوية

```sql
-- تغيير كلمة مرور المستخدم
ALTER USER 'traffic_user'@'localhost' IDENTIFIED BY 'NewStrongPassword456!';
FLUSH PRIVILEGES;
```

### 2. تقييد الصلاحيات

```sql
-- إلغاء صلاحيات غير ضرورية
REVOKE ALL PRIVILEGES ON traffic_management_system.* FROM 'traffic_user'@'localhost';

-- منح الصلاحيات الضرورية فقط
GRANT SELECT, INSERT, UPDATE, DELETE ON traffic_management_system.* TO 'traffic_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. تفعيل SSL (اختياري)

```sql
-- التحقق من دعم SSL
SHOW VARIABLES LIKE '%ssl%';

-- إجبار استخدام SSL
ALTER USER 'traffic_user'@'localhost' REQUIRE SSL;
FLUSH PRIVILEGES;
```

---

## 🔍 الخطوة 8: اختبار قاعدة البيانات

### 1. اختبار الاتصال

```bash
# اختبار الاتصال بالمستخدم الجديد
mysql -u traffic_user -p traffic_management_system

# تنفيذ استعلام تجريبي
mysql -u traffic_user -p traffic_management_system -e "SELECT COUNT(*) FROM buildings;"
```

### 2. اختبار العروض (Views)

```sql
-- اختبار عرض ملخص المباني
SELECT * FROM v_buildings_summary LIMIT 5;

-- اختبار عرض السيارات مع السكان
SELECT * FROM v_vehicles_with_residents LIMIT 5;

-- اختبار عرض المخالفات
SELECT * FROM v_violations_detailed LIMIT 5;
```

### 3. اختبار الإجراءات المخزنة

```sql
-- اختبار تحديث إحصائيات المبنى
CALL sp_update_building_statistics(1);

-- اختبار البحث عن المخالفين المتكررين
CALL sp_get_repeat_violators(2);

-- اختبار إحصائيات المخالفات حسب النوع
CALL sp_violations_by_type('2023-01-01', '2023-12-31');
```

---

## 📊 الخطوة 9: إعداد النسخ الاحتياطي

### 1. نسخ احتياطي يدوي

```bash
# نسخ احتياطي كامل
mysqldump -u root -p traffic_management_system > backup_$(date +%Y%m%d_%H%M%S).sql

# نسخ احتياطي مضغوط
mysqldump -u root -p traffic_management_system | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 2. نسخ احتياطي تلقائي (Cron Job)

```bash
# فتح محرر crontab
crontab -e

# إضافة مهمة نسخ احتياطي يومية في الساعة 2 صباحاً
0 2 * * * mysqldump -u root -pYourPassword traffic_management_system | gzip > /backup/traffic_$(date +\%Y\%m\%d).sql.gz

# حذف النسخ الاحتياطية الأقدم من 30 يوم
0 3 * * * find /backup/ -name "traffic_*.sql.gz" -mtime +30 -delete
```

### 3. استعادة من النسخة الاحتياطية

```bash
# استعادة من ملف عادي
mysql -u root -p traffic_management_system < backup_20231115.sql

# استعادة من ملف مضغوط
gunzip < backup_20231115.sql.gz | mysql -u root -p traffic_management_system
```

---

## 🔧 الخطوة 10: تحسين الأداء

### 1. تحسين إعدادات MySQL

```ini
# تحرير ملف my.cnf أو my.ini
[mysqld]
# حجم ذاكرة التخزين المؤقت
innodb_buffer_pool_size = 1G

# حجم ملف السجل
innodb_log_file_size = 256M

# عدد الاتصالات المتزامنة
max_connections = 200

# تفعيل الاستعلامات البطيئة
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2

# إعادة تشغيل MySQL
sudo systemctl restart mysql
```

### 2. تحليل الجداول

```sql
-- تحليل جميع الجداول
ANALYZE TABLE buildings, residential_units, residents, vehicles, 
              vehicle_stickers, traffic_violations, parking_spaces, 
              analyzed_images, users, activity_log;
```

### 3. تحسين الجداول

```sql
-- تحسين جميع الجداول
OPTIMIZE TABLE buildings, residential_units, residents, vehicles, 
               vehicle_stickers, traffic_violations, parking_spaces, 
               analyzed_images, users, activity_log;
```

---

## 🐛 استكشاف الأخطاء وإصلاحها

### مشكلة: خطأ في الاتصال

```bash
# التحقق من حالة MySQL
sudo systemctl status mysql

# إعادة تشغيل MySQL
sudo systemctl restart mysql

# التحقق من السجلات
sudo tail -f /var/log/mysql/error.log
```

### مشكلة: خطأ في الصلاحيات

```sql
-- التحقق من الصلاحيات
SHOW GRANTS FOR 'traffic_user'@'localhost';

-- إعادة منح الصلاحيات
GRANT ALL PRIVILEGES ON traffic_management_system.* TO 'traffic_user'@'localhost';
FLUSH PRIVILEGES;
```

### مشكلة: خطأ في الترميز

```sql
-- التحقق من الترميز
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- تغيير ترميز قاعدة البيانات
ALTER DATABASE traffic_management_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### مشكلة: بطء الاستعلامات

```sql
-- عرض الاستعلامات البطيئة
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

-- تحليل استعلام معين
EXPLAIN SELECT * FROM v_vehicles_with_residents WHERE plate_number = 'ABC1234';

-- إضافة فهرس جديد إذا لزم الأمر
CREATE INDEX idx_custom ON table_name(column_name);
```

---

## 📱 الخطوة 11: التكامل مع Plate Recognizer

### 1. حفظ بيانات الاتصال

```sql
-- إدراج إعدادات Plate Recognizer
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('plate_recognizer_api_token', '22ba3cf7155a1ea730a0b64787f98ab5f9a3de94', 'string', 'API Token for Plate Recognizer'),
('plate_recognizer_api_url', 'https://api.platerecognizer.com/v1/plate-reader/', 'string', 'API URL'),
('parkpow_token', '7c13be422713a758a42a0bc453cf3331fbfd346', 'string', 'ParkPow Token'),
('ftp_host', 'ftp.platerecognizer.com', 'string', 'FTP Host'),
('ftp_username', 'aliayashi522', 'string', 'FTP Username'),
('ftp_password', '708c4bbfdde0', 'string', 'FTP Password'),
('timezone', 'Asia/Riyadh', 'string', 'System Timezone');
```

### 2. اختبار الاتصال

```php
<?php
// اختبار Plate Recognizer API
$api_token = '22ba3cf7155a1ea730a0b64787f98ab5f9a3de94';
$api_url = 'https://api.platerecognizer.com/v1/plate-reader/';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Token ' . $api_token
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code == 200) {
    echo "✅ الاتصال بـ Plate Recognizer ناجح!";
} else {
    echo "❌ فشل الاتصال: HTTP " . $http_code;
}
?>
```

---

## 📈 الخطوة 12: المراقبة والصيانة

### 1. مراقبة حجم قاعدة البيانات

```sql
-- حجم قاعدة البيانات
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'traffic_management_system'
GROUP BY table_schema;

-- حجم كل جدول
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'traffic_management_system'
ORDER BY (data_length + index_length) DESC;
```

### 2. مراقبة الأداء

```sql
-- عدد الاتصالات الحالية
SHOW STATUS LIKE 'Threads_connected';

-- عدد الاستعلامات
SHOW STATUS LIKE 'Questions';

-- وقت التشغيل
SHOW STATUS LIKE 'Uptime';
```

### 3. تنظيف البيانات القديمة

```sql
-- حذف سجلات النشاط الأقدم من 6 أشهر
DELETE FROM activity_log 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- حذف الإشعارات المقروءة الأقدم من 3 أشهر
DELETE FROM notifications 
WHERE is_read = TRUE 
AND read_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
```

---

## ✅ قائمة التحقق النهائية

- [ ] تثبيت MySQL بنجاح
- [ ] إنشاء قاعدة البيانات
- [ ] استيراد المخطط (schema.sql)
- [ ] استيراد البيانات التجريبية (اختياري)
- [ ] إنشاء مستخدم قاعدة البيانات
- [ ] تكوين ملف الاتصال
- [ ] اختبار الاتصال
- [ ] اختبار العروض والإجراءات
- [ ] إعداد النسخ الاحتياطي التلقائي
- [ ] تحسين الأداء
- [ ] التكامل مع Plate Recognizer
- [ ] إعداد المراقبة

---

## 📞 الدعم الفني

في حال واجهت أي مشاكل:

1. **مراجعة السجلات:**
   ```bash
   sudo tail -f /var/log/mysql/error.log
   ```

2. **التحقق من الحالة:**
   ```bash
   sudo systemctl status mysql
   ```

3. **التواصل مع الدعم:**
   - البريد الإلكتروني: housing@imam.edu.sa
   - الهاتف: +966-11-XXXXXXX

---

## 📚 مصادر إضافية

- [توثيق MySQL الرسمي](https://dev.mysql.com/doc/)
- [Plate Recognizer API Documentation](https://docs.platerecognizer.com/)
- [PHP PDO Tutorial](https://www.php.net/manual/en/book.pdo.php)

---

**© 2025 جامعة الإمام محمد بن سعود الإسلامية - جميع الحقوق محفوظة**
