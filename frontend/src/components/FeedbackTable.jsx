import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { updateFeedback } from '../api'

export default function FeedbackTable({ feedback = [], onUpdate }) {
  const [selectedItems, setSelectedItems] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Clear selections when feedback changes
    setSelectedItems([])
  }, [feedback])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(feedback.map(f => f.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const handleBulkStatusUpdate = async (newStatus) => {
    setIsUpdating(true)
    try {
      await Promise.all(
        selectedItems.map(id => 
          updateFeedback(id, { status: newStatus })
        )
      )
      setSelectedItems([])
      // Refresh feedback list if onUpdate callback provided
      if (onUpdate) {
        const updatedFeedback = feedback.map(item => 
          selectedItems.includes(item.id) 
            ? { ...item, status: newStatus }
            : item
        )
        onUpdate(updatedFeedback)
      }
    } catch (error) {
      // console.error('Failed to update feedback status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      under_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.open}`}>
        {status?.replace('_', ' ').toUpperCase() || 'OPEN'}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    if (!priority) return null
    
    const priorityColors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    )
  }

  if (!feedback || feedback.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No feedback found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex gap-2">
              <select
                onChange={(e) => e.target.value && handleBulkStatusUpdate(e.target.value)}
                disabled={isUpdating}
                className="text-sm border border-blue-300 dark:border-blue-600 rounded px-3 py-1 bg-white dark:bg-gray-700"
              >
                <option value="">Update Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="under_review">Under Review</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => setSelectedItems([])}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.length === feedback.length && feedback.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Votes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {feedback.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <Link 
                      to={`/feedback/${item.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {item.title}
                    </Link>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.content?.substring(0, 80)}...
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4">
                  {getPriorityBadge(item.priority)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0014.56 8H7.333a2 2 0 00-1.147.333L6 8.667z"/>
                    </svg>
                    {item.upvote_count || 0}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {item.author_name || 'Anonymous'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link
                    to={`/feedback/${item.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {feedback.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No feedback</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first feedback item.</p>
        </div>
      )}
    </div>
  )
}