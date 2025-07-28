import { useState, useEffect } from 'react'
import { createFeedback, getBoards } from '../api'
import { useNavigate } from 'react-router-dom'

export default function CreateFeedback() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    board: '',
    priority: 'medium',
    tags: ''
  })
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      const boardsData = await getBoards()
      setBoards(boardsData)
      // Auto-select first board if available
      if (boardsData.length > 0) {
        setFormData(prev => ({ ...prev, board: boardsData[0].id }))
      }
    } catch (error) {
      // console.error('Error fetching boards:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const tagList = formData.tags.split(',').map(t => t.trim()).filter(t => t)
      
      const feedbackData = { 
        title: formData.title, 
        content: formData.content,
        board: parseInt(formData.board),
        priority: formData.priority,
        tags: tagList
      }
      
      // // console.log('Sending feedback data:', feedbackData)
      
      await createFeedback(feedbackData)
      navigate('/feedback')
    } catch (err) {
      // console.error('Create feedback error:', err.response?.data)
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to create feedback'
      
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create New Feedback</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          {/* Board Selection */}
          <div>
            <label htmlFor="board" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Board *
            </label>
            <select
              id="board"
              name="board"
              value={formData.board}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a board</option>
              {boards.map(board => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input 
              id="title"
              name="title"
              type="text"
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Enter feedback title" 
              required 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
            />
          </div>
          
          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea 
              id="content"
              name="content"
              value={formData.content} 
              onChange={handleChange} 
              placeholder="Describe your feedback in detail" 
              required 
              rows={6}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none" 
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (optional)
            </label>
            <input 
              id="tags"
              name="tags"
              type="text"
              value={formData.tags} 
              onChange={handleChange} 
              placeholder="feature, bug, improvement (comma separated)" 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Separate multiple tags with commas
            </p>
          </div>
          
          {/* Submit Button */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Create Feedback'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/feedback')}
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