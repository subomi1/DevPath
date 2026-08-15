import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../../../public/zone.png";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        setError("Email or password is incorrect.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const redirectByRole = (role: string) => {
    switch (role) {
      case "developer":
        navigate("/developer/dashboard");
        break;
      case "manager":
        navigate("/manager/dashboard");
        break;
      case "hr":
        navigate("/hr/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative ambient background blur */}
      <div className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-[420px] bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-display font-bold text-base shadow-inner mb-3">
            <img src={Logo} alt="" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
            AppZone Portal
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-xs sm:text-sm font-medium rounded-xl p-3.5 mb-5 flex items-center gap-2.5">
            <AlertCircleIcon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Company Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full border border-border bg-surface rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-ink">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline transition-all"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-border bg-surface rounded-xl px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors p-1 rounded-md"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            {isLoading && <SpinnerIcon className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? "Logging in..." : "Log in"}</span>
          </button>
        </form>

        <div className="border-t border-border mt-6 pt-5">
          <p className="text-xs text-ink-muted text-center leading-relaxed">
            Access is by invitation only. Contact HR if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}

/* Local SVG Icons */
function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}