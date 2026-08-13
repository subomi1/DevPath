import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye } from 'lucide-react'
import { AppShell } from '../../layouts/AppShell'
import { useCategories, useArticles } from '../../hooks/useKnowledgeBase'

export default function KnowledgeBasePage() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')

  const { data: categories } = useCategories()
  const { data: articles, isLoading } = useArticles({ category: activeCategory, search: search || undefined })

  return (
    <AppShell title="Knowledge Base">
      <div className="flex flex-col lg:flex-row">
        {/* Category sidebar */}
        <div className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-border p-4">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            <button
              onClick={() => setActiveCategory(undefined)}
              className={`shrink-0 text-left px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                !activeCategory ? 'bg-primary/10 text-primary font-medium' : 'text-ink-muted hover:bg-canvas'
              }`}
            >
              All Topics
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`shrink-0 text-left px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                  activeCategory === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'text-ink-muted hover:bg-canvas'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Article grid */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="relative mb-6 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Knowledge Base..."
              className="w-full bg-canvas border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none"
            />
          </div>

          {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}

          {!isLoading && articles?.length === 0 && (
            <p className="text-sm text-ink-muted">No articles found.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {articles?.map((article) => (
              <Link
                key={article.id}
                to={`/developer/knowledge-base/${article.slug}`}
                className="bg-surface border border-border rounded-lg p-4 hover:border-primary transition-colors flex flex-col"
              >
                <span className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                  {article.category.name}
                </span>
                <h3 className="font-display font-semibold text-ink mb-2">{article.title}</h3>
                <p className="text-sm text-ink-muted line-clamp-3 flex-1">{article.excerpt}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-ink-muted">
                  <span>{article.author_name}</span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {article.view_count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}