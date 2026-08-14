import { useState } from "react";
import { Bell, Search, Menu, X } from "lucide-react";

export function TopBar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick: () => void;
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (mobileSearchOpen) {
    return (
      <header className="h-14 bg-surface border-b border-border flex items-center gap-2 px-4 sm:hidden animate-in fade-in duration-150">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, docs, requests..."
            className="w-full bg-canvas border border-border rounded-xl pl-9 pr-8 py-1.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setMobileSearchOpen(false);
            setSearchQuery("");
          }}
          className="text-xs font-medium text-ink-muted hover:text-ink p-2 shrink-0 transition-colors"
        >
          Cancel
        </button>
      </header>
    );
  }

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-30 shadow-xs">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden text-ink-muted hover:text-ink p-1.5 rounded-lg hover:bg-canvas transition-colors shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>
        <h2 className="font-display text-base font-semibold text-ink truncate tracking-tight">
          {title}
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Desktop Search */}
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="bg-canvas border border-border rounded-xl pl-9 pr-9 py-1.5 text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 w-44 md:w-56 focus:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
          <kbd className="hidden md:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-ink-muted/70 bg-surface border border-border/60 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Mobile Search Button */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden text-ink-muted hover:text-ink p-2 rounded-xl hover:bg-canvas transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button
          className="relative text-ink-muted hover:text-ink p-2 rounded-xl hover:bg-canvas transition-colors"
          aria-label="View notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-xs ring-2 ring-surface" />
        </button>
      </div>
    </header>
  );
}