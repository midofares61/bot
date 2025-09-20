import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FacebookLoginButton } from '../components/FacebookLoginButton'
import { LoadingSpinner } from '../components/LoadingSpinner'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token with backend
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user)
          router.push('/dashboard')
        } else {
          localStorage.removeItem('token')
          setIsLoading(false)
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
        setIsLoading(false)
      })
    } else {
      // SDK is injected and initialized in _document.js; just stop loading
      setIsLoading(false)
    }
  }, [router])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    router.push('/dashboard')
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Head>
        <title>بوت فيسبوك وماسنجر - لوحة التحكم</title>
        <meta name="description" content="منصة بوت فيسبوك وماسنجر مع لوحة تحكم شاملة لإدارة الصفحات والردود التلقائية" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gray-900">
                    بوت فيسبوك وماسنجر
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              مرحباً بك في
              <span className="block text-blue-600">منصة البوت الذكي</span>
            </h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              إدارة شاملة لصفحات فيسبوك مع ردود تلقائية ذكية وفلترة الكومنتات المسيئة
            </p>
          </div>

          {/* Features */}
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card card-hover">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mr-4">
                    <h3 className="text-lg font-medium text-gray-900">ردود تلقائية</h3>
                    <p className="text-gray-500">رد تلقائي على الكومنتات والرسائل</p>
                  </div>
                </div>
              </div>

              <div className="card card-hover">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mr-4">
                    <h3 className="text-lg font-medium text-gray-900">فلترة ذكية</h3>
                    <p className="text-gray-500">حذف تلقائي للكومنتات المسيئة</p>
                  </div>
                </div>
              </div>

              <div className="card card-hover">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mr-4">
                    <h3 className="text-lg font-medium text-gray-900">تقارير شاملة</h3>
                    <p className="text-gray-500">متابعة جميع الأنشطة والإحصائيات</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login Section */}
          <div className="mt-16">
            <div className="max-w-md mx-auto">
              <div className="card">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    ابدأ الآن
                  </h3>
                  <p className="text-gray-600 mb-6">
                    سجل دخولك باستخدام حساب فيسبوك للبدء
                  </p>
                  <FacebookLoginButton onSuccess={handleLoginSuccess} />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-500">
                © 2024 بوت فيسبوك وماسنجر. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
