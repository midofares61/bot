# وثائق API - Facebook Messenger Bot

## نظرة عامة

هذا API يوفر واجهة برمجية شاملة لإدارة بوت فيسبوك وماسنجر مع لوحة تحكم عربية متقدمة.

**Base URL:** `https://yourdomain.com/api`

## المصادقة

جميع طلبات API تتطلب مصادقة باستخدام JWT token في header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. المصادقة (Authentication)

#### تسجيل الدخول عبر Facebook
```http
POST /api/auth/facebook
Content-Type: application/json

{
  "accessToken": "facebook-access-token"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "profilePicture": "https://...",
    "facebookId": "facebook-id"
  }
}
```

#### التحقق من التوكن
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

#### الحصول على صفحات المستخدم
```http
GET /api/auth/pages
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "pages": [
    {
      "id": "page-id",
      "name": "Page Name",
      "access_token": "page-access-token",
      "category": "Business"
    }
  ]
}
```

### 2. إدارة الصفحات (Pages)

#### ربط صفحة جديدة
```http
POST /api/facebook/connect-page
Authorization: Bearer <token>
Content-Type: application/json

{
  "pageId": "page-id",
  "pageAccessToken": "page-access-token"
}
```

#### الحصول على قائمة الصفحات
```http
GET /api/facebook/pages
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "pages": [
    {
      "id": "page-id",
      "pageId": "facebook-page-id",
      "pageName": "Page Name",
      "isActive": true,
      "botEnabled": false,
      "settings": {
        "welcomeMessage": "مرحباً!",
        "autoReplyMessage": "شكراً لك",
        "commentAutoReply": "شكراً لتعليقك"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### تفعيل/إيقاف البوت
```http
PUT /api/facebook/toggle-bot/:pageId
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true
}
```

#### تحديث إعدادات الصفحة
```http
PUT /api/facebook/settings/:pageId
Authorization: Bearer <token>
Content-Type: application/json

{
  "welcomeMessage": "مرحباً بك!",
  "autoReplyMessage": "شكراً لك على رسالتك",
  "commentAutoReply": "شكراً لتعليقك",
  "badWords": ["كلمة1", "كلمة2"],
  "autoDeleteBadComments": true
}
```

### 3. إدارة الرسائل (Messenger)

#### الحصول على المحادثات
```http
GET /api/messenger/conversations/:pageId
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): رقم الصفحة للتنقل
- `limit` (optional): عدد المحادثات (default: 20)
- `status` (optional): حالة المحادثة (unread, read, archived)

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conversation-id",
      "conversationId": "facebook-conversation-id",
      "participantId": "user-facebook-id",
      "participantName": "User Name",
      "participantPicture": "https://...",
      "lastMessage": "آخر رسالة",
      "lastMessageTime": "2024-01-01T00:00:00.000Z",
      "unreadCount": 2,
      "status": "unread",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### الحصول على رسائل المحادثة
```http
GET /api/messenger/messages/:conversationId
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): رقم الصفحة للتنقل
- `limit` (optional): عدد الرسائل (default: 50)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "message-id",
      "messageId": "facebook-message-id",
      "conversationId": "conversation-id",
      "senderId": "sender-facebook-id",
      "senderName": "Sender Name",
      "content": "محتوى الرسالة",
      "type": "text",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "isFromBot": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 200,
    "pages": 4
  }
}
```

#### إرسال رسالة
```http
POST /api/messenger/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "conversation-id",
  "message": "نص الرسالة"
}
```

#### وضع علامة مقروءة
```http
PUT /api/messenger/mark-read/:conversationId
Authorization: Bearer <token>
```

#### وضع علامة غير مقروءة
```http
PUT /api/messenger/mark-unread/:conversationId
Authorization: Bearer <token>
```

#### أرشفة المحادثة
```http
PUT /api/messenger/archive/:conversationId
Authorization: Bearer <token>
```

#### إحصائيات الرسائل
```http
GET /api/messenger/stats/:pageId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalConversations": 150,
    "unreadConversations": 25,
    "totalMessages": 1250,
    "messagesToday": 45,
    "messagesThisWeek": 320,
    "messagesThisMonth": 1250
  }
}
```

### 4. إدارة التعليقات (Comments)

#### الحصول على تعليقات الصفحة
```http
GET /api/comments/:pageId
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): رقم الصفحة للتنقل
- `limit` (optional): عدد التعليقات (default: 20)
- `status` (optional): حالة التعليق (pending, approved, rejected, deleted)

**Response:**
```json
{
  "success": true,
  "comments": [
    {
      "id": "comment-id",
      "commentId": "facebook-comment-id",
      "postId": "facebook-post-id",
      "postMessage": "نص المنشور",
      "authorId": "author-facebook-id",
      "authorName": "Author Name",
      "authorPicture": "https://...",
      "content": "نص التعليق",
      "status": "pending",
      "isBadWord": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "pages": 25
  }
}
```

#### الموافقة على تعليق
```http
PUT /api/comments/approve/:commentId
Authorization: Bearer <token>
```

#### رفض تعليق
```http
PUT /api/comments/reject/:commentId
Authorization: Bearer <token>
```

#### حذف تعليق
```http
DELETE /api/comments/delete/:commentId
Authorization: Bearer <token>
```

#### الرد على تعليق
```http
POST /api/comments/reply/:commentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "reply": "نص الرد"
}
```

#### إحصائيات التعليقات
```http
GET /api/comments/stats/:pageId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalComments": 500,
    "pendingComments": 25,
    "approvedComments": 400,
    "rejectedComments": 50,
    "deletedComments": 25,
    "commentsToday": 15,
    "commentsThisWeek": 85,
    "commentsThisMonth": 500
  }
}
```

### 5. إدارة المحظورين (Blocked Users)

#### الحصول على المستخدمين المحظورين
```http
GET /api/blocked-users/:pageId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "blockedUsers": [
    {
      "id": "blocked-user-id",
      "userId": "facebook-user-id",
      "userName": "User Name",
      "userPicture": "https://...",
      "reason": "سبب الحظر",
      "blockedAt": "2024-01-01T00:00:00.000Z",
      "blockedBy": "admin-name"
    }
  ]
}
```

#### حظر مستخدم
```http
POST /api/blocked-users/block
Authorization: Bearer <token>
Content-Type: application/json

{
  "pageId": "page-id",
  "userId": "facebook-user-id",
  "reason": "سبب الحظر"
}
```

#### إلغاء حظر مستخدم
```http
PUT /api/blocked-users/unblock/:userId
Authorization: Bearer <token>
```

#### إحصائيات المحظورين
```http
GET /api/blocked-users/stats/:pageId
Authorization: Bearer <token>
```

### 6. السجلات والتقارير (Logs)

#### الحصول على سجل الأحداث
```http
GET /api/logs/:pageId
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): رقم الصفحة للتنقل
- `limit` (optional): عدد السجلات (default: 50)
- `type` (optional): نوع الحدث
- `startDate` (optional): تاريخ البداية
- `endDate` (optional): تاريخ النهاية

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "log-id",
      "type": "message_received",
      "description": "تم استلام رسالة جديدة",
      "data": {
        "conversationId": "conversation-id",
        "messageId": "message-id",
        "senderId": "sender-id"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "pages": 20
  }
}
```

#### إحصائيات السجل
```http
GET /api/logs/stats/:pageId
Authorization: Bearer <token>
```

#### أنواع الأحداث
```http
GET /api/logs/types/:pageId
Authorization: Bearer <token>
```

#### حذف السجلات القديمة
```http
DELETE /api/logs/clear-old/:pageId
Authorization: Bearer <token>
```

### 7. Webhook

#### التحقق من Webhook
```http
GET /webhook
```

**Query Parameters:**
- `hub.mode`: subscribe
- `hub.verify_token`: your-webhook-verify-token
- `hub.challenge`: challenge-string

**Response:**
```
challenge-string
```

#### استقبال الأحداث
```http
POST /webhook
Content-Type: application/json

{
  "object": "page",
  "entry": [
    {
      "id": "page-id",
      "time": 1234567890,
      "messaging": [
        {
          "sender": {
            "id": "sender-id"
          },
          "recipient": {
            "id": "page-id"
          },
          "timestamp": 1234567890,
          "message": {
            "mid": "message-id",
            "text": "message-text"
          }
        }
      ]
    }
  ]
}
```

## رموز الحالة (Status Codes)

- `200` - نجح الطلب
- `201` - تم إنشاء المورد بنجاح
- `400` - طلب غير صحيح
- `401` - غير مصرح
- `403` - ممنوع
- `404` - غير موجود
- `429` - تجاوز حد الطلبات
- `500` - خطأ في الخادم

## معالجة الأخطاء

جميع الأخطاء تُرجع في التنسيق التالي:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

## Rate Limiting

- **100 طلب** لكل IP في **15 دقيقة**
- **1000 طلب** لكل مستخدم في **ساعة واحدة**

عند تجاوز الحد:
```json
{
  "success": false,
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900
}
```

## أمثلة على الاستخدام

### تسجيل الدخول وإرسال رسالة

```javascript
// 1. تسجيل الدخول
const loginResponse = await fetch('/api/auth/facebook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    accessToken: 'facebook-access-token'
  })
});

const { token } = await loginResponse.json();

// 2. إرسال رسالة
const messageResponse = await fetch('/api/messenger/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    conversationId: 'conversation-id',
    message: 'مرحباً!'
  })
});
```

### إدارة التعليقات

```javascript
// الحصول على التعليقات المعلقة
const commentsResponse = await fetch('/api/comments/page-id?status=pending', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { comments } = await commentsResponse.json();

// الموافقة على تعليق
await fetch(`/api/comments/approve/${commentId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## الدعم

للمساعدة في استخدام API:

1. راجع [دليل استكشاف الأخطاء](TROUBLESHOOTING.md)
2. تحقق من السجلات في `/server/logs/`
3. تأكد من صحة متغيرات البيئة
4. تحقق من إعدادات Facebook App




