// client/pages/pages/connect.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Layout } from '../../components/Layout'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function ConnectPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  const handleFacebookConnect = () => {
    setIsLoading(true)
    
    // Redirect to Facebook OAuth for pages
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    const appBaseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || window.location.origin
    const redirectUri = `${appBaseUrl}/pages/connect/callback`
    const scope = 'pages_manage_metadata,pages_read_engagement,pages_manage_posts,pages_messaging'
    
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&auth_type=rerequest`
    
    window.location.href = facebookAuthUrl
  }

  if (!user) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Head>
        <title>ربط صفحة جديدة - بوت فيسبوك وماسنجر</title>
      </Head>

      <Layout user={user}>
        <div className="space-y-6" style={{ width: '100%' }}>
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  ربط صفحة جديدة
                </h1>
                <p className="text-gray-600 mt-2">
                  ربط صفحة فيسبوك جديدة لإدارة البوت
                </p>
              </div>
              <button
                onClick={() => router.push('/pages')}
                className="btn-secondary"
              >
                العودة للصفحات
              </button>
            </div>
          </div>

          {/* Connect Instructions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">خطوات ربط الصفحة</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                </div>
                <div className="mr-4">
                  <h4 className="text-sm font-medium text-gray-900">تأكد من أنك مدير الصفحة</h4>
                  <p className="text-sm text-gray-500">
                    يجب أن تكون مديراً أو محرراً في الصفحة التي تريد ربطها
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                </div>
                <div className="mr-4">
                  <h4 className="text-sm font-medium text-gray-900">اضغط على زر الربط</h4>
                  <p className="text-sm text-gray-500">
                    سيتم توجيهك إلى فيسبوك للموافقة على الصلاحيات المطلوبة
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                </div>
                <div className="mr-4">
                  <h4 className="text-sm font-medium text-gray-900">اختر الصفحة</h4>
                  <p className="text-sm text-gray-500">
                    اختر الصفحة التي تريد ربطها من قائمة الصفحات المتاحة
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                </div>
                <div className="mr-4">
                  <h4 className="text-sm font-medium text-gray-900">اكتمال الربط</h4>
                  <p className="text-sm text-gray-500">
                    ستتم إضافة الصفحة إلى قائمة الصفحات المربوطة ويمكنك البدء في إدارة البوت
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Required Permissions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">الصلاحيات المطلوبة</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-900">إدارة الصفحة</p>
                  <p className="text-xs text-gray-500">قراءة معلومات الصفحة</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-900">إدارة المنشورات</p>
                  <p className="text-xs text-gray-500">الرد على الكومنتات</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-900">رسائل الماسنجر</p>
                  <p className="text-xs text-gray-500">إرسال واستقبال الرسائل</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-900">تفاعل الصفحة</p>
                  <p className="text-xs text-gray-500">قراءة تفاعلات الصفحة</p>
                </div>
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">🔗</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                جاهز لربط صفحة جديدة؟
              </h3>
              <p className="text-gray-500 mb-6">
                اضغط على الزر أدناه لبدء عملية ربط صفحة فيسبوك جديدة
              </p>
              <button
                onClick={handleFacebookConnect}
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري التوجيه...
                  </div>
                ) : (
                  'ربط صفحة جديدة'
                )}
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">الأسئلة الشائعة</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">هل يمكنني ربط أكثر من صفحة؟</h4>
                <p className="text-sm text-gray-500">
                  نعم، يمكنك ربط عدة صفحات وإدارتها من نفس الحساب
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">هل يمكنني إلغاء ربط الصفحة لاحقاً؟</h4>
                <p className="text-sm text-gray-500">
                  نعم، يمكنك إلغاء ربط أي صفحة في أي وقت من صفحة إدارة الصفحات
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">هل البوت سيعمل تلقائياً بعد الربط؟</h4>
                <p className="text-sm text-gray-500">
                  لا، يجب عليك تفعيل البوت يدوياً لكل صفحة من صفحة إدارة الصفحات
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
