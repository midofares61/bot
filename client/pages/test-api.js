// client/pages/test-api.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function TestAPI() {
  const [user, setUser] = useState(null)
  const [testResults, setTestResults] = useState({})
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

  const testAPI = async (endpoint, name) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      return {
        success: response.ok,
        status: response.status,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error.message
      }
    }
  }

  const runAllTests = async () => {
    setIsLoading(true)
    const results = {}

    // Test logs stats
    results.logsStats = await testAPI('/api/logs/stats', 'Logs Stats')
    
    // Test pages
    results.pages = await testAPI('/api/facebook/pages', 'Pages')
    
    // Test database
    results.dbTest = await testAPI('/api/facebook/test-db', 'Database Test')
    
    // Test blocked users
    results.blockedUsers = await testAPI('/api/blocked-users', 'Blocked Users')
    
    // Test comments
    results.comments = await testAPI('/api/comments', 'Comments')
    
    // Test messenger
    results.messenger = await testAPI('/api/messenger/conversations', 'Messenger')

    setTestResults(results)
    setIsLoading(false)
    toast.success('تم تشغيل جميع الاختبارات')
  }

  if (!user) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Head>
        <title>اختبار API - بوت فيسبوك وماسنجر</title>
      </Head>

      <Layout user={user}>
        <div className="space-y-6" style={{ width: '100%' }}>
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              اختبار API
            </h1>
            <p className="text-gray-600 mt-2">
              فحص جميع endpoints للتأكد من عملها بشكل صحيح
            </p>
          </div>

          {/* Test Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'جاري الاختبار...' : 'تشغيل جميع الاختبارات'}
            </button>
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">نتائج الاختبارات</h3>
              
              <div className="space-y-4">
                {Object.entries(testResults).map(([key, result]) => (
                  <div key={key} className={`p-4 rounded-lg border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{key}</h4>
                      <span className={`badge ${result.success ? 'badge-success' : 'badge-error'}`}>
                        {result.success ? 'نجح' : 'فشل'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Status: {result.status}
                    </p>
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">
                        Error: {result.error}
                      </p>
                    )}
                    {result.data && (
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => router.push('/test-db')}
              className="btn-secondary"
            >
              اختبار قاعدة البيانات
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              العودة للوحة التحكم
            </button>
          </div>
        </div>
      </Layout>
    </>
  )
}
