import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { LoadingSpinner } from './LoadingSpinner'

export function Layout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    setIsLoading(true)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const navigation = [
    { name: 'لوحة التحكم', href: '/dashboard', icon: '🏠' },
    { name: 'الصفحات', href: '/pages', icon: '📄' },
    { name: 'الرسائل', href: '/messages', icon: '💬' },
    { name: 'الكومنتات', href: '/comments', icon: '💭' },
    { name: 'المستخدمين المحظورين', href: '/blocked-users', icon: '🚫' },
    { name: 'التقارير', href: '/reports', icon: '📊' },
    { name: 'الإعدادات', href: '/settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">بوت فيسبوك</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="ml-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {user?.profilePicture ? (
                <img
                  className="w-8 h-8 rounded-full"
                  src={user.profilePicture}
                  alt={user.name}
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="mr-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('ar-SA')}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
