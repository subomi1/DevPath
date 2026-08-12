import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}