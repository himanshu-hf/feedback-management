import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getFeedbackDetails, addComment, voteFeedback, getComments } from '../api'
import { useAuth } from '../contexts/AuthContext'

export default function FeedbackDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [feedback, setFeedback] = useState(null)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [voting, setVoting] = useState(false)

  useEffect(() => { 
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [feedbackData, commentsData] = await Promise.all([
        getFeedbackDetails(id),
        getComments(id)
      ])
      setFeedback(feedbackData)
      setComments(commentsData)
    } catch (err) {
      setError('Failed to load feedback details')
      // console.error('Error fetching feedback:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (voting) return
    
    try {
      setVoting(true)
      const result = await voteFeedback(id)
      setFeedback(prev => ({
        ...prev,
        upvote_count: result.upvotes,
        upvotes: result.action === 'added' 
          ? [...(prev.upvotes || []), user.id]
          : (prev.upvotes || []).filter(uid => uid !== user.id)
      }))
    } catch (err) {
      // console.error('Failed to vote:', err)
    } finally {
      setVoting(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      const newComment = await addComment(id, comment)
      setComments(prev => [...prev, newComment])
      setFeedback(prev => ({
        ...prev,
        comment_count: (prev.comment_count || 0) + 1
      }))
      setComment('')
    } catch (err) {
      // console.error('Failed to add comment:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/feedback" className="text-blue-600 hover:text-blue-800">
          ← Back to Feedback List
        </Link>
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="max-w-xl mx-auto bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Not Found</h2>
        <p className="text-gray-600 mb-4">Feedback item not found</p>
        <Link to="/feedback" className="text-blue-600 hover:text-blue-800">
          ← Back to Feedback List
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/feedback" className="inline-flex items-center text-blue-600 hover:text-blue-800">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Feedback
      </Link>

      {/* Feedback Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{feedback.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Board: {feedback.board_name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              feedback.status === 'open' ? 'bg-blue-100 text-blue-800' :
              feedback.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              feedback.status === 'under_review' ? 'bg-purple-100 text-purple-800' :
              feedback.status === 'completed' ? 'bg-green-100 text-green-800' :
              feedback.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {feedback.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
            </span>
            {feedback.priority && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                feedback.priority === 'high' ? 'bg-red-100 text-red-800' :
                feedback.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {feedback.priority.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
            {feedback.content}
          </p>
        </div>

        {/* Tags */}
        {feedback.tags && feedback.tags.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {feedback.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
          <div className="flex items-center space-x-4">
            <span>By {feedback.author_name || 'Unknown'}</span>
            <span>•</span>
            <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleVote}
              disabled={voting}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                feedback.upvotes && feedback.upvotes.includes(user?.id)
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0014.56 8H7.333a2 2 0 00-1.147.333L6 8.667z"/>
              </svg>
              <span className="font-medium">{feedback.upvote_count || 0}</span>
            </button>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{feedback.comment_count || 0} comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Comments ({comments.length})
        </h3>
        
        {comments.length > 0 ? (
          <div className="space-y-4 mb-6">
            {comments.map(c => (
              <div key={c.id} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {c.author_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{c.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 mb-6">No comments yet. Be the first to comment!</p>
        )}

        {/* Add Comment Form */}
        <form onSubmit={handleComment} className="space-y-3">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add your comment..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="3"
          />
          <button 
            type="submit" 
            disabled={!comment.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add Comment
          </button>
        </form>
      </div>
    </div>
  )
}