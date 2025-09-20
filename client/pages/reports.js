// client/pages/reports.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

export default function Reports() {
  const [user, setUser] = useState(null)
  const [selectedPage, setSelectedPage] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
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
  const { data: pagesData, isLoading: pagesLoading } = useQuery(
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

  // Fetch stats for selected page
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    ['stats', selectedPage, dateRange],
    async () => {
      if (!selectedPage) return null
      
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      
      const response = await fetch(`http://localhost:5000/api/logs/stats/${selectedPage}?${params}`, {
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
      enabled: !!selectedPage,
    }
  )

  // Fetch logs for selected page
  const { data: logsData, isLoading: logsLoading } = useQuery(
    ['logs', selectedPage, dateRange],
    async () => {
      if (!selectedPage) return null
      
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      
      const response = await fetch(`http://localhost:5000/api/logs/${selectedPage}?${params}`, {
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
      enabled: !!selectedPage,
    }
  )

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getLogTypeIcon = (type) => {
    const icons = {
      'comment_reply': '💬',
      'message_sent': '📨',
      'comment_deleted': '🗑️',
      'user_blocked': '🚫',
      'user_unblocked': '✅',
      'webhook_received': '🔗'
    }
    return icons[type] || '📝'
  }

  const getLogTypeName = (type) => {
    const names = {
      'comment_reply': 'رد على كومنت',
      'message_sent': 'رسالة مرسلة',
      'comment_deleted': 'كومنت محذوف',
      'user_blocked': 'مستخدم محظور',
      'user_unblocked': 'مستخدم غير محظور',
      'webhook_received': 'استقبال webhook'
    }
    return names[type] || type
  }

  const getStatusColor = (status) => {
    const colors = {
      'success': 'text-green-600',
      'error': 'text-red-600',
      'pending': 'text-yellow-600'
    }
    return colors[status] || 'text-gray-600'
  }

  if (!user) {
    return <LoadingSpinner />
  }

  const pages = pagesData?.pages || []
  const stats = statsData?.stats || {}
  const logs = logsData?.logs || []

  return (
    <>
      <Head>
        <title>التقارير - بوت فيسبوك وماسنجر</title>
      </Head>

      <Layout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              التقارير والإحصائيات
            </h1>
            <p className="text-gray-600 mt-2">
              عرض التقارير والإحصائيات الشاملة
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">فلترة البيانات</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر الصفحة
                </label>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="input-field"
                >
                  <option value="">اختر صفحة</option>
                  {pages.map((page) => (
                    <option key={page._id} value={page.pageId}>
                      {page.pageName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  من تاريخ
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إلى تاريخ
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => refetchStats()}
                className="btn-primary"
                disabled={!selectedPage}
              >
                تحديث البيانات
              </button>
            </div>
          </div>

          {selectedPage && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📊</span>
                      </div>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">إجمالي الأنشطة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? '...' : stats.totalLogs || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 text-lg">✅</span>
                      </div>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">الأنشطة الناجحة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? '...' : stats.logsByStatus?.find(s => s._id === 'success')?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 text-lg">❌</span>
                      </div>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">الأنشطة الفاشلة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? '...' : stats.logsByStatus?.find(s => s._id === 'error')?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-lg">📈</span>
                      </div>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">معدل النجاح</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? '...' : 
                          stats.totalLogs > 0 
                            ? Math.round((stats.logsByStatus?.find(s => s._id === 'success')?.count || 0) / stats.totalLogs * 100)
                            : 0
                        }%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity by Type */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">الأنشطة حسب النوع</h3>
                
                {statsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="large" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.logsByType?.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-2xl ml-3">{getLogTypeIcon(item._id)}</span>
                          <span className="font-medium text-gray-900">{getLogTypeName(item._id)}</span>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${stats.totalLogs > 0 ? (item.count / stats.totalLogs) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-lg font-bold text-gray-900">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">الأنشطة الأخيرة</h3>
                
                {logsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="large" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📝</div>
                    <p className="text-gray-500">لا توجد أنشطة في الفترة المحددة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-xl ml-3">{getLogTypeIcon(log.type)}</span>
                          <div>
                            <p className="font-medium text-gray-900">{getLogTypeName(log.type)}</p>
                            {log.content && (
                              <p className="text-sm text-gray-500 truncate max-w-md">{log.content}</p>
                            )}
                            {log.userName && (
                              <p className="text-xs text-gray-400">المستخدم: {log.userName}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                            {log.status === 'success' ? 'نجح' : log.status === 'error' ? 'فشل' : 'في الانتظار'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {!selectedPage && pages.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  اختر صفحة لعرض التقارير
                </h3>
                <p className="text-gray-500 mb-6">
                  اختر صفحة من القائمة أعلاه لعرض التقارير والإحصائيات
                </p>
              </div>
            </div>
          )}

          {pages.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لا توجد صفحات مربوطة
                </h3>
                <p className="text-gray-500 mb-6">
                  ابدأ بربط صفحة فيسبوك لعرض التقارير
                </p>
                <button
                  onClick={() => router.push('/pages')}
                  className="btn-primary"
                >
                  إدارة الصفحات
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}