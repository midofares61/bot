import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Layout } from '../components/Layout'
import { PageCard } from '../components/PageCard'
import { StatsCard } from '../components/StatsCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
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
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'stats',
    async () => {
      const token = localStorage.getItem('token')
      // Get stats from all pages
      const pages = pagesData?.pages || []
      if (pages.length === 0) {
        return { stats: { totalLogs: 0, totalBlocked: 0 } }
      }
      
      // For now, return basic stats
      return { 
        stats: { 
          totalLogs: 0, 
          totalBlocked: 0 
        } 
      }
    },
    {
      enabled: !!user && !!pagesData,
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
  const stats = statsData?.stats || {}

  return (
    <>
      <Head>
        <title>لوحة التحكم - بوت فيسبوك وماسنجر</title>
        <meta name="description" content="لوحة تحكم شاملة لإدارة بوت فيسبوك وماسنجر" />
      </Head>

      <Layout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              مرحباً، {user.name}
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة شاملة لصفحات فيسبوك مع البوت الذكي
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="إجمالي الصفحات"
              value={pages.length}
              icon="📄"
              color="blue"
            />
            <StatsCard
              title="الصفحات النشطة"
              value={pages.filter(p => p.botEnabled).length}
              icon="✅"
              color="green"
            />
            <StatsCard
              title="إجمالي الرسائل"
              value={stats.totalLogs || 0}
              icon="💬"
              color="purple"
            />
            <StatsCard
              title="المستخدمين المحظورين"
              value={stats.totalBlocked || 0}
              icon="��"
              color="red"
            />
          </div>

          {/* Pages Section */}
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
                    <PageCard
                      key={page._id}
                      page={page}
                      onToggle={handlePageToggle}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">الإعدادات</h3>
                  <p className="text-gray-500">تعديل إعدادات البوت والرسائل</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">التقارير</h3>
                  <p className="text-gray-500">عرض التقارير والإحصائيات</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">المستخدمين المحظورين</h3>
                  <p className="text-gray-500">إدارة قائمة المحظورين</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}