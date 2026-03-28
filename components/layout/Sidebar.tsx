'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, Search, FolderOpen, Zap } from 'lucide-react'

const navItems = [
  { href: '/',            label: 'Top Performers', icon: Flame },
  { href: '/search',      label: 'Search Ads',     icon: Search },
  { href: '/collections', label: 'Collections',    icon: FolderOpen },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 h-screen flex flex-col border-r border-notion-border bg-notion-sidebar overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2 border-b border-notion-border">
        <Zap size={18} className="text-notion-accent" />
        <span className="font-semibold text-notion-text text-sm tracking-tight">
          Ad Swipe
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-notion-hover text-notion-text font-medium'
                  : 'text-notion-muted hover:bg-notion-hover hover:text-notion-text'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-notion-border">
        <p className="text-xs text-notion-muted">Ad Swipe Beta</p>
      </div>
    </aside>
  )
}
