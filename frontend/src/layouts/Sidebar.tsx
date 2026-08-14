import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Route as RouteIcon,
  BookOpen,
  KeyRound,
  Heart,
  Megaphone,
  User,
  LogOut,
  X,
  Users,
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import logo from "../../public/zone.png";

const developerNav = [
  { to: "/developer/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/developer/journey", label: "My Journey", icon: RouteIcon },
  { to: "/developer/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { to: "/developer/access-requests", label: "Access Requests", icon: KeyRound },
  { to: "/developer/mentor", label: "My Mentor", icon: Heart },
  { to: "/developer/announcements", label: "Announcements", icon: Megaphone },
  { to: "/developer/profile", label: "Profile", icon: User },
];

const managerNav = [
  { to: "/manager/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/manager/team", label: "My Team", icon: Users },
  { to: "/manager/approvals", label: "Approvals", icon: ClipboardCheck },
  { to: "/manager/announcements", label: "Announcements", icon: Megaphone },
  { to: "/manager/profile", label: "Profile", icon: User },
];

const navByRole: Record<string, typeof developerNav> = {
  developer: developerNav,
  manager: managerNav,
};

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() ?? "U";
  const navItems = navByRole[user?.role ?? ""] ?? [];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 h-screen w-64 bg-surface border-r border-border
          flex flex-col shrink-0 z-50 transition-transform duration-200 ease-in-out shadow-sm
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-canvas border border-border/60 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-xs">
              <img
                src={logo}
                alt="Zone logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-bold text-lg text-ink tracking-tight">
              Zone
            </span>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-ink-muted hover:text-ink p-1.5 rounded-lg hover:bg-canvas transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto custom-scrollbar">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-ink-muted hover:text-ink hover:bg-canvas"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? "text-primary" : "text-ink-muted group-hover:text-ink"
                    }`}
                  />
                  <span className="truncate">{label}</span>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Footer */}
        <div className="border-t border-border p-3 space-y-1">
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-canvas/50 border border-border/40">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-xs shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate leading-tight">
                {user?.full_name || "Developer"}
              </p>
              <p className="text-[11px] text-ink-muted capitalize truncate mt-0.5">
                {user?.role || "Team Member"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-xs font-medium text-ink-muted hover:text-danger hover:bg-danger/10 px-3 py-2 w-full rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}