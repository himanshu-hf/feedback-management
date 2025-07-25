import { useEffect, useState } from 'react'
import api from '../api'

export default function FeedbackTable() {
  const [feedback, setFeedback] = useState([])

  useEffect(() => {
    api.get('feedback/').then(res => setFeedback(res.data))
  }, [])

  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Board</th>
          <th>Author</th>
          <th>Upvotes</th>
          <th>Tags</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {feedback.map(f => (
          <tr key={f.id}>
            <td>{f.title}</td>
            <td>{f.status}</td>
            <td>{f.board}</td>
            <td>{f.author?.username}</td>
            <td>{f.upvotes?.length}</td>
            <td>{f.tags?.join(', ')}</td>
            <td>{f.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}