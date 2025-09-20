# رفع سريع على Vercel

## الخطوات الأساسية:

### 1. رفع الكود على GitHub
```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/username/facebook-bot.git
git push -u origin main
```

### 2. ربط مع Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط "New Project"
3. اختر GitHub repository
4. اختر المشروع

### 3. إعدادات Vercel
- **Framework**: Next.js
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 4. متغيرات البيئة المطلوبة
```
MONGODB_URI=mongodb+srv://...
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_ACCESS_TOKEN=your_access_token
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_verify_token
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id
NEXT_PUBLIC_CLIENT_URL=https://your-app.vercel.app
```

### 5. اختبار النشر
- اذهب إلى `https://your-app.vercel.app`
- اختبر `/api/health`
- اختبر تسجيل الدخول

## ملاحظات مهمة:
- تأكد من إعداد Facebook Webhook URL
- استخدم MongoDB Atlas لقاعدة البيانات
- جميع الملفات جاهزة للرفع
