import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 sm:p-8 text-center relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Visual 404 Hero */}
        <div className="relative flex items-center justify-center mb-6 select-none">
          <span className="font-display font-extrabold text-7xl sm:text-8xl text-primary/15 tracking-tight">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface border-2 border-primary/20 rounded-2xl shadow-lg flex items-center justify-center rotate-3 transition-transform hover:rotate-0">
              <CompassIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          Page not found
        </h1>
        
        <p className="text-sm text-ink-muted mt-2 max-w-sm leading-relaxed">
          The page you're looking for doesn't exist, has been moved, or hasn't been built yet.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full sm:w-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto bg-surface hover:bg-neutral-100 dark:hover:bg-neutral-800 text-ink border border-border text-sm font-medium rounded-xl px-5 py-2.5 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4 text-ink-muted" />
            <span>Go back</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl px-5 py-2.5 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* Helper Icons */
function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}