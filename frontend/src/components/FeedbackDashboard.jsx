// frontend/src/components/FeedbackDashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeedbackList, getBoards } from '../api'

export default function FeedbackDashboard() {
  const [analytics, setAnalytics] = useState({
    totalFeedback: 0,
    activeFeedback: 0,
    completedFeedback: 0,
    inProgressFeedback: 0,
    topVotedFeedback: [],
    statusDistribution: {},
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      const [feedbackRes, boardsRes] = await Promise.all([
        getFeedbackList(),
        getBoards()
      ])

      const feedback = feedbackRes
      const boards = boardsRes

      // Calculate analytics
      const total = feedback.length
      const active = feedback.filter(f => f.status !== 'completed' && f.status !== 'rejected').length
      const completed = feedback.filter(f => f.status === 'completed').length
      const inProgress = feedback.filter(f => f.status === 'in_progress').length

      // Top voted feedback
      const topVoted = feedback
        .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        .slice(0, 5)

      // Status distribution
      const statusDist = feedback.reduce((acc, f) => {
        acc[f.status] = (acc[f.status] || 0) + 1
        return acc
      }, {})

      // Recent activity (last 10 items)
      const recent = feedback
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)

      setAnalytics({
        totalFeedback: total,
        activeFeedback: active,
        completedFeedback: completed,
        inProgressFeedback: inProgress,
        topVotedFeedback: topVoted,
        statusDistribution: statusDist,
        recentActivity: recent,
        totalBoards: boards.length
      })
    } catch (error) {
      // console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color = "blue", change }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const StatusChart = () => {
    const total = Object.values(analytics.statusDistribution).reduce((a, b) => a + b, 0)
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
        <div className="space-y-3">
          {Object.entries(analytics.statusDistribution).map(([status, count]) => {
            const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0
            const statusColors = {
              open: 'bg-blue-500',
              in_progress: 'bg-yellow-500',
              under_review: 'bg-purple-500',
              completed: 'bg-green-500',
              rejected: 'bg-red-500'
            }
            
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status]} mr-3`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{count}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({percentage}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Feedback"
          value={analytics.totalFeedback}
          color="blue"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          }
        />
        <StatCard
          title="Active Items"
          value={analytics.activeFeedback}
          color="yellow"
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
          }
        />
        <StatCard
          title="In Progress"
          value={analytics.inProgressFeedback}
          color="purple"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
          }
        />
        <StatCard
          title="Completed"
          value={analytics.completedFeedback}
          color="green"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          }
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <StatusChart />

        {/* Top Voted Feedback */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Voted Feedback</h3>
          <div className="space-y-3">
            {analytics.topVotedFeedback.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <Link 
                    to={`/feedback/${item.id}`}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.content?.substring(0, 60)}...
                  </p>
                </div>
                <div className="flex items-center text-blue-600 dark:text-blue-400 ml-3">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0014.56 8H7.333a2 2 0 00-1.147.333L6 8.667z"/>
                  </svg>
                  <span className="text-sm font-medium">{item.upvotes || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <Link 
            to="/feedback" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {analytics.recentActivity.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="flex-1">
                <Link 
                  to={`/feedback/${item.id}`}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  by {item.author?.username || 'Anonymous'} • {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                  item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {item.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/feedback/create"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Add Feedback</span>
            </div>
          </Link>
          <Link
            to="/boards/create"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Create Board</span>
            </div>
          </Link>
          <Link
            to="/feedback"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">View Analytics</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}