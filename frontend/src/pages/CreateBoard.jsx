import { useState } from 'react'
import { createBoard } from '../api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function CreateBoard() {
  const { user, isAdmin, isModerator } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (!user || (!isAdmin && !isModerator)) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
        <p className="text-red-600">You don't have permission to create boards.</p>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await createBoard(formData)
      navigate('/boards')
    } catch (err) {
      // console.error('Create board error:', err)
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to create board'
      
      if (typeof err.response?.data === 'object' && err.response?.data !== null) {
        // Handle validation errors
        const errors = Object.entries(err.response.data).map(([field, messages]) => {
          return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
        }).join('\n')
        setError(errors)
      } else {
        setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create New Board</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Board Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter board name"
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the purpose of this board"
              rows={4}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Make this board public
              </span>
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Public boards can be joined by any user. Private boards require manual member addition.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Create Board'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/boards')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}