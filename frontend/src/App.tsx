import { useState } from 'react'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, login, logout, isAuthenticated } = useAuth()
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      await login('jordan.rivers@example.com', 'testpassword123')
      setError('')
    } catch (err) {
      setError('Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-display text-2xl text-ink">AppZone</h1>

      {isAuthenticated ? (
        <>
          <p className="text-ink">Logged in as {user?.full_name} ({user?.role})</p>
          <button onClick={logout} className="bg-danger text-white px-4 py-2 rounded-lg">
            Log out
          </button>
        </>
      ) : (
        <button onClick={handleLogin} className="bg-primary text-white px-4 py-2 rounded-lg">
          Log in as Jordan
        </button>
      )}

      {error && <p className="text-danger">{error}</p>}
    </div>
  )
}

export default App