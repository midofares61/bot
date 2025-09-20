// client/pages/settings.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    welcomeMessage: 'مرحباً! شكراً لك على التواصل معنا. سنرد عليك قريباً.',
    autoReplyMessage: 'شكراً لك على رسالتك. سنقوم بالرد عليك في أقرب وقت ممكن.',
    commentAutoReply: 'شكراً لك على تعليقك!',
    badWords: [],
    autoDeleteBadComments: true,
    newBadWord: ''
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

  // Fetch pages for settings
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

  const handleSaveSettings = async (pageId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/facebook/settings/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('تم حفظ الإعدادات بنجاح')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Save settings error:', error)
      toast.error('حدث خطأ في حفظ الإعدادات')
    }
  }

  const handleAddBadWord = () => {
    if (settings.newBadWord.trim() && !settings.badWords.includes(settings.newBadWord.trim())) {
      setSettings({
        ...settings,
        badWords: [...settings.badWords, settings.newBadWord.trim()],
        newBadWord: ''
      })
    }
  }

  const handleRemoveBadWord = (word) => {
    setSettings({
      ...settings,
      badWords: settings.badWords.filter(w => w !== word)
    })
  }

  if (!user) {
    return <LoadingSpinner />
  }

  const pages = pagesData?.pages || []

  return (
    <>
      <Head>
        <title>الإعدادات - بوت فيسبوك وماسنجر</title>
      </Head>

      <Layout user={user}>
        <div className="space-y-6" style={{ width: '100%' }}>
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              الإعدادات
            </h1>
            <p className="text-gray-600 mt-2">
              إعدادات البوت والرسائل والفلترة
            </p>
          </div> 

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 space-x-reverse px-6">
                {[
                  { id: 'general', name: 'الإعدادات العامة', icon: '⚙️' },
                  { id: 'messages', name: 'إعدادات الرسائل', icon: '💬' },
                  { id: 'comments', name: 'إعدادات الكومنتات', icon: '💭' },
                  { id: 'filtering', name: 'إعدادات الفلترة', icon: '🛡️' }
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
                    <span className="ml-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">الإعدادات العامة</h3>
                  
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
                        ابدأ بربط صفحة فيسبوك لإدارة الإعدادات
              </p>
              <button
                        onClick={() => router.push('/pages')}
                        className="btn-primary"
                      >
                        إدارة الصفحات
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pages.map((page) => (
                        <div key={page._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{page.pageName}</h4>
                              <p className="text-sm text-gray-500">ID: {page.pageId}</p>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span className={`badge ${page.botEnabled ? 'badge-success' : 'badge-warning'}`}>
                                {page.botEnabled ? 'نشط' : 'غير نشط'}
                              </span>
                              <button
                                onClick={() => router.push(`/pages/${page.pageId}/settings`)}
                                className="btn-primary"
                              >
                                إعدادات الصفحة
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">إعدادات الرسائل</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رسالة الترحيب
                      </label>
                      <textarea
                        value={settings.welcomeMessage}
                        onChange={(e) => setSettings({...settings, welcomeMessage: e.target.value})}
                        className="input-field h-24"
                        placeholder="رسالة الترحيب للمستخدمين الجدد"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رسالة الرد التلقائي
                      </label>
                      <textarea
                        value={settings.autoReplyMessage}
                        onChange={(e) => setSettings({...settings, autoReplyMessage: e.target.value})}
                        className="input-field h-24"
                        placeholder="رسالة الرد التلقائي على الرسائل"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        pages.forEach(page => handleSaveSettings(page.pageId))
                      }}
                      className="btn-primary"
                    >
                      حفظ إعدادات الرسائل
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">إعدادات الكومنتات</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رسالة الرد على الكومنتات
                    </label>
                    <textarea
                      value={settings.commentAutoReply}
                      onChange={(e) => setSettings({...settings, commentAutoReply: e.target.value})}
                      className="input-field h-24"
                      placeholder="رسالة الرد التلقائي على الكومنتات"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoDeleteBadComments"
                      checked={settings.autoDeleteBadComments}
                      onChange={(e) => setSettings({...settings, autoDeleteBadComments: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoDeleteBadComments" className="mr-2 text-sm text-gray-700">
                      حذف الكومنتات المسيئة تلقائياً
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        pages.forEach(page => handleSaveSettings(page.pageId))
                      }}
                      className="btn-primary"
                    >
                      حفظ إعدادات الكومنتات
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'filtering' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">إعدادات الفلترة</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الكلمات المحظورة
                    </label>
                    <div className="flex space-x-2 space-x-reverse">
                      <input
                        type="text"
                        value={settings.newBadWord}
                        onChange={(e) => setSettings({...settings, newBadWord: e.target.value})}
                        className="input-field flex-1"
                        placeholder="أضف كلمة محظورة"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddBadWord()}
                      />
                      <button
                        onClick={handleAddBadWord}
                        className="btn-primary"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>

                  {settings.badWords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">قائمة الكلمات المحظورة:</h4>
                      <div className="flex flex-wrap gap-2">
                        {settings.badWords.map((word, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                          >
                            {word}
                            <button
                              onClick={() => handleRemoveBadWord(word)}
                              className="mr-2 text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        pages.forEach(page => handleSaveSettings(page.pageId))
                      }}
                className="btn-primary"
              >
                      حفظ إعدادات الفلترة
              </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}