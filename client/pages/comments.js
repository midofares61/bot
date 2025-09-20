// client/pages/comments.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

export default function Comments() {
  const [user, setUser] = useState(null)
  const [selectedPage, setSelectedPage] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
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

  // Fetch comments
  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useQuery(
    ['comments', selectedPage, activeTab, searchTerm],
    async () => {
      if (!selectedPage) return null
      
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      params.append('status', activeTab)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`http://localhost:5000/api/comments/${selectedPage}?${params}`, {
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

  const handleApproveComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/comments/approve/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        toast.success('تم الموافقة على الكومنت')
        refetchComments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Approve comment error:', error)
      toast.error('حدث خطأ في الموافقة على الكومنت')
    }
  }

  const handleRejectComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/comments/reject/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        toast.success('تم رفض الكومنت')
        refetchComments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Reject comment error:', error)
      toast.error('حدث خطأ في رفض الكومنت')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/comments/delete/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        toast.success('تم حذف الكومنت')
        refetchComments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Delete comment error:', error)
      toast.error('حدث خطأ في حذف الكومنت')
    }
  }

  const handleReplyToComment = async (commentId, replyText) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/comments/reply/${commentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('تم إرسال الرد')
        refetchComments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Reply to comment error:', error)
      toast.error('حدث خطأ في إرسال الرد')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'badge-warning',
      'approved': 'badge-success',
      'rejected': 'badge-danger',
      'deleted': 'badge-info'
    }
    return colors[status] || 'badge-info'
  }

  const getStatusText = (status) => {
    const texts = {
      'pending': 'في الانتظار',
      'approved': 'موافق عليه',
      'rejected': 'مرفوض',
      'deleted': 'محذوف'
    }
    return texts[status] || status
  }

  if (!user) {
    return <LoadingSpinner />
  }

  const pages = pagesData?.pages || []
  const comments = commentsData?.comments || []

  return (
    <>
      <Head>
        <title>إدارة الكومنتات - بوت فيسبوك وماسنجر</title>
      </Head>

      <Layout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              إدارة الكومنتات
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة كومنتات فيسبوك والردود التلقائية
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">فلترة البيانات</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  البحث في الكومنتات
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  placeholder="ابحث في محتوى الكومنتات"
                />
              </div>
            </div>
          </div>

          {selectedPage && (
            <>
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 space-x-reverse px-6">
                    {[
                      { id: 'pending', name: 'في الانتظار', count: comments.filter(c => c.status === 'pending').length },
                      { id: 'approved', name: 'موافق عليها', count: comments.filter(c => c.status === 'approved').length },
                      { id: 'rejected', name: 'مرفوضة', count: comments.filter(c => c.status === 'rejected').length },
                      { id: 'deleted', name: 'محذوفة', count: comments.filter(c => c.status === 'deleted').length }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.name}
                        <span className="mr-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {commentsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="large" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">💭</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        لا توجد كومنتات
                      </h3>
                      <p className="text-gray-500">
                        لا توجد كومنتات في هذه الفئة حالياً
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                <span className="font-medium text-gray-900">
                                  {comment.userName || 'مستخدم غير معروف'}
                                </span>
                                <span className={`badge ${getStatusColor(comment.status)}`}>
                                  {getStatusText(comment.status)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(comment.createdAt).toLocaleString('ar-SA')}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 mb-3">{comment.content}</p>
                              
                              {comment.reply && (
                                <div className="bg-blue-50 border-r-4 border-blue-400 p-3 mb-3">
                                  <p className="text-sm text-blue-800">
                                    <strong>الرد:</strong> {comment.reply}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center space-x-2 space-x-reverse">
                                {activeTab === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveComment(comment._id)}
                                      className="btn-success text-sm"
                                    >
                                      موافقة
                                    </button>
                                    <button
                                      onClick={() => handleRejectComment(comment._id)}
                                      className="btn-danger text-sm"
                                    >
                                      رفض
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment._id)}
                                      className="btn-secondary text-sm"
                                    >
                                      حذف
                                    </button>
                                  </>
                                )}
                                
                                {activeTab === 'approved' && (
                                  <button
                                    onClick={() => {
                                      const reply = prompt('أدخل الرد على الكومنت:')
                                      if (reply && reply.trim()) {
                                        handleReplyToComment(comment._id, reply.trim())
                                      }
                                    }}
                                    className="btn-primary text-sm"
                                  >
                                    رد
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 text-lg">⏳</span>
                      </div>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">في الانتظار</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {comments.filter(c => c.status === 'pending').length}
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
                      <p className="text-sm font-medium text-gray-500">موافق عليها</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {comments.filter(c => c.status === 'approved').length}
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
                      <p className="text-sm font-medium text-gray-500">مرفوضة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {comments.filter(c => c.status === 'rejected').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600 text-lg">🗑️</span>
                      </div>
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-500">محذوفة</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {comments.filter(c => c.status === 'deleted').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {!selectedPage && pages.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  اختر صفحة لإدارة الكومنتات
                </h3>
                <p className="text-gray-500 mb-6">
                  اختر صفحة من القائمة أعلاه لإدارة كومنتاتها
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
                  ابدأ بربط صفحة فيسبوك لإدارة الكومنتات
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