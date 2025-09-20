import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function TestDB() {
  const [testResults, setTestResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    try {
      // Test 1: Check all pages (debug endpoint)
      const pagesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/facebook/debug-pages`)
      const pagesData = await pagesResponse.json()

      // Test 2: Check all users (debug endpoint)
      const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/debug-users`)
      const usersData = await usersResponse.json()

      // Test 3: Check authenticated pages (if token exists)
      const token = localStorage.getItem('token')
      let authPagesData = null
      if (token) {
        try {
          const authPagesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/facebook/pages`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          authPagesData = await authPagesResponse.json()
        } catch (error) {
          console.error('Auth pages error:', error)
        }
      }

      setTestResults({
        pages: pagesData,
        users: usersData,
        authPages: authPagesData,
        token: token ? 'Present' : 'Not found'
      })
    } catch (error) {
      console.error('Test error:', error)
      setTestResults({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>اختبار قاعدة البيانات - بوت فيسبوك وماسنجر</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              اختبار قاعدة البيانات
            </h1>

            <button
              onClick={runTests}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isLoading ? 'جاري الاختبار...' : 'تشغيل الاختبارات'}
            </button>

            {testResults && (
              <div className="space-y-6">
                {/* Pages Test */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    اختبار الصفحات (جميع الصفحات)
                  </h3>
                  <pre className="bg-white rounded p-3 text-sm overflow-auto">
                    {JSON.stringify(testResults.pages, null, 2)}
                  </pre>
                </div>

                {/* Users Test */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    اختبار المستخدمين
                  </h3>
                  <pre className="bg-white rounded p-3 text-sm overflow-auto">
                    {JSON.stringify(testResults.users, null, 2)}
                  </pre>
                </div>

                {/* Auth Pages Test */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    اختبار الصفحات المصادقة عليها
                  </h3>
                  <pre className="bg-white rounded p-3 text-sm overflow-auto">
                    {JSON.stringify(testResults.authPages, null, 2)}
                  </pre>
                </div>

                {/* Token Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    حالة الرمز المميز
                  </h3>
                  <p className="text-sm text-gray-600">
                    {testResults.token}
                  </p>
                </div>

                {/* Error */}
                {testResults.error && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-900 mb-3">
                      خطأ في الاختبار
                    </h3>
                    <p className="text-sm text-red-600">
                      {testResults.error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}