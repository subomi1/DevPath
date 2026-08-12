import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { AppShell } from '../../layouts/AppShell'
import { useArticle } from '../../hooks/useKnowledgeBase'

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: article, isLoading, error } = useArticle(slug)

  if (isLoading) {
    return (
      <AppShell title="Knowledge Base">
        <div className="p-6 text-sm text-ink-muted">Loading...</div>
      </AppShell>
    )
  }

  if (error || !article) {
    return (
      <AppShell title="Knowledge Base">
        <div className="p-6 text-sm text-danger">Couldn't load this article.</div>
      </AppShell>
    )
  }

  return (
    <AppShell title={article.title}>
      <div className="max-w-2xl mx-auto p-6">
        <Link to="/developer/knowledge-base" className="flex items-center gap-1.5 text-sm text-ink-muted mb-6">
          <ArrowLeft size={16} /> Back to Knowledge Base
        </Link>

        <span className="text-xs font-medium text-primary uppercase tracking-wide">
          {article.category.name}
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink mt-2 mb-3">{article.title}</h1>

        <div className="flex items-center gap-3 text-sm text-ink-muted mb-6 pb-6 border-b border-border">
          <span>{article.author_name}</span>
          <span>·</span>
          <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
        </div>

        <div className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
          {article.body}
        </div>

        {article.attachments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h2 className="text-sm font-medium text-ink mb-3">Attachments</h2>
            <div className="flex flex-col gap-2">
              {article.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary bg-canvas border border-border rounded-lg px-3 py-2 w-fit"
                >
                  <Download size={14} /> {att.filename}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}