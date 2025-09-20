# دليل استكشاف الأخطاء - Facebook Messenger Bot

## مشاكل شائعة وحلولها

### 1. مشاكل قاعدة البيانات

#### خطأ: "MongoDB connection error"
```
❌ MongoDB connection error: MongoNetworkError: failed to connect to server
```

**الحل:**
- تأكد من صحة `MONGODB_URI` في ملف `.env`
- تأكد من إضافة IP address الخاص بك في MongoDB Atlas Network Access
- تأكد من صحة username و password

#### خطأ: "Authentication failed"
```
❌ MongoDB connection error: Authentication failed
```

**الحل:**
- تأكد من صحة username و password في connection string
- تأكد من إضافة المستخدم في MongoDB Atlas Database Access
- تأكد من إعطاء المستخدم صلاحيات القراءة والكتابة

### 2. مشاكل Facebook API

#### خطأ: "Invalid Facebook App ID"
```
❌ Facebook API Error: Invalid App ID
```

**الحل:**
- تأكد من صحة `FACEBOOK_APP_ID` في ملف `.env`
- تأكد من تفعيل Facebook App
- تأكد من إضافة Facebook Login و Messenger في Facebook App

#### خطأ: "Invalid Access Token"
```
❌ Facebook API Error: Invalid access token
```

**الحل:**
- تأكد من صحة `FACEBOOK_APP_SECRET`
- تأكد من تحديث Access Token إذا انتهت صلاحيته
- تأكد من إعطاء الصلاحيات المطلوبة للمستخدم

#### خطأ: "Webhook verification failed"
```
❌ Webhook verification failed
```

**الحل:**
- تأكد من صحة `WEBHOOK_VERIFY_TOKEN` في Facebook App
- تأكد من أن Webhook URL يشير إلى `/webhook`
- تأكد من استخدام HTTPS في الإنتاج

### 3. مشاكل المصادقة

#### خطأ: "JWT token invalid"
```
❌ JWT Error: invalid token
```

**الحل:**
- تأكد من صحة `JWT_SECRET` في ملف `.env`
- تأكد من عدم انتهاء صلاحية التوكن
- تأكد من إرسال التوكن في header Authorization

#### خطأ: "User not found"
```
❌ User not found
```

**الحل:**
- تأكد من تسجيل الدخول أولاً
- تأكد من صحة Facebook Login
- تأكد من حفظ التوكن في localStorage

### 4. مشاكل الواجهة الأمامية

#### خطأ: "API connection failed"
```
❌ Failed to fetch: NetworkError
```

**الحل:**
- تأكد من صحة `NEXT_PUBLIC_API_URL` في ملف `.env.local`
- تأكد من تشغيل الخادم على البورت الصحيح
- تأكد من إعدادات CORS في الخادم

#### خطأ: "Facebook SDK not loaded"
```
❌ Facebook SDK Error: FB is not defined
```

**الحل:**
- تأكد من صحة `NEXT_PUBLIC_FACEBOOK_APP_ID`
- تأكد من تحميل Facebook SDK بشكل صحيح
- تأكد من إضافة Facebook App ID في Facebook Developers

### 5. مشاكل النشر

#### خطأ: "Port already in use"
```
❌ Error: listen EADDRINUSE: address already in use :::5000
```

**الحل:**
```bash
# إيقاف العملية التي تستخدم البورت
sudo lsof -ti:5000 | xargs kill -9

# أو تغيير البورت في ملف .env
PORT=3001
```

#### خطأ: "Module not found"
```
❌ Error: Cannot find module 'express'
```

**الحل:**
```bash
# تثبيت التبعيات
npm install
cd server && npm install
cd ../client && npm install
```

#### خطأ: "Build failed"
```
❌ Build Error: Failed to compile
```

**الحل:**
- تأكد من صحة ملفات البيئة
- تأكد من تثبيت جميع التبعيات
- تحقق من أخطاء TypeScript/JavaScript

### 6. مشاكل Webhook

#### خطأ: "Webhook not receiving events"
```
❌ No webhook events received
```

**الحل:**
- تأكد من إعداد Webhook في Facebook App
- تأكد من استخدام HTTPS في الإنتاج
- تأكد من صحة Webhook URL
- تأكد من إضافة Webhook Fields المطلوبة

#### خطأ: "Webhook signature verification failed"
```
❌ Webhook signature verification failed
```

**الحل:**
- تأكد من صحة `WEBHOOK_VERIFY_TOKEN`
- تأكد من تطابق التوكن في Facebook App
- تأكد من إرسال التوكن في query parameter

### 7. مشاكل الأداء

#### بطء في التحميل
```
⚠️ Slow loading times
```

**الحل:**
- تحقق من اتصال قاعدة البيانات
- تحقق من استخدام indexes في MongoDB
- تحقق من حجم البيانات
- تحقق من إعدادات Rate Limiting

#### استهلاك ذاكرة عالي
```
⚠️ High memory usage
```

**الحل:**
- تحقق من memory leaks في الكود
- تحقق من إعدادات Node.js
- تحقق من حجم البيانات المحملة
- تحقق من إعدادات Cache

### 8. أدوات التشخيص

#### فحص حالة التطبيق
```bash
# فحص حالة API
curl http://localhost:5000/api/health

# فحص حالة قاعدة البيانات
curl http://localhost:5000/api/test-db

# فحص حالة Facebook API
curl http://localhost:5000/api/test-api
```

#### فحص السجلات
```bash
# سجلات الخادم
tail -f server/logs/app.log

# سجلات الأخطاء
tail -f server/logs/error.log

# سجلات Facebook API
tail -f server/logs/facebook.log
```

#### فحص قاعدة البيانات
```bash
# الاتصال بـ MongoDB
mongo "mongodb+srv://username:password@cluster.mongodb.net/facebook-bot"

# فحص المجموعات
show collections

# فحص المستخدمين
db.users.find().limit(5)

# فحص الصفحات
db.pages.find().limit(5)
```

### 9. نصائح للوقاية

#### إعدادات الأمان
- استخدم كلمات مرور قوية
- حدث التوكنات بانتظام
- راقب السجلات باستمرار
- استخدم HTTPS في الإنتاج

#### إعدادات الأداء
- استخدم indexes في قاعدة البيانات
- راقب استخدام الذاكرة
- راقب استجابة API
- استخدم Rate Limiting

#### إعدادات الصيانة
- احفظ نسخ احتياطية من قاعدة البيانات
- حدث التبعيات بانتظام
- راقب السجلات للأخطاء
- اختبر التطبيق بعد كل تحديث

## الحصول على المساعدة

إذا لم تجد الحل لمشكلتك:

1. تحقق من السجلات للحصول على تفاصيل أكثر
2. ابحث عن رسالة الخطأ في Google
3. تحقق من وثائق Facebook API
4. تحقق من وثائق MongoDB
5. تحقق من وثائق Next.js

## روابط مفيدة

- [Facebook Developers](https://developers.facebook.com/)
- [MongoDB Atlas](https://cloud.mongodb.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)




