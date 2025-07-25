import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FeedbackTable from './components/FeedbackTable'
import FeedbackKanban from './components/FeedbackKanban'
import FeedbackDashboard from './components/FeedbackDashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>Feedback Management</h1>
        <FeedbackDashboard />
        <hr />
        <FeedbackTable />
        <hr />
        <FeedbackKanban />
      </div>
    </>
  )
}

export default App
