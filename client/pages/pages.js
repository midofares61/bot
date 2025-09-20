// client/pages/pages.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

export default function Pages() {
  const [user, setUser] = useState(null)
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

  // Fetch pages
  const { data: pagesData, isLoading: pagesLoading, refetch: refetchPages } = useQuery(
    'pages',
    async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/facebook/pages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message)
      }
      return data
    },
    {
      enabled: !!user,
    }
  )

  const handlePageToggle = async (pageId, botEnabled) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/facebook/toggle-bot/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ botEnabled })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`تم ${botEnabled ? 'تفعيل' : 'إيقاف'} البوت بنجاح`)
        refetchPages()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Toggle bot error:', error)
      toast.error('حدث خطأ في تحديث إعدادات البوت')
    }
  }

  if (!user) {
    return <LoadingSpinner />
  }

  const pages = pagesData?.pages || []

  return (
    <>
      <Head>
        <title>إدارة الصفحات - بوت فيسبوك وماسنجر</title>
      </Head>

      <Layout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              إدارة الصفحات
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة صفحات فيسبوك المربوطة مع البوت
            </p>
          </div>

          {/* Pages List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  الصفحات المربوطة
                </h2>
                <button
                  onClick={() => router.push('/pages/connect')}
                  className="btn-primary"
                >
                  ربط صفحة جديدة
                </button>
              </div>
            </div>

            <div className="p-6">
              {pagesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="large" />
                </div>
              ) : pages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    لا توجد صفحات مربوطة
                  </h3>
                  <p className="text-gray-500 mb-6">
                    ابدأ بربط صفحة فيسبوك لإدارة البوت
                  </p>
                  <button
                    onClick={() => router.push('/pages/connect')}
                    className="btn-primary"
                  >
                    ربط صفحة جديدة
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pages.map((page) => (
                    <div key={page._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {page.pageName}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            ID: {page.pageId}
                          </p>
                          
                          <div className="flex items-center space-x-2 space-x-reverse mb-4">
                            <span className={`badge ${page.botEnabled ? 'badge-success' : 'badge-warning'}`}>
                              {page.botEnabled ? 'نشط' : 'غير نشط'}
                            </span>
                            <span className={`badge ${page.isActive ? 'badge-success' : 'badge-danger'}`}>
                              {page.isActive ? 'مربوط' : 'غير مربوط'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handlePageToggle(page.pageId, !page.botEnabled)}
                            disabled={!page.isActive}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                              page.botEnabled
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {page.botEnabled ? 'إيقاف البوت' : 'تفعيل البوت'}
                          </button>

                          <button
                            onClick={() => router.push(`/pages/${page.pageId}/settings`)}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200"
                          >
                            الإعدادات
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}