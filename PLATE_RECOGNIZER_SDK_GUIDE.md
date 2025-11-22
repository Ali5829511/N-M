# Plate Recognizer SDK/Server Setup Guide
# دليل إعداد Plate Recognizer SDK/Server

This guide explains how to set up and use the Plate Recognizer SDK/Server (on-premise) instead of the cloud-based Snapshot API.

يشرح هذا الدليل كيفية إعداد واستخدام Plate Recognizer SDK/Server (المحلي) بدلاً من Snapshot API السحابي.

## Overview / نظرة عامة

Plate Recognizer offers two deployment options:

1. **Snapshot API (Cloud)**: Cloud-based API, no installation required
2. **SDK/Server (On-Premise)**: Self-hosted solution running on your infrastructure

توفر Plate Recognizer خيارين للنشر:

1. **Snapshot API (السحابي)**: خدمة سحابية، لا تحتاج تثبيت
2. **SDK/Server (المحلي)**: حل محلي يعمل على بنيتك التحتية

### When to Use SDK/Server / متى تستخدم SDK/Server

Choose SDK/Server when you need:

- **Privacy**: Keep images and data on your own servers
- **Offline Operation**: Work without internet connection
- **High Volume**: Process large volumes without API rate limits
- **Low Latency**: Faster processing for local images

اختر SDK/Server عندما تحتاج:

- **الخصوصية**: احتفظ بالصور والبيانات على خوادمك
- **العمل بدون إنترنت**: العمل بدون اتصال بالإنترنت
- **حجم كبير**: معالجة كميات كبيرة بدون حدود API
- **زمن استجابة منخفض**: معالجة أسرع للصور المحلية

## Prerequisites / المتطلبات

1. **SDK License**: Purchase an SDK license from [Plate Recognizer](https://platerecognizer.com/pricing/)
2. **Docker**: Install Docker and Docker Compose
3. **Hardware**: Minimum 4GB RAM, recommended 8GB+
4. **GPU (Optional)**: NVIDIA GPU for faster processing

1. **ترخيص SDK**: اشتر ترخيص SDK من [Plate Recognizer](https://platerecognizer.com/pricing/)
2. **Docker**: ثبّت Docker و Docker Compose
3. **العتاد**: 4GB رام كحد أدنى، يُوصى بـ 8GB+
4. **GPU (اختياري)**: معالج رسومي NVIDIA لمعالجة أسرع

## Installation / التثبيت

### Step 1: Get SDK License / الخطوة 1: احصل على ترخيص SDK

1. Visit https://platerecognizer.com/pricing/
2. Purchase an SDK license
3. You will receive a license token (different from API key)

1. زر https://platerecognizer.com/pricing/
2. اشتر ترخيص SDK
3. ستحصل على رمز ترخيص (مختلف عن مفتاح API)

### Step 2: Configure Environment / الخطوة 2: إعداد البيئة

Edit your `.env` file:

```bash
# Set API type to SDK
PLATE_API_TYPE=sdk

# Set SDK endpoint (default for Docker)
SDK_API_URL=http://localhost:8080/v1/plate-reader/

# Set your SDK license token
SDK_LICENSE_TOKEN=your_sdk_license_token_here

# Optional: Keep PLATE_API_KEY for compatibility
PLATE_API_KEY=dummy_key_for_sdk
```

### Step 3: Deploy SDK with Docker / الخطوة 3: نشر SDK باستخدام Docker

#### Option A: Standalone SDK Container / الخيار أ: حاوية SDK منفصلة

```bash
# Run Plate Recognizer SDK
docker run -d \
  --name plate-recognizer-sdk \
  -p 8080:8080 \
  -e LICENSE_TOKEN=your_sdk_license_token_here \
  platerecognizer/alpr:latest
```

#### Option B: Using Docker Compose / الخيار ب: استخدام Docker Compose

1. Edit `docker-compose.snapshot.yml`
2. Uncomment the `plate-recognizer-sdk` service section
3. Run:

```bash
docker-compose -f docker-compose.snapshot.yml up -d
```

### Step 4: Verify SDK is Running / الخطوة 4: التحقق من تشغيل SDK

```bash
# Check health
curl http://localhost:8080/v1/plate-reader/

# Test with sample image
curl -F "upload=@sample_car.jpg" \
  http://localhost:8080/v1/plate-reader/
```

## Usage / الاستخدام

### Running the Script / تشغيل السكربت

Once SDK is running, use the same script as before:

```bash
# Create images list
echo "/path/to/image1.jpg" > images.txt
echo "/path/to/image2.jpg" >> images.txt

# Run the script
python snapshot_to_postgres.py \
  --images images.txt \
  --delay 0.1 \
  --confidence-threshold 0.7
```

### With Docker Compose / مع Docker Compose

```bash
# Start all services (DB + SDK)
docker-compose -f docker-compose.snapshot.yml up -d

# Run the processing script
docker-compose -f docker-compose.snapshot.yml exec app \
  python snapshot_to_postgres.py --images images.txt
```

## Configuration Options / خيارات الإعداد

### SDK Environment Variables / متغيرات البيئة لـ SDK

The Plate Recognizer SDK container supports these environment variables:

```bash
# License token (required)
LICENSE_TOKEN=your_token_here

# Optional: Region-specific models (e.g., 'us', 'eu', 'kr')
REGION=us

# Optional: Enable GPU acceleration
NVIDIA_VISIBLE_DEVICES=all
```

### Performance Tuning / ضبط الأداء

For better performance with SDK:

1. **Use GPU**: Add `--gpus all` to Docker run command
2. **Reduce delay**: Set `--delay 0.1` or lower
3. **Increase workers**: SDK supports concurrent requests

لأداء أفضل مع SDK:

1. **استخدم GPU**: أضف `--gpus all` لأمر Docker
2. **قلل التأخير**: ضع `--delay 0.1` أو أقل
3. **زد العمال**: SDK يدعم الطلبات المتزامنة

## Comparison: SDK vs Snapshot API

| Feature | SDK/Server | Snapshot API |
|---------|-----------|--------------|
| **Deployment** | Self-hosted | Cloud-based |
| **Internet** | Not required | Required |
| **Cost** | One-time license | Pay per API call |
| **Privacy** | High (local) | Lower (cloud) |
| **Latency** | Low | Higher |
| **Maintenance** | You manage | Managed by Plate Recognizer |
| **Scalability** | Limited by hardware | Unlimited |
| **Setup** | Complex | Simple |

| الميزة | SDK/Server | Snapshot API |
|--------|-----------|--------------|
| **النشر** | محلي | سحابي |
| **الإنترنت** | غير مطلوب | مطلوب |
| **التكلفة** | ترخيص لمرة واحدة | دفع لكل استدعاء API |
| **الخصوصية** | عالية (محلي) | أقل (سحابي) |
| **زمن الاستجابة** | منخفض | أعلى |
| **الصيانة** | أنت تديره | تديره Plate Recognizer |
| **القابلية للتوسع** | محدودة بالعتاد | غير محدودة |
| **الإعداد** | معقد | بسيط |

## Troubleshooting / حل المشاكل

### SDK Container Won't Start / حاوية SDK لا تبدأ

```bash
# Check logs
docker logs plate-recognizer-sdk

# Common issues:
# 1. Invalid license token
# 2. Port 8080 already in use
# 3. Insufficient memory
```

### Can't Connect to SDK / لا يمكن الاتصال بـ SDK

```bash
# Verify SDK is running
docker ps | grep plate-recognizer-sdk

# Check if port is accessible
curl http://localhost:8080/v1/plate-reader/

# If using Docker Compose, use service name
SDK_API_URL=http://plate-recognizer-sdk:8080/v1/plate-reader/
```

### Low Performance / أداء منخفض

1. Enable GPU acceleration
2. Increase Docker memory limit
3. Reduce image resolution
4. Use batch processing

## Security Considerations / اعتبارات الأمان

1. **License Token**: Keep your SDK license token secure
2. **Network**: Don't expose SDK port (8080) publicly
3. **Firewall**: Only allow access from trusted IPs
4. **Updates**: Regularly update SDK image

1. **رمز الترخيص**: احفظ رمز ترخيص SDK بشكل آمن
2. **الشبكة**: لا تعرض منفذ SDK (8080) للعامة
3. **جدار الحماية**: اسمح بالوصول من IPs موثوقة فقط
4. **التحديثات**: حدّث صورة SDK بانتظام

## References / المراجع

- **Official SDK Documentation**: https://guides.platerecognizer.com/docs/tech-references/server/
- **Snapshot API Documentation**: https://guides.platerecognizer.com/docs/snapshot/api-reference/
- **Docker Hub**: https://hub.docker.com/r/platerecognizer/alpr
- **Pricing**: https://platerecognizer.com/pricing/

## Support / الدعم

For SDK support:
- Email: support@platerecognizer.com
- Documentation: https://guides.platerecognizer.com/
- Community: https://github.com/platerecognizer

---

## Quick Start Checklist / قائمة البدء السريع

- [ ] Purchase SDK license from Plate Recognizer
- [ ] Install Docker and Docker Compose
- [ ] Set `PLATE_API_TYPE=sdk` in `.env`
- [ ] Set `SDK_LICENSE_TOKEN` in `.env`
- [ ] Deploy SDK container with Docker
- [ ] Verify SDK is running (`curl http://localhost:8080/v1/plate-reader/`)
- [ ] Run `snapshot_to_postgres.py` with `--images` parameter
- [ ] Check database for processed results

---

**Note**: This guide assumes you have already set up PostgreSQL and S3/image storage as described in the main README.

**ملاحظة**: يفترض هذا الدليل أنك قد أعددت PostgreSQL وتخزين S3/الصور كما هو موضح في README الرئيسي.
