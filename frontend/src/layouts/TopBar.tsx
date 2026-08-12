import { useState } from 'react'
import { Bell, Search, Menu, X } from 'lucide-react'

export function TopBar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  if (mobileSearchOpen) {
    return (
      <header className="h-14 bg-surface border-b border-border flex items-center gap-2 px-4 sm:hidden">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            autoFocus
            placeholder="Search..."
            className="bg-canvas border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm w-full focus:outline-none"
          />
        </div>
        <button onClick={() => setMobileSearchOpen(false)} className="text-ink-muted shrink-0">
          <X size={20} />
        </button>
      </header>
    )
  }

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="md:hidden text-ink-muted shrink-0">
          <Menu size={20} />
        </button>
        <h2 className="font-display text-sm font-medium text-ink truncate">{title}</h2>
      </div>
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-canvas border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm w-40 md:w-48 focus:outline-none"
          />
        </div>
        <button onClick={() => setMobileSearchOpen(true)} className="sm:hidden text-ink-muted">
          <Search size={18} />
        </button>
        <button className="text-ink-muted">
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}