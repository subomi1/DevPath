import { useState } from 'react'
import client from './api/client'

function App() {
  const [result, setResult] = useState<string>('')

  const testLogin = async () => {
    try {
      const response = await client.post('/auth/login/', {
        email: 'jordan.rivers@example.com',
        password: 'testpassword123',
      })
      setResult(JSON.stringify(response.data, null, 2))
    } catch (error) {
      setResult('Error: ' + JSON.stringify(error, null, 2))
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-display text-2xl text-ink">AppZone</h1>
      <button
        onClick={testLogin}
        className="bg-primary text-white px-4 py-2 rounded-lg"
      >
        Test Login
      </button>
      <pre className="bg-surface border border-border rounded-lg p-4 text-xs max-w-2xl overflow-auto">
        {result}
      </pre>
    </div>
  )
}

export default App