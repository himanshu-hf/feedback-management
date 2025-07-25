import { useEffect, useState } from 'react'
import api from '../api'

export default function FeedbackKanban() {
  const [columns, setColumns] = useState({ open: [], in_progress: [], completed: [] })

  useEffect(() => {
    api.get('feedback/').then(res => {
      const grouped = { open: [], in_progress: [], completed: [] }
      res.data.forEach(f => grouped[f.status]?.push(f))
      setColumns(grouped)
    })
  }, [])

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      {Object.entries(columns).map(([status, items]) => (
        <div key={status}>
          <h3>{status.replace('_', ' ')}</h3>
          <ul>
            {items.map(f => <li key={f.id}>{f.title}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}