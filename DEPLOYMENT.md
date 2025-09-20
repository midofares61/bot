# دليل النشر - Facebook Messenger Bot

## النشر على Shared Hosting (cPanel/WHM)

### 1. إعداد البيئة

#### أ. إنشاء ملفات البيئة
```bash
# في مجلد server/
cp env.example .env
# قم بتعديل القيم في ملف .env

# في مجلد client/
cp env.local.example .env.local
# قم بتعديل القيم في ملف .env.local
```

#### ب. متغيرات البيئة المطلوبة

**Server (.env):**
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/facebook-bot
JWT_SECRET=your-super-secret-jwt-key-here
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=https://yourdomain.com/auth/facebook/callback
WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
SERVER_URL=https://yourdomain.com
```

**Client (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

### 2. رفع الملفات

1. ارفع جميع الملفات إلى المجلد الرئيسي في cPanel
2. تأكد من رفع ملف `.htaccess`
3. تأكد من رفع ملفات البيئة `.env` و `.env.local`

### 3. إعداد Node.js في cPanel

1. اذهب إلى "Node.js Selector" في cPanel
2. اختر إصدار Node.js 18 أو أحدث
3. قم بتشغيل الأوامر التالية:

```bash
# تثبيت التبعيات
npm install
cd server && npm install
cd ../client && npm install

# بناء التطبيق
cd client && npm run build

# تشغيل التطبيق
cd ../server && npm start
```

### 4. إعداد SSL

1. قم بتفعيل SSL من cPanel
2. تأكد من تحديث URLs في Facebook App لاستخدام HTTPS

### 5. إعداد Cron Jobs

```bash
# تشغيل التطبيق كل دقيقة
* * * * * cd /path/to/your/app/server && npm start
```

## النشر باستخدام Docker

### 1. بناء وتشغيل الحاويات

```bash
# بناء وتشغيل جميع الخدمات
docker-compose up -d

# عرض السجلات
docker-compose logs -f

# إيقاف الخدمات
docker-compose down
```

### 2. إعداد متغيرات البيئة

قم بتعديل ملف `docker-compose.yml` وأضف متغيرات البيئة الصحيحة.

## النشر على Vercel (Frontend فقط)

### 1. إعداد Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# نشر المشروع
cd client
vercel
```

### 2. إعداد متغيرات البيئة في Vercel

1. اذهب إلى Vercel Dashboard
2. اختر مشروعك
3. اذهب إلى Settings > Environment Variables
4. أضف المتغيرات التالية:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_FACEBOOK_APP_ID`

## النشر على Heroku

### 1. إعداد Heroku

```bash
# تثبيت Heroku CLI
npm i -g heroku

# تسجيل الدخول
heroku login

# إنشاء تطبيق
heroku create your-app-name

# إضافة متغيرات البيئة
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set FACEBOOK_APP_ID=your-facebook-app-id
heroku config:set FACEBOOK_APP_SECRET=your-facebook-app-secret
heroku config:set WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
heroku config:set SERVER_URL=https://your-app-name.herokuapp.com
```

### 2. نشر التطبيق

```bash
# إضافة Heroku remote
heroku git:remote -a your-app-name

# نشر التطبيق
git push heroku main
```

## استكشاف الأخطاء

### 1. مشاكل شائعة

- **خطأ في الاتصال بقاعدة البيانات**: تأكد من صحة MONGODB_URI
- **خطأ في Facebook API**: تأكد من صحة Facebook App ID و Secret
- **مشاكل في Webhook**: تأكد من صحة WEBHOOK_VERIFY_TOKEN

### 2. فحص السجلات

```bash
# سجلات الخادم
tail -f server/logs/app.log

# سجلات Docker
docker-compose logs -f app

# سجلات Heroku
heroku logs --tail
```

### 3. اختبار التطبيق

```bash
# اختبار API
curl https://yourdomain.com/api/health

# اختبار Webhook
curl -X GET "https://yourdomain.com/webhook?hub.verify_token=your-token&hub.challenge=test"
```

## الأمان

### 1. إعدادات الأمان المطلوبة

- ✅ استخدام HTTPS
- ✅ تحديث JWT_SECRET
- ✅ تحديث WEBHOOK_VERIFY_TOKEN
- ✅ إعداد Rate Limiting
- ✅ إعداد CORS بشكل صحيح

### 2. مراجعة Facebook App

- تأكد من إضافة جميع URLs الصحيحة
- تأكد من تفعيل جميع الصلاحيات المطلوبة
- تأكد من إعداد Webhook بشكل صحيح

## الدعم

إذا واجهت أي مشاكل في النشر:

1. تحقق من السجلات
2. تأكد من صحة متغيرات البيئة
3. تأكد من إعدادات Facebook App
4. تأكد من اتصال قاعدة البيانات




