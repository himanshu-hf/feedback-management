// frontend/src/components/FeedbackDashboard.jsx
import { useEffect, useState } from 'react'
import api from '../api'

export default function FeedbackDashboard() {
  const [counts, setCounts] = useState({})
  const [topVoted, setTopVoted] = useState([])

  useEffect(() => {
    api.get('feedback/counts/').then(res => setCounts(res.data))
    api.get('feedback/top_voted/').then(res => setTopVoted(res.data))
  }, [])

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <strong>Total:</strong> {counts.total} | <strong>Active:</strong> {counts.active} | <strong>Completed:</strong> {counts.completed} | <strong>In Progress:</strong> {counts.in_progress}
      </div>
      <h3>Top Voted Feedback</h3>
      <ul>
        {topVoted.map(f => <li key={f.id}>{f.title} ({f.upvotes?.length} votes)</li>)}
      </ul>
    </div>
  )
}