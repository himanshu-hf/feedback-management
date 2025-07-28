import { useEffect, useState } from 'react'
import { updateFeedback } from '../api'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function FeedbackKanban({ feedback, onUpdate }) {
  const { user } = useAuth()
  const [columns, setColumns] = useState({
    open: [],
    in_progress: [],
    under_review: [],
    completed: [],
    rejected: []
  })
  const [draggedItem, setDraggedItem] = useState(null)
  const [draggedOver, setDraggedOver] = useState(null)

  // Check if current user can edit a feedback item
  const canEditFeedback = (item) => {
    if (!user) return false
    
    // Authors, admins, and moderators can edit
    return (
      user.id === item.author || 
      user.role === 'admin' || 
      user.role === 'moderator'
    )
  }

    const statusLabels = {
    open: 'Open',
    in_progress: 'In Progress', 
    under_review: 'Under Review',
    completed: 'Completed',
    rejected: 'Rejected'
  }

  const columnColors = {
    open: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
    in_progress: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800',
    under_review: 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800',
    completed: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
    rejected: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
  }

  useEffect(() => {
    if (feedback) {
      const grouped = {
        open: [],
        in_progress: [],
        under_review: [],
        completed: [],
        rejected: []
      }
      
      feedback.forEach(item => {
        if (grouped[item.status]) {
          grouped[item.status].push(item)
        } else {
          // Default to open if status is not recognized
          grouped.open.push(item)
        }
      })
      
      // // console.log('Grouping feedback by status:', grouped)
      setColumns(grouped)
    }
  }, [feedback])

  const handleDragStart = (e, item) => {
    // Check if user can edit this feedback
    if (!canEditFeedback(item)) {
      e.preventDefault()
      alert('You can only update feedback that you created, or you need Admin/Moderator role.')
      return
    }
    
    // // console.log('Drag started:', item.title)
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id.toString())
    
    // Add some visual feedback
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    // // console.log('Drag ended')
    e.target.style.opacity = '1'
    setDraggedItem(null)
    setDraggedOver(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e, status) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedItem && draggedItem.status !== status) {
      setDraggedOver(status)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only clear if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDraggedOver(null)
    }
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedOver(null)
    
    if (!draggedItem) {
      // // console.log('No dragged item found')
      return
    }
    
    // // console.log('Dropping item:', draggedItem.title, 'to status:', newStatus)
    
    // Don't update if it's the same status
    if (draggedItem.status === newStatus) {
      // // console.log('Same status, no update needed')
      setDraggedItem(null)
      return
    }
    
    // Optimistic update - update UI immediately
    const updatedItem = { ...draggedItem, status: newStatus }
    
    setColumns(prev => {
      const newColumns = { ...prev }
      
      // Remove from old column
      newColumns[draggedItem.status] = newColumns[draggedItem.status].filter(f => f.id !== draggedItem.id)
      
      // Add to new column
      newColumns[newStatus] = [...newColumns[newStatus], updatedItem]
      
      return newColumns
    })

    try {
      // // console.log('Updating feedback status via API...')
      // Update status via API
      await updateFeedback(draggedItem.id, { status: newStatus })
      
      // Notify parent component
      if (onUpdate) {
        const updatedFeedback = feedback.map(f => 
          f.id === draggedItem.id ? updatedItem : f
        )
        onUpdate(updatedFeedback)
      }
      
      // // console.log('Status updated successfully')
    } catch (error) {
      // console.error('Failed to update feedback status:', error)
      
      // Show user-friendly error message
      if (error.response?.status === 403) {
        alert('Permission denied: You can only update feedback that you created, or you need Admin/Moderator role to update any feedback.')
      } else if (error.response?.status === 404) {
        alert('Feedback not found.')
      } else {
        alert('Failed to update feedback status. Please try again.')
      }
      
      // Revert optimistic update on error
      setColumns(prev => {
        const newColumns = { ...prev }
        
        // Remove from new column
        newColumns[newStatus] = newColumns[newStatus].filter(f => f.id !== draggedItem.id)
        
        // Add back to old column
        newColumns[draggedItem.status] = [...newColumns[draggedItem.status], draggedItem]
        
        return newColumns
      })
    }
    
    setDraggedItem(null)
  }

  const FeedbackCard = ({ item }) => {
    const canEdit = canEditFeedback(item)
    
    const handleCardDragStart = (e) => {
      e.stopPropagation()
      handleDragStart(e, item)
    }

    const handleCardDragEnd = (e) => {
      e.stopPropagation()
      handleDragEnd(e)
    }

    const handleLinkClick = (e) => {
      // Prevent navigation if we're in the middle of a drag operation
      if (draggedItem) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    return (
      <div
        draggable={canEdit}
        onDragStart={handleCardDragStart}
        onDragEnd={handleCardDragEnd}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3 transition-all duration-200 select-none relative ${
          canEdit 
            ? 'cursor-move hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600' 
            : 'cursor-default opacity-75'
        }`}
        style={{ userSelect: 'none' }}
        title={canEdit ? 'Drag to change status' : 'You can only edit your own feedback (or have Admin/Moderator role)'}
      >
        {!canEdit && (
          <div className="absolute top-2 right-2">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <div onClick={handleLinkClick}>
          <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white hover:text-blue-600">
            <Link to={`/feedback/${item.id}`} className="no-underline">
              {item.title}
            </Link>
          </h4>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {item.content?.substring(0, 100)}...
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0014.56 8H7.333a2 2 0 00-1.147.333L6 8.667z"/>
              </svg>
              {item.upvote_count || 0}
            </div>
            {item.priority && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                item.priority === 'high' ? 'bg-red-100 text-red-800' :
                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {item.priority}
              </span>
            )}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {new Date(item.created_at).toLocaleDateString()}
          </div>
        </div>
        
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                +{item.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-96">
        {Object.entries(columns).map(([status, items]) => (
          <div key={status} className="flex flex-col">
            <div className={`rounded-lg border-2 border-dashed p-4 transition-all duration-200 ${columnColors[status]} ${
              draggedOver === status ? 'border-solid shadow-lg scale-105' : ''
            }`}>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
                {statusLabels[status]}
                <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                  {items.length}
                </span>
              </h3>
              
              <div
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
                className={`min-h-64 space-y-2 transition-all duration-200 ${
                  draggedOver === status ? 'bg-opacity-50' : ''
                }`}
              >
                {items.map(item => (
                  <FeedbackCard key={item.id} item={item} />
                ))}
                
                {items.length === 0 && (
                  <div className={`text-center text-sm py-8 transition-all duration-200 ${
                    draggedOver === status 
                      ? 'text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {draggedOver === status ? 'Drop here to update status' : 'Drop feedback here'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}