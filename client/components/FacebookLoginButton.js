// client/components/FacebookLoginButton.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

export function FacebookLoginButton({ onSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFacebookLogin = () => {
    setIsLoading(true)

    // التحقق من وجود FB SDK
    if (typeof window === 'undefined') {
      toast.error('بيئة المتصفح غير متاحة')
      setIsLoading(false)
      return
    }

    // إذا لم يكن FB SDK متاحاً، انتظر تحميله
    if (!window.FB || !window.__FB_INIT_DONE) {
      let attempts = 0
      const maxAttempts = 20 // محاولات كافية لانتظار تحميل SDK
      const checkInterval = setInterval(() => {
        attempts++
        if (window.FB && window.__FB_INIT_DONE) {
          clearInterval(checkInterval)
          proceedWithLogin()
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval)
          toast.error('فيسبوك SDK غير متاح، حاول تحديث الصفحة')
          setIsLoading(false)
        }
      }, 200) // التحقق كل 200 ميلي ثانية
      return
    }

    // إذا كان FB SDK متاحاً، استمر في تسجيل الدخول
    proceedWithLogin()

    function proceedWithLogin() {
      // التحقق من وجود معرف تطبيق فيسبوك
      if (!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
        toast.error('معرف تطبيق فيسبوك غير محدد. يرجى التأكد من إعدادات التطبيق.')
        setIsLoading(false)
        return
      }
      
      // التحقق من نطاق العمل
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      if (!isLocalhost && window.location.protocol !== 'https:') {
        toast.error('يجب استخدام HTTPS لتسجيل الدخول عبر فيسبوك خارج بيئة اللوكال')
        setIsLoading(false)
        return
      }
      
      // إذا كنا على اللوكال، أضف معلمة "useLocal" إلى استدعاء FB.login
      const loginOptions = {
        scope: 'pages_manage_metadata,pages_read_engagement,pages_manage_posts',
        return_scopes: true,
        ...(isLocalhost && { useLocal: true })
      }

      // تأكد من أن FB.init قد تم استدعاؤه
      setTimeout(() => {
        window.FB.login((response) => {
        console.log('Facebook login response:', response)

        if (response.authResponse) {
          // استخدم متغير البيئة
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

          fetch(`${apiUrl}/auth/facebook`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessToken: response.authResponse.accessToken
            })
          })
          .then(res => res.json())
          .then(data => {
            console.log('Backend response:', data)
            if (data.success) {
              localStorage.setItem('token', data.token)
              localStorage.setItem('user', JSON.stringify(data.user))
              toast.success('تم تسجيل الدخول بنجاح!')
              onSuccess(data.user)
            } else {
              toast.error(data.message || 'فشل في تسجيل الدخول')
            }
          })
          .catch(error => {
            console.error('Login error:', error)
            toast.error('حدث خطأ في تسجيل الدخول')
          })
          .finally(() => {
            setIsLoading(false)
          })
        } else {
          setIsLoading(false)
          toast.error('فشل في تسجيل الدخول')
        }
      }, loginOptions)
      }, 500) // تأخير 500 ميلي ثانية
    }
  }

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-facebook-500 hover:bg-facebook-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-facebook-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          جاري التحميل...
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          تسجيل الدخول بـ Facebook
        </div>
      )}
    </button>
  )
}
