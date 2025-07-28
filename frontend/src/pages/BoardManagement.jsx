import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBoards, deleteBoard, joinBoard, leaveBoard } from '../api'
import { useAuth } from '../contexts/AuthContext'

export default function BoardManagement() {
  const { user, isAdmin, isModerator } = useAuth()
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      const boardsData = await getBoards()
      setBoards(boardsData)
    } catch (error) {
      // console.error('Error fetching boards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this board?')) return
    
    setActionLoading(prev => ({ ...prev, [id]: 'deleting' }))
    try {
      await deleteBoard(id)
      setBoards(prev => prev.filter(board => board.id !== id))
    } catch (error) {
      // console.error('Error deleting board:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }))
    }
  }

  const handleJoinLeave = async (board) => {
    const isCurrentlyMember = board.members.includes(user.id)
    const action = isCurrentlyMember ? 'leaving' : 'joining'
    
    setActionLoading(prev => ({ ...prev, [board.id]: action }))
    try {
      if (isCurrentlyMember) {
        await leaveBoard(board.id)
      } else {
        await joinBoard(board.id)
      }
      
      // Update local state
      setBoards(prev => prev.map(b => 
        b.id === board.id 
          ? {
              ...b,
              members: isCurrentlyMember 
                ? b.members.filter(id => id !== user.id)
                : [...b.members, user.id],
              member_count: isCurrentlyMember 
                ? b.member_count - 1 
                : b.member_count + 1
            }
          : b
      ))
    } catch (error) {
      // console.error(`Error ${action} board:`, error)
    } finally {
      setActionLoading(prev => ({ ...prev, [board.id]: null }))
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Board Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage feedback boards and memberships
          </p>
        </div>
        {(isAdmin || isModerator) && (
          <Link
            to="/create-board"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Create Board
          </Link>
        )}
      </div>

      {/* Boards Grid */}
      {boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map(board => {
            const isMember = board.members.includes(user.id)
            const currentAction = actionLoading[board.id]
            
            return (
              <div key={board.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {board.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {board.description || 'No description provided'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    board.is_public 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {board.is_public ? 'Public' : 'Private'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                      {board.member_count} members
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {board.feedback_count} feedback
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {board.is_public && (
                    <button
                      onClick={() => handleJoinLeave(board)}
                      disabled={currentAction}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isMember
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300'
                      } disabled:opacity-50`}
                    >
                      {currentAction ? 
                        (currentAction === 'joining' ? 'Joining...' : 'Leaving...') :
                        (isMember ? 'Leave' : 'Join')
                      }
                    </button>
                  )}
                  
                  {(isAdmin || isModerator) && (
                    <button
                      onClick={() => handleDelete(board.id)}
                      disabled={currentAction === 'deleting'}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {currentAction === 'deleting' ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No boards found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isAdmin || isModerator 
              ? "Get started by creating your first board."
              : "No boards are available to join at the moment."
            }
          </p>
          {(isAdmin || isModerator) && (
            <Link
              to="/create-board"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Board
            </Link>
          )}
        </div>
      )}
    </div>
  )
}