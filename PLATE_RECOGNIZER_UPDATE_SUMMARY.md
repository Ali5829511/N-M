# Plate Recognizer Update Summary
# ملخص تحديث Plate Recognizer

**Date / التاريخ:** November 22, 2025

## Overview / نظرة عامة

This update adds support for **Plate Recognizer SDK/Server** (on-premise deployment) in addition to the existing **Snapshot API** (cloud deployment).

يضيف هذا التحديث دعمًا لـ **Plate Recognizer SDK/Server** (النشر المحلي) بالإضافة إلى **Snapshot API** الموجود (النشر السحابي).

## What's New? / ما الجديد؟

### 🎯 Dual Deployment Support

The system now supports two deployment modes:

1. **Snapshot API (Cloud)** - Default mode
   - Existing configuration continues to work
   - Cloud-based processing
   - Pay-per-API-call pricing
   
2. **SDK/Server (On-Premise)** - New addition
   - Self-hosted deployment
   - Complete data privacy
   - One-time license fee
   - Offline operation support

### 📋 Configuration Changes

New environment variables in `.env`:

```bash
# API Type selection (default: snapshot)
PLATE_API_TYPE=snapshot  # or "sdk" for on-premise

# For SDK/Server deployment
SDK_API_URL=http://localhost:8080/v1/plate-reader/
SDK_LICENSE_TOKEN=your_sdk_license_token_here
```

### 📚 New Documentation

- **[PLATE_RECOGNIZER_SDK_GUIDE.md](PLATE_RECOGNIZER_SDK_GUIDE.md)**: Complete SDK setup guide
  - Installation instructions
  - Docker deployment examples
  - Comparison tables
  - Troubleshooting guide

### 🔄 Updated Files

1. **snapshot_to_postgres.py**: Now supports both API types with automatic selection
2. **docker-compose.snapshot.yml**: Includes optional SDK service configuration
3. **README.md**: Updated with deployment options
4. **PLATE_RECOGNIZER_SNAPSHOT_README.md**: Added comparison and SDK configuration
5. **.env.example**: Added SDK configuration options

## Migration Guide / دليل الترحيل

### For Existing Users (Snapshot API)

**No action required!** Your existing configuration will continue to work. The default API type is `snapshot`.

**لا حاجة لأي إجراء!** ستستمر إعداداتك الحالية في العمل. نوع API الافتراضي هو `snapshot`.

### For New Users Choosing SDK

1. Purchase SDK license from Plate Recognizer
2. Set `PLATE_API_TYPE=sdk` in `.env`
3. Configure `SDK_API_URL` and `SDK_LICENSE_TOKEN`
4. Deploy SDK container (see [PLATE_RECOGNIZER_SDK_GUIDE.md](PLATE_RECOGNIZER_SDK_GUIDE.md))
5. Run the script as before

## Comparison: Snapshot vs SDK

| Feature | Snapshot API | SDK/Server |
|---------|-------------|------------|
| **Setup** | Simple | Complex |
| **Cost** | Pay-per-call | One-time license |
| **Privacy** | Lower (cloud) | High (local) |
| **Internet** | Required | Not required |
| **Latency** | Higher | Lower |
| **Scalability** | Unlimited | Limited by hardware |
| **Maintenance** | Managed | Self-managed |

## Quick Start Examples

### Using Snapshot API (Cloud)

```bash
# .env configuration
PLATE_API_TYPE=snapshot
PLATE_API_KEY=your_api_key
SNAPSHOT_API_URL=https://api.platerecognizer.com/v1/plate-reader/

# Run
python snapshot_to_postgres.py --images images.txt
```

### Using SDK/Server (On-Premise)

```bash
# .env configuration
PLATE_API_TYPE=sdk
SDK_API_URL=http://localhost:8080/v1/plate-reader/
SDK_LICENSE_TOKEN=your_license_token

# Deploy SDK
docker run -d -p 8080:8080 \
  -e LICENSE_TOKEN=your_license_token \
  platerecognizer/alpr:latest

# Run
python snapshot_to_postgres.py --images images.txt
```

## Testing / الاختبار

All changes have been tested:

- ✅ Python syntax validation
- ✅ YAML configuration validation
- ✅ Code review completed
- ✅ Security scan (CodeQL) - 0 alerts
- ✅ Help text verified
- ✅ Backward compatibility confirmed

## Support / الدعم

- **Snapshot API Documentation**: https://guides.platerecognizer.com/docs/snapshot/api-reference/
- **SDK/Server Documentation**: https://guides.platerecognizer.com/docs/tech-references/server/
- **Local Guide**: [PLATE_RECOGNIZER_SDK_GUIDE.md](PLATE_RECOGNIZER_SDK_GUIDE.md)

## References / المراجع

- Problem Statement: https://guides.platerecognizer.com/docs/tech-references/server
- Plate Recognizer Website: https://platerecognizer.com/
- Docker Hub: https://hub.docker.com/r/platerecognizer/alpr

---

## Summary / الملخص

This update provides flexibility to choose between:
- **Cloud deployment** for simplicity and scalability
- **On-premise deployment** for privacy and offline operation

هذا التحديث يوفر المرونة للاختيار بين:
- **النشر السحابي** للبساطة والقابلية للتوسع
- **النشر المحلي** للخصوصية والعمل بدون إنترنت

The system remains backward compatible, with sensible defaults for existing users.

النظام يبقى متوافقًا مع الإصدارات السابقة، مع إعدادات افتراضية مناسبة للمستخدمين الحاليين.
