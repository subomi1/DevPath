import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="font-display text-2xl text-primary">?</span>
      </div>
      <h1 className="font-display text-xl font-semibold text-ink">Page not found</h1>
      <p className="text-sm text-ink-muted max-w-sm">
        The page you're looking for doesn't exist, or hasn't been built yet.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="bg-primary text-white text-sm rounded-lg px-4 py-2"
      >
        Go back
      </button>
    </div>
  )
}