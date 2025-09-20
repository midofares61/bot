// client/pages/pages/[pageId]/settings.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Layout } from '../../../components/Layout'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'

export default function PageSettings() {
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState({
    welcomeMessage: '',
    autoReplyMessage: '',
    commentAutoReply: '',
    badWords: [],
    autoDeleteBadComments: true,
    newBadWord: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { pageId } = router.query

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  // Fetch page settings
  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = useQuery(
    ['pageSettings', pageId],
    async () => {
      if (!pageId) return null
      
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/facebook/settings/${pageId}`, {
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
      enabled: !!pageId && !!user,
    }
  )

  // Fetch page info
  const { data: pageData, isLoading: pageLoading } = useQuery(
    ['pageInfo', pageId],
    async () => {
      if (!pageId) return null
      
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
      return data.pages.find(page => page.pageId === pageId)
    },
    {
      enabled: !!pageId && !!user,
    }
  )

  useEffect(() => {
    if (settingsData?.settings) {
      setSettings({
        welcomeMessage: settingsData.settings.welcomeMessage || '',
        autoReplyMessage: settingsData.settings.autoReplyMessage || '',
        commentAutoReply: settingsData.settings.commentAutoReply || '',
        badWords: settingsData.settings.badWords || [],
        autoDeleteBadComments: settingsData.settings.autoDeleteBadComments !== false,
        newBadWord: ''
      })
    }
  }, [settingsData])

  const handleSaveSettings = async () => {
    if (!pageId) return

    setIsLoading(true)
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
        refetchSettings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Save settings error:', error)
      toast.error('حدث خطأ في حفظ الإعدادات')
    } finally {
      setIsLoading(false)
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

  if (pageLoading || settingsLoading) {
    return <LoadingSpinner />
  }

  if (!pageData) {
    return (
      <Layout user={user}>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            الصفحة غير موجودة
          </h3>
          <p className="text-gray-500 mb-6">
            الصفحة المطلوبة غير موجودة أو لا تملك صلاحية الوصول إليها
          </p>
          <button
            onClick={() => router.push('/pages')}
            className="btn-primary"
          >
            العودة للصفحات
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>إعدادات {pageData.pageName} - بوت فيسبوك وماسنجر</title>
      </Head>

      <Layout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  إعدادات {pageData.pageName}
                </h1>
                <p className="text-gray-600 mt-2">
                  إعدادات البوت والرسائل والفلترة لهذه الصفحة
                </p>
              </div>
              <button
                onClick={() => router.push('/pages')}
                className="btn-secondary"
              >
                العودة للصفحات
              </button>
            </div>
          </div>

          {/* Settings Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">إعدادات الرسائل</h3>
            
            <div className="space-y-6">
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
                <p className="text-xs text-gray-500 mt-1">
                  ستظهر هذه الرسالة عند بدء محادثة جديدة
                </p>
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
                <p className="text-xs text-gray-500 mt-1">
                  ستظهر هذه الرسالة كرد تلقائي على الرسائل
                </p>
              </div>

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
                <p className="text-xs text-gray-500 mt-1">
                  ستظهر هذه الرسالة كرد تلقائي على الكومنتات
                </p>
              </div>
            </div>
          </div>

          {/* Filtering Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">إعدادات الفلترة</h3>
            
            <div className="space-y-6">
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
                
                {settings.badWords.length > 0 && (
                  <div className="mt-4">
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
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </div>
      </Layout>
    </>
  )
}
