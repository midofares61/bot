// client/pages/blocked-users.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

export default function BlockedUsers() {
  const [user, setUser] = useState(null)
  const [selectedPage, setSelectedPage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterReason, setFilterReason] = useState('')
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
      const response = await fetch('http://localhost:5000/api/facebook/pages', {
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

  // Fetch blocked users
  const { data: blockedUsersData, isLoading: blockedUsersLoading, refetch: refetchBlockedUsers } = useQuery(
    ['blockedUsers', selectedPage, searchTerm, filterReason],
    async () => {
      if (!selectedPage) return null
      
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterReason) params.append('reason', filterReason)
      
      const response = await fetch(`http://localhost:5000/api/blocked-users/${selectedPage}?${params}`, {
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

  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/blocked-users/unblock/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        toast.success('تم إلغاء حظر المستخدم بنجاح')
        refetchBlockedUsers()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Unblock user error:', error)
      toast.error('حدث خطأ في إلغاء حظر المستخدم')
    }
  }

  const handleBlockUser = async (userId, userName, reason) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/blocked-users/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          userName,
          pageId: selectedPage,
          reason
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('تم حظر المستخدم بنجاح')
        refetchBlockedUsers()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Block user error:', error)
      toast.error('حدث خطأ في حظر المستخدم')
    }
  }

  const getReasonText = (reason) => {
    const reasons = {
      'angry_reaction': 'تفاعل غاضب',
      'bad_comment': 'كومنت مسيء',
      'manual_block': 'حظر يدوي'
    }
    return reasons[reason] || reason
  }

  const getReasonColor = (reason) => {
    const colors = {
      'angry_reaction': 'badge-warning',
      'bad_comment': 'badge-danger',
      'manual_block': 'badge-info'
    }
    return colors[reason] || 'badge-info'
  }

  if (!user) {
    return <LoadingSpinner />
  }

  const pages = pagesData?.pages || []
  const blockedUsers = blockedUsersData?.blockedUsers || []

  return (
    <>
      <Head>
        <title>المستخدمين المحظورين - بوت فيسبوك وماسنجر</title>
      </Head>

      <Layout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              المستخدمين المحظورين
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة قائمة المستخدمين المحظورين
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
                  البحث عن مستخدم
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  placeholder="اسم المستخدم أو ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سبب الحظر
                </label>
                <select
                  value={filterReason}
                  onChange={(e) => setFilterReason(e.target.value)}
                  className="input-field"
                >
                  <option value="">جميع الأسباب</option>
                  <option value="angry_reaction">تفاعل غاضب</option>
                  <option value="bad_comment">كومنت مسيء</option>
                  <option value="manual_block">حظر يدوي</option>
                </select>
              </div>
            </div>
          </div>

          {selectedPage && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 text-lg">🚫</span>
                      </div>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">إجمالي المحظورين</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {blockedUsersLoading ? '...' : blockedUsers.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 text-lg">😠</span>
                      </div>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">تفاعلات غاضبة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {blockedUsersLoading ? '...' : blockedUsers.filter(u => u.reason === 'angry_reaction').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 text-lg">💬</span>
                      </div>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">كومنتات مسيئة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {blockedUsersLoading ? '...' : blockedUsers.filter(u => u.reason === 'bad_comment').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blocked Users List */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">قائمة المستخدمين المحظورين</h3>
                </div>

                <div className="p-6">
                  {blockedUsersLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="large" />
                    </div>
                  ) : blockedUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">✅</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        لا توجد مستخدمين محظورين
                      </h3>
                      <p className="text-gray-500">
                        لم يتم حظر أي مستخدمين في هذه الصفحة بعد
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {blockedUsers.map((blockedUser) => (
                        <div key={blockedUser._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {blockedUser.userName?.charAt(0) || '?'}
                                </span>
                              </div>
                            </div>
                            <div className="mr-4">
                              <h4 className="text-lg font-medium text-gray-900">
                                {blockedUser.userName || 'مستخدم غير معروف'}
                              </h4>
                              <p className="text-sm text-gray-500">ID: {blockedUser.userId}</p>
                              <div className="flex items-center space-x-2 space-x-reverse mt-1">
                                <span className={`badge ${getReasonColor(blockedUser.reason)}`}>
                                  {getReasonText(blockedUser.reason)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(blockedUser.blockedAt).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 space-x-reverse">
                            {blockedUser.notes && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {blockedUser.notes}
                              </div>
                            )}
                            <button
                              onClick={() => handleUnblockUser(blockedUser.userId)}
                              className="btn-success text-sm"
                            >
                              إلغاء الحظر
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Block Form */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">حظر مستخدم يدوياً</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID المستخدم
                    </label>
                    <input
                      type="text"
                      id="manualUserId"
                      className="input-field"
                      placeholder="أدخل ID المستخدم"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      id="manualUserName"
                      className="input-field"
                      placeholder="اسم المستخدم (اختياري)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سبب الحظر
                    </label>
                    <select
                      id="manualReason"
                      className="input-field"
                    >
                      <option value="manual_block">حظر يدوي</option>
                      <option value="bad_comment">كومنت مسيء</option>
                      <option value="angry_reaction">تفاعل غاضب</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      const userId = document.getElementById('manualUserId').value
                      const userName = document.getElementById('manualUserName').value
                      const reason = document.getElementById('manualReason').value
                      
                      if (userId.trim()) {
                        handleBlockUser(userId.trim(), userName.trim() || 'مستخدم غير معروف', reason)
                        document.getElementById('manualUserId').value = ''
                        document.getElementById('manualUserName').value = ''
                      } else {
                        toast.error('يرجى إدخال ID المستخدم')
                      }
                    }}
                    className="btn-danger"
                  >
                    حظر المستخدم
                  </button>
                </div>
              </div>
            </>
          )}

          {!selectedPage && pages.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚫</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  اختر صفحة لإدارة المحظورين
                </h3>
                <p className="text-gray-500 mb-6">
                  اختر صفحة من القائمة أعلاه لإدارة المستخدمين المحظورين
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
                  ابدأ بربط صفحة فيسبوك لإدارة المستخدمين المحظورين
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