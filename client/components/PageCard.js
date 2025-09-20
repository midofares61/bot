import { useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

export function PageCard({ page, onToggle }) {
  const [isToggling, setIsToggling] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setIsToggling(true)
    try {
      await onToggle(page.pageId, !page.botEnabled)
    } catch (error) {
      console.error('Toggle error:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleSettings = () => {
    router.push(`/pages/${page.pageId}/settings`)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {page.pageName}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            ID: {page.pageId}
          </p>
          
          <div className="flex items-center space-x-2 space-x-reverse mb-4">
            <span className={`badge ${page.botEnabled ? 'badge-success' : 'badge-warning'}`}>
              {page.botEnabled ? 'نشط' : 'غير نشط'}
            </span>
            <span className={`badge ${page.isActive ? 'badge-success' : 'badge-danger'}`}>
              {page.isActive ? 'مربوط' : 'غير مربوط'}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <button
            onClick={handleToggle}
            disabled={isToggling || !page.isActive}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
              page.botEnabled
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isToggling ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current ml-1"></div>
                جاري...
              </div>
            ) : page.botEnabled ? (
              'إيقاف البوت'
            ) : (
              'تفعيل البوت'
            )}
          </button>

          <button
            onClick={handleSettings}
            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200"
          >
            الإعدادات
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>تاريخ الربط:</span>
          <span>{new Date(page.createdAt).toLocaleDateString('ar-SA')}</span>
        </div>
      </div>
    </div>
  )
}
