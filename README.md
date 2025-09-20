# بوت فيسبوك وماسنجر - لوحة التحكم

منصة شاملة لإدارة بوت فيسبوك وماسنجر مع لوحة تحكم عربية متقدمة.

## المميزات الرئيسية

- 🔐 **تسجيل دخول آمن** عبر Facebook OAuth2
- 📄 **إدارة الصفحات** - ربط وإدارة صفحات فيسبوك
- 🤖 **ردود تلقائية** على الكومنتات والرسائل
- 🛡️ **فلترة ذكية** للكومنتات المسيئة
- 🚫 **إدارة المحظورين** - حظر وإلغاء حظر المستخدمين
- 📊 **تقارير شاملة** - إحصائيات مفصلة لجميع الأنشطة
- ⚙️ **إعدادات متقدمة** - تخصيص كامل للبوت
- 💬 **إدارة الرسائل** - واجهة محادثة متقدمة
- 💭 **إدارة الكومنتات** - مراجعة وموافقة على الكومنتات
- 📈 **لوحة تحكم تفاعلية** - واجهة مستخدم عربية متقدمة

## التقنيات المستخدمة

### Backend
- **Node.js** + **Express.js**
- **MongoDB Atlas** (قاعدة بيانات سحابية)
- **JWT** للمصادقة
- **Facebook Graph API** + **Messenger Platform API**

### Frontend
- **Next.js** + **React.js**
- **Tailwind CSS** للتصميم
- **React Query** لإدارة البيانات
- **React Hot Toast** للإشعارات

### النشر
- **Shared Hosting** (cPanel/WHM)
- **MongoDB Atlas** (قاعدة بيانات سحابية)
- **SSL** للأمان

## التثبيت والتشغيل

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd facebook-messenger-bot
```

### 2. تثبيت التبعيات
```bash
npm run install-all
```

### 3. إعداد متغيرات البيئة

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/facebook-bot?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Facebook App Configuration
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=https://yourdomain.com/auth/facebook/callback

# Webhook Verification
WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# Server URL
SERVER_URL=https://yourdomain.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

### 4. تشغيل التطبيق

#### للتطوير
```bash
npm run dev
```

#### للإنتاج
```bash
npm run build-production
```

## إعداد Facebook App

### 1. إنشاء Facebook App
1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. أنشئ تطبيق جديد
3. اختر "Business" كنوع التطبيق

### 2. إضافة المنتجات
- **Facebook Login** - للمصادقة
- **Messenger** - لإرسال الرسائل
- **Pages** - لإدارة الصفحات

### 3. إعداد Webhook
- **Callback URL**: `https://yourdomain.com/webhook`
- **Verify Token**: نفس القيمة في `.env`
- **Webhook Fields**: `messages`, `messaging_postbacks`, `feed`

### 4. الصلاحيات المطلوبة
- `pages_manage_metadata`
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_messaging`

## إعداد MongoDB Atlas

### 1. إنشاء Cluster
1. اذهب إلى [MongoDB Atlas](https://cloud.mongodb.com/)
2. أنشئ حساب جديد
3. أنشئ cluster جديد

### 2. إعداد قاعدة البيانات
1. أنشئ قاعدة بيانات باسم `facebook-bot`
2. أضف مستخدم جديد مع صلاحيات القراءة والكتابة
3. احصل على connection string

### 3. إعداد Network Access
1. أضف IP address الخاص بك
2. أو استخدم `0.0.0.0/0` للسماح من أي مكان (للتطوير فقط)

## النشر على Shared Hosting

### 1. رفع الملفات
1. ارفع جميع الملفات إلى المجلد الرئيسي
2. تأكد من رفع ملف `.htaccess`

### 2. إعداد Node.js
1. في cPanel، اذهب إلى "Node.js Selector"
2. اختر إصدار Node.js 16 أو أحدث
3. قم بتشغيل `npm install` في المجلد الرئيسي

### 3. إعداد SSL
1. قم بتفعيل SSL من cPanel
2. تأكد من تحديث URLs في Facebook App

### 4. إعداد Cron Jobs
```bash
# تشغيل التطبيق كل دقيقة
* * * * * cd /path/to/your/app && npm start
```

## هيكل المشروع

```
facebook-messenger-bot/
├── server/                 # Backend (Node.js + Express)
│   ├── models/            # نماذج قاعدة البيانات
│   ├── routes/            # API Routes
│   ├── middleware/        # Middleware functions
│   └── index.js          # Server entry point
├── client/                # Frontend (Next.js + React)
│   ├── components/        # React Components
│   ├── pages/            # Next.js Pages
│   ├── styles/           # CSS Styles
│   └── public/           # Static Assets
├── .htaccess             # Apache Configuration
├── package.json          # Root package.json
└── README.md             # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/facebook` - تسجيل الدخول
- `GET /api/auth/pages` - الحصول على صفحات المستخدم
- `GET /api/auth/verify` - التحقق من التوكن

### Facebook Integration
- `POST /api/facebook/connect-page` - ربط صفحة
- `GET /api/facebook/pages` - قائمة الصفحات
- `PUT /api/facebook/toggle-bot/:pageId` - تفعيل/إيقاف البوت
- `PUT /api/facebook/settings/:pageId` - تحديث الإعدادات

### Messenger
- `GET /api/messenger/conversations/:pageId` - المحادثات
- `GET /api/messenger/messages/:conversationId` - الرسائل
- `POST /api/messenger/send` - إرسال رسالة
- `PUT /api/messenger/mark-read/:conversationId` - وضع علامة مقروءة
- `PUT /api/messenger/mark-unread/:conversationId` - وضع علامة غير مقروءة
- `PUT /api/messenger/archive/:conversationId` - أرشفة المحادثة
- `GET /api/messenger/stats/:pageId` - إحصائيات الرسائل

### Comments
- `GET /api/comments/:pageId` - كومنتات الصفحة
- `PUT /api/comments/approve/:commentId` - الموافقة على كومنت
- `PUT /api/comments/reject/:commentId` - رفض كومنت
- `DELETE /api/comments/delete/:commentId` - حذف كومنت
- `POST /api/comments/reply/:commentId` - الرد على كومنت
- `GET /api/comments/stats/:pageId` - إحصائيات الكومنتات

### Blocked Users
- `GET /api/blocked-users/:pageId` - المستخدمين المحظورين
- `POST /api/blocked-users/block` - حظر مستخدم
- `PUT /api/blocked-users/unblock/:userId` - إلغاء حظر مستخدم
- `GET /api/blocked-users/stats/:pageId` - إحصائيات المحظورين

### Settings
- `PUT /api/facebook/settings/:pageId` - تحديث إعدادات الصفحة
- `GET /api/facebook/settings/:pageId` - الحصول على إعدادات الصفحة

### Logs & Reports
- `GET /api/logs/:pageId` - سجل الأحداث
- `GET /api/logs/stats/:pageId` - إحصائيات السجل
- `GET /api/logs/types/:pageId` - أنواع الأحداث
- `DELETE /api/logs/clear-old/:pageId` - حذف السجلات القديمة

### Webhook
- `GET /webhook` - التحقق من Webhook
- `POST /webhook` - استقبال الأحداث

## الأمان

- ✅ **HTTPS** مطلوب لجميع الاتصالات
- ✅ **JWT** للمصادقة
- ✅ **Rate Limiting** لمنع الإساءة
- ✅ **Input Validation** لجميع المدخلات
- ✅ **CORS** محدود للمواقع المسموحة
- ✅ **Security Headers** للحماية

## الدعم والمساعدة

إذا واجهت أي مشاكل أو لديك أسئلة:

1. تحقق من logs في `/server/logs/`
2. تأكد من إعدادات Facebook App
3. تحقق من اتصال MongoDB Atlas
4. تأكد من صحة متغيرات البيئة

## الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف `LICENSE` للتفاصيل.

## المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء branch جديد للميزة
3. Commit التغييرات
4. Push إلى Branch
5. إنشاء Pull Request

---

**ملاحظة**: تأكد من الحصول على موافقة Facebook Review للصلاحيات المتقدمة مثل الرسائل التلقائية والـ broadcast.
#   b o t  
 