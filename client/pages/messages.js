// client/pages/messages.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

export default function Messages() {
  const [user, setUser] = useState(null)
  const [selectedPage, setSelectedPage] = useState('')
  const [activeTab, setActiveTab] = useState('unread')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
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

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading, refetch: refetchConversations } = useQuery(
    ['conversations', selectedPage, activeTab, searchTerm],
    async () => {
      if (!selectedPage) return null
      
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      params.append('status', activeTab)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`http://localhost:5000/api/messenger/conversations/${selectedPage}?${params}`, {
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

  // Fetch conversation messages
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useQuery(
    ['messages', selectedConversation],
    async () => {
      if (!selectedConversation) return null
      
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/messenger/messages/${selectedConversation}`, {
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
      enabled: !!selectedConversation,
    }
  )

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/messenger/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          message: newMessage.trim()
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('تم إرسال الرسالة')
        setNewMessage('')
        refetchMessages()
        refetchConversations()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('حدث خطأ في إرسال الرسالة')
    }
  }

  const handleMarkAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/messenger/mark-read/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        refetchConversations()
        refetchMessages()
      }
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  const handleMarkAsUnread = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/messenger/mark-unread/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        refetchConversations()
        refetchMessages()
      }
    } catch (error) {
      console.error('Mark as unread error:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'unread': 'badge-danger',
      'read': 'badge-success',
      'replied': 'badge-info',
      'archived': 'badge-warning'
    }
    return colors[status] || 'badge-info'
  }

  const getStatusText = (status) => {
    const texts = {
      'unread': 'غير مقروءة',
      'read': 'مقروءة',
      'replied': 'تم الرد',
      'archived': 'مؤرشفة'
    }
    return texts[status] || status
  }

  if (!user) {
    return <LoadingSpinner />
  }

  const pages = pagesData?.pages || []
  const conversations = conversationsData?.conversations || []
  const messages = messagesData?.messages || []

  return (
    <>
      <Head>
        <title>إدارة الرسائل - بوت فيسبوك وماسنجر</title>
      </Head>

      <Layout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              إدارة الرسائل
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة رسائل الماسنجر والردود التلقائية
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
                  onChange={(e) => {
                    setSelectedPage(e.target.value)
                    setSelectedConversation(null)
                  }}
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
                  البحث في المحادثات
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  placeholder="ابحث في المحادثات"
                />
              </div>
            </div>
          </div>

          {selectedPage && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversations List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">المحادثات</h3>
                      <div className="flex space-x-2 space-x-reverse">
                        {[
                          { id: 'unread', name: 'غير مقروءة', count: conversations.filter(c => c.status === 'unread').length },
                          { id: 'read', name: 'مقروءة', count: conversations.filter(c => c.status === 'read').length },
                          { id: 'replied', name: 'تم الرد', count: conversations.filter(c => c.status === 'replied').length },
                          { id: 'archived', name: 'مؤرشفة', count: conversations.filter(c => c.status === 'archived').length }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-2 py-1 text-xs rounded-full ${
                              activeTab === tab.id
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {tab.name} ({tab.count})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {conversationsLoading ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner />
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-2">💬</div>
                        <p className="text-gray-500">لا توجد محادثات</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {conversations.map((conversation) => (
                          <div
                            key={conversation._id}
                            onClick={() => {
                              setSelectedConversation(conversation._id)
                              if (conversation.status === 'unread') {
                                handleMarkAsRead(conversation._id)
                              }
                            }}
                            className={`p-4 cursor-pointer hover:bg-gray-50 border-r-4 ${
                              selectedConversation === conversation._id
                                ? 'bg-blue-50 border-blue-500'
                                : 'border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {conversation.userName || 'مستخدم غير معروف'}
                                </h4>
                                <p className="text-xs text-gray-500 truncate">
                                  {conversation.lastMessage}
                                </p>
                                <div className="flex items-center space-x-2 space-x-reverse mt-1">
                                  <span className={`badge ${getStatusColor(conversation.status)}`}>
                                    {getStatusText(conversation.status)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(conversation.updatedAt).toLocaleDateString('ar-SA')}
                                  </span>
                                </div>
                              </div>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="lg:col-span-2">
                {selectedConversation ? (
                  <div className="bg-white rounded-lg shadow-sm h-96 flex flex-col">
                    {/* Messages Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {conversations.find(c => c._id === selectedConversation)?.userName || 'محادثة'}
                        </h3>
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleMarkAsUnread(selectedConversation)}
                            className="btn-secondary text-sm"
                          >
                            وضع علامة غير مقروءة
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messagesLoading ? (
                        <div className="flex justify-center py-8">
                          <LoadingSpinner />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-gray-400 text-4xl mb-2">💬</div>
                          <p className="text-gray-500">لا توجد رسائل في هذه المحادثة</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message._id}
                            className={`flex ${message.sender === 'bot' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender === 'bot'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender === 'bot' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {new Date(message.timestamp).toLocaleString('ar-SA')}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex space-x-2 space-x-reverse">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="input-field flex-1"
                          placeholder="اكتب رسالتك..."
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          إرسال
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-400 text-6xl mb-4">💬</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        اختر محادثة
                      </h3>
                      <p className="text-gray-500">
                        اختر محادثة من القائمة لعرض الرسائل
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedPage && pages.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  اختر صفحة لإدارة الرسائل
                </h3>
                <p className="text-gray-500 mb-6">
                  اختر صفحة من القائمة أعلاه لإدارة رسائلها
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
                  ابدأ بربط صفحة فيسبوك لإدارة الرسائل
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