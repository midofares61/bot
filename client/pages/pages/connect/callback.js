// client/pages/pages/connect/callback.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function ConnectCallback() {
  const [status, setStatus] = useState('processing')
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { code, error } = router.query

        if (error) {
          console.error('Facebook OAuth error:', error)
          toast.error('حدث خطأ في ربط الصفحة')
          setStatus('error')
          setTimeout(() => router.push('/pages'), 3000)
          return
        }

        if (!code) {
          console.error('No authorization code received')
          toast.error('لم يتم استلام رمز التفويض')
          setStatus('error')
          setTimeout(() => router.push('/pages'), 3000)
          return
        }

        // Send code to backend to exchange for access token and get pages
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/facebook/oauth-callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ code })
        })

        const data = await response.json()

        if (data.success) {
          toast.success('تم ربط الصفحة بنجاح!')
          setStatus('success')
          setTimeout(() => router.push('/pages'), 2000)
        } else {
          console.error('Backend error:', data.message)
          toast.error(data.message || 'حدث خطأ في ربط الصفحة')
          setStatus('error')
          setTimeout(() => router.push('/pages'), 3000)
        }
      } catch (error) {
        console.error('Callback error:', error)
        toast.error('حدث خطأ في معالجة الاستجابة')
        setStatus('error')
        setTimeout(() => router.push('/pages'), 3000)
      }
    }

    if (router.isReady) {
      handleCallback()
    }
  }, [router])

  return (
    <>
      <Head>
        <title>معالجة ربط الصفحة - بوت فيسبوك وماسنجر</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="text-blue-600 text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                جاري معالجة ربط الصفحة
              </h2>
              <p className="text-gray-600 mb-6">
                يرجى الانتظار بينما نقوم بمعالجة طلب ربط الصفحة...
              </p>
              <LoadingSpinner size="large" />
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                تم ربط الصفحة بنجاح!
              </h2>
              <p className="text-gray-600 mb-6">
                تم ربط الصفحة بنجاح. سيتم توجيهك إلى صفحة إدارة الصفحات...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-red-600 text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                حدث خطأ في ربط الصفحة
              </h2>
              <p className="text-gray-600 mb-6">
                لم يتم ربط الصفحة بنجاح. سيتم توجيهك إلى صفحة إدارة الصفحات...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
