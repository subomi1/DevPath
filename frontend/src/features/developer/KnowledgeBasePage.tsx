import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  X,
  BookOpen,
  SearchX,
  Folder,
  ArrowRight,
  User,
  Sparkles,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useCategories, useArticles } from "../../hooks/useKnowledgeBase";

export default function KnowledgeBasePage() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined
  );
  const [search, setSearch] = useState("");

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: articles, isLoading: isArticlesLoading } = useArticles({
    category: activeCategory,
    search: search || undefined,
  });

  const clearFilters = () => {
    setActiveCategory(undefined);
    setSearch("");
  };

  return (
    <AppShell title="Knowledge Base">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Category Sidebar */}
        <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-border p-4 lg:p-6 bg-surface/50">
          <div className="mb-3 hidden lg:flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
            <Folder size={14} />
            <span>Categories</span>
          </div>

          <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory(undefined)}
              className={`shrink-0 flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                !activeCategory
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "text-ink-muted hover:text-ink hover:bg-canvas"
              }`}
            >
              <span>All Topics</span>
              {!activeCategory && articles && (
                <span className="hidden lg:inline-block text-xs bg-white/20 px-2 py-0.5 rounded-md text-white font-normal">
                  {articles.length}
                </span>
              )}
            </button>

            {isCategoriesLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-28 lg:w-full bg-canvas animate-pulse rounded-xl"
                  />
                ))
              : categories?.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`shrink-0 flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                        isActive
                          ? "bg-primary text-white shadow-xs font-semibold"
                          : "text-ink-muted hover:text-ink hover:bg-canvas"
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
          </div>
        </aside>

        {/* Main KB Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Banner / Search Header */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
                <BookOpen className="text-primary shrink-0" size={24} />
                Knowledge Base
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                Explore guides, documentation, and technical articles.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles & docs..."
                className="w-full bg-canvas border border-border rounded-xl pl-10 pr-9 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-0.5 rounded-md"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Articles Grid / Loading / Empty States */}
          {isArticlesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-surface border border-border rounded-2xl p-5 space-y-3 animate-pulse shadow-xs"
                >
                  <div className="h-4 bg-canvas rounded-md w-1/3" />
                  <div className="h-6 bg-canvas rounded-md w-4/5" />
                  <div className="h-12 bg-canvas rounded-md w-full" />
                  <div className="pt-3 border-t border-border flex justify-between">
                    <div className="h-3 bg-canvas rounded-md w-1/4" />
                    <div className="h-3 bg-canvas rounded-md w-1/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-xs space-y-3 my-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                <SearchX size={24} />
              </div>
              <h3 className="font-display font-semibold text-ink text-base">
                No articles found
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
                {search
                  ? `We couldn't find any articles matching "${search}".`
                  : "There are no published articles in this category yet."}
              </p>
              {(search || activeCategory) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 text-xs font-semibold bg-canvas border border-border hover:bg-border/40 text-ink px-4 py-2 rounded-xl transition-all pt-2"
                >
                  Reset search & filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/developer/knowledge-base/${article.slug}`}
                  className="group bg-surface border border-border hover:border-primary/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                      {article.category?.name || "General"}
                    </span>
                    <Sparkles
                      size={14}
                      className="text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  <h3 className="font-display font-semibold text-ink group-hover:text-primary transition-colors mb-2 text-base line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-ink-muted line-clamp-3 flex-1 mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-border/80 text-xs text-ink-muted mt-auto">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="w-5 h-5 rounded-full bg-canvas border border-border flex items-center justify-center shrink-0">
                        <User size={10} className="text-ink-muted" />
                      </div>
                      <span className="truncate">{article.author_name}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {article.view_count}
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-ink-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}