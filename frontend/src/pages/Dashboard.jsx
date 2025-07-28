import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardStats, getTopVotedFeedback } from '../api'

export default function Dashboard() {
  const { user, isAdmin, isModerator } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    in_progress: 0,
    completed: 0,
    under_review: 0
  })
  const [topFeedback, setTopFeedback] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsData = await getDashboardStats()
      setStats(statsData)
      
      // Fetch top voted feedback
      const topVoted = await getTopVotedFeedback()
      setTopFeedback(topVoted)
      
    } catch (error) {
      // console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your feedback management system.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Feedback" 
          value={stats.total} 
          bgColor="bg-blue-500"
          icon="📊"
        />
        <StatCard 
          title="Active" 
          value={stats.active} 
          bgColor="bg-green-500"
          icon="🟢"
        />
        <StatCard 
          title="In Progress" 
          value={stats.in_progress} 
          bgColor="bg-yellow-500"
          icon="🔄"
        />
        <StatCard 
          title="Under Review" 
          value={stats.under_review} 
          bgColor="bg-purple-500"
          icon="👀"
        />
        <StatCard 
          title="Completed" 
          value={stats.completed} 
          bgColor="bg-gray-500"
          icon="✅"
        />
      </div>

      {/* Top Voted Feedback */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Top Voted Feedback
          </h2>
          {topFeedback.length > 0 ? (
            <div className="space-y-3">
              {topFeedback.map((feedback) => (
                <div key={feedback.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {feedback.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      By {feedback.author_name} • {feedback.upvote_count} votes
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    feedback.status === 'completed' ? 'bg-green-100 text-green-800' :
                    feedback.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    feedback.status === 'under_review' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {feedback.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No feedback available yet. Create your first feedback item!
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton 
              title="Create Feedback"
              description="Submit new feedback or feature request"
              href="/create-feedback"
              icon="➕"
              bgColor="bg-blue-500"
            />
            <ActionButton 
              title="View All Feedback"
              description="Browse and manage all feedback items"
              href="/feedback"
              icon="📋"
              bgColor="bg-green-500"
            />
            {(isAdmin || isModerator) && (
              <ActionButton 
                title="Manage Boards"
                description="Create and manage feedback boards"
                href="/boards"
                icon="🏗️"
                bgColor="bg-purple-500"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function StatCard({ title, value, bgColor, icon }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${bgColor} rounded-md flex items-center justify-center`}>
              <span className="text-white text-sm">{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionButton({ title, description, href, icon, bgColor }) {
  return (
    <Link
      to={href}
      className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex items-start">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-lg">{icon}</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">
            {title}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
