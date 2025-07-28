import { useEffect, useState } from 'react'
import { getFeedbackList } from '../api'
import { Link } from 'react-router-dom'
import FeedbackKanban from '../components/FeedbackKanban'
import FeedbackTable from '../components/FeedbackTable'

export default function FeedbackList() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('table') // 'table' or 'kanban'
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    ordering: '-created_at' // Django REST ordering format
  })

  const statusOptions = ['open', 'in_progress', 'under_review', 'completed', 'rejected']

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      const data = await getFeedbackList(filters)
      setFeedback(data)
    } catch (error) {
      // console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleFeedbackUpdate = (updatedFeedback) => {
    setFeedback(updatedFeedback)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feedback</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track customer feedback
          </p>
        </div>
        <Link
          to="/create-feedback"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Create Feedback
        </Link>
      </div>

      {/* View Toggle & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* View Toggle */}
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === 'table' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === 'kanban' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Kanban Board
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search feedback..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={filters.ordering}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="-upvote_count">Most Voted</option>
              <option value="upvote_count">Least Voted</option>
              <option value="title">Title A-Z</option>
              <option value="-title">Title Z-A</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Showing {feedback.length} feedback items
        </div>
      </div>

      {/* Content */}
      {view === 'table' ? (
        <FeedbackTable feedback={feedback} onUpdate={handleFeedbackUpdate} />
      ) : (
        <FeedbackKanban feedback={feedback} onUpdate={handleFeedbackUpdate} />
      )}
    </div>
  )
}