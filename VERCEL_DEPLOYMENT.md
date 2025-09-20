# دليل رفع المشروع على Vercel

## متطلبات ما قبل الرفع

### 1. إعداد قاعدة البيانات
- أنشئ حساب على [MongoDB Atlas](https://www.mongodb.com/atlas)
- أنشئ cluster جديد
- احصل على connection string

### 2. إعداد Facebook App
- اذهب إلى [Facebook Developers](https://developers.facebook.com/)
- أنشئ تطبيق جديد
- احصل على App ID و App Secret
- أضف Webhook URL: `https://your-app.vercel.app/webhook`

## خطوات الرفع على Vercel

### 1. رفع الكود على GitHub
```bash
# إنشاء repository جديد على GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/facebook-bot.git
git push -u origin main
```

### 2. ربط المشروع مع Vercel
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اضغط على "New Project"
3. اختر GitHub repository
4. اختر المشروع

### 3. إعداد متغيرات البيئة
في Vercel Dashboard، اذهب إلى Settings > Environment Variables وأضف:

#### متغيرات الخادم:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
NODE_ENV=production
CLIENT_URL=https://your-app.vercel.app
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
JWT_SECRET=your_jwt_secret_key
```

#### متغيرات Next.js:
```
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
NEXT_PUBLIC_CLIENT_URL=https://your-app.vercel.app
NEXT_PUBLIC_FACEBOOK_API_VERSION=v18.0
```

### 4. إعدادات البناء
- **Framework Preset**: Next.js
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 5. إعداد Webhook في Facebook
1. اذهب إلى Facebook App Settings
2. أضف Webhook URL: `https://your-app.vercel.app/webhook`
3. أضف Verify Token (نفس القيمة في متغيرات البيئة)

## هيكل المشروع على Vercel

```
/
├── client/          # Next.js Frontend
├── server/          # Express.js Backend (API Routes)
├── vercel.json      # Vercel Configuration
└── package.json     # Root Package.json
```

## اختبار النشر

### 1. اختبار API
```bash
curl https://your-app.vercel.app/api/health
```

### 2. اختبار Frontend
- اذهب إلى `https://your-app.vercel.app`
- تأكد من عمل تسجيل الدخول

### 3. اختبار Webhook
- استخدم Facebook Webhook Tester
- تأكد من استقبال البيانات

## استكشاف الأخطاء

### مشاكل شائعة:
1. **خطأ CORS**: تأكد من إعداد `CLIENT_URL` بشكل صحيح
2. **خطأ قاعدة البيانات**: تأكد من صحة `MONGODB_URI`
3. **خطأ Facebook**: تأكد من صحة App ID و Secret

### سجلات الأخطاء:
- اذهب إلى Vercel Dashboard > Functions
- اختر function واطلع على Logs

## نصائح مهمة

1. **الأمان**: استخدم متغيرات البيئة لجميع البيانات الحساسة
2. **الأداء**: استخدم Vercel Analytics لمراقبة الأداء
3. **النسخ الاحتياطي**: احتفظ بنسخة احتياطية من قاعدة البيانات
4. **التحديثات**: استخدم GitHub Actions للـ CI/CD

## الدعم

إذا واجهت أي مشاكل:
1. راجع سجلات Vercel
2. تأكد من صحة متغيرات البيئة
3. اختبر API endpoints بشكل منفصل
