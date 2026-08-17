import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Trash2,
  X,
  Upload,
  Paperclip,
  Loader2,
  Search,
  Filter,
  FileText,
  Calendar,
  User,
  Folder,
  Edit3,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import {
  useCategories,
  useArticles,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useUploadAttachment,
  useDeleteAttachment,
  useArticleDetail,
} from "../../hooks/useKnowledgeBase";
import type { ArticleListItem } from "../../types/knowledgeBase";

interface Category {
  id: string;
  name: string;
}

interface Attachment {
  id: string;
  filename: string;
}

type EditTarget = ArticleListItem | "new";

// ---------------------------------------------------------------------------
// ArticleEditorForm
//
// Deliberately a separate component, mounted with a `key` tied to whichever
// article is being edited (see parent below). When that key changes, React
// unmounts this component entirely and mounts a fresh one — so every
// useState() here initializes directly from the *current* article's real
// data, with no useEffect required to "catch up" after the fact. This
// avoids the classic bug where a sync-via-effect briefly shows stale data
// from the previously-edited article for one render before correcting itself.
// ---------------------------------------------------------------------------
function ArticleEditorForm({
  editing,
  articleBody,
  articleAttachments,
  categories,
  onSave,
  onClose,
  onUploadFile,
  onDeleteAttachment,
  isSaving,
  isUploading,
}: {
  editing: EditTarget;
  articleBody: string;
  articleAttachments: Attachment[];
  categories: Category[] | undefined;
  onSave: (data: { title: string; category: string; body: string }) => void;
  onClose: () => void;
  onUploadFile: (file: File) => Promise<Attachment>;
  onDeleteAttachment: (attachmentId: string) => Promise<void>;
  isSaving: boolean;
  isUploading: boolean;
}) {
  const isNew = editing === "new";

  const [title, setTitle] = useState(isNew ? "" : editing.title);
  const [category, setCategory] = useState(
    isNew ? categories?.[0]?.id ?? "" : editing.category.id
  );
  const [body, setBody] = useState(isNew ? "" : articleBody);
  const [attachments, setAttachments] = useState<Attachment[]>(
    isNew ? [] : articleAttachments
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await onUploadFile(file);
      setAttachments((prev) => [...prev, uploaded]);
    } catch (err) {
      console.error("Failed to upload attachment:", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await onDeleteAttachment(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err) {
      console.error("Failed to delete attachment:", err);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 h-screen w-full max-w-2xl bg-surface z-50 flex flex-col shadow-2xl border-l border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              {isNew ? "Create New Article" : "Edit Article"}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {isNew
                ? "Fill in the details below to add to your documentation."
                : `Editing details for "${editing.title}"`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="article-title"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5"
              >
                Title
              </label>
              <input
                id="article-title"
                type="text"
                placeholder="e.g. Getting Started Guide"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="article-category"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5"
              >
                Category
              </label>
              <select
                id="article-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="article-body"
              className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5"
            >
              Article Content
            </label>
            <textarea
              id="article-body"
              placeholder="Write your article markdown or content here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full bg-surface border border-border rounded-lg p-3.5 text-sm text-ink leading-relaxed font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Attachments */}
          <div className="border-t border-border/80 pt-5 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Attachments ({attachments.length})
            </label>

            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between bg-canvas border border-border rounded-lg px-3 py-2 text-xs"
                  >
                    <span className="flex items-center gap-2 text-ink truncate pr-2">
                      <Paperclip size={13} className="shrink-0 text-ink-muted" />
                      <span className="truncate">{att.filename}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-ink-muted hover:text-danger p-0.5 rounded transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isNew ? (
              <div className="p-3 bg-canvas border border-border rounded-lg flex items-center gap-2.5 text-xs text-ink-muted">
                <AlertCircle size={15} className="shrink-0 text-ink-muted" />
                <span>Save the article first before adding downloadable attachments.</span>
              </div>
            ) : (
              <label className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-canvas hover:border-primary/40 transition-all group">
                <Upload size={18} className="text-ink-muted group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium text-ink group-hover:text-primary transition-colors">
                  {isUploading ? "Uploading file..." : "Click to upload an attachment"}
                </span>
                <span className="text-[11px] text-ink-muted">PDF, Images, or docs up to 10MB</span>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-ink bg-surface border border-border rounded-lg hover:bg-canvas transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ title, category, body })}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2 transition-all shadow-xs"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// KnowledgeBaseManagementPage
// ---------------------------------------------------------------------------
export default function KnowledgeBaseManagementPage() {
  const { data: categories } = useCategories();
  const { data: articles, isLoading } = useArticles({});

  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();

  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  const activeSlug = editing && editing !== "new" ? editing.slug : null;
  const { data: articleDetail, isLoading: isFetchingDetail } = useArticleDetail(activeSlug);

  const closeModal = useCallback(() => setEditing(null), []);

  const openNew = () => setEditing("new");
  const openEdit = (article: ArticleListItem) => setEditing(article);

  const handleSave = async (data: { title: string; category: string; body: string }) => {
    try {
      if (editing === "new") {
        await createArticle.mutateAsync(data);
      } else if (editing) {
        await updateArticle.mutateAsync({ slug: editing.slug, data });
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save article:", err);
    }
  };

  const handleDelete = async (article: ArticleListItem) => {
    if (window.confirm(`Delete "${article.title}"? This action cannot be undone.`)) {
      try {
        await deleteArticle.mutateAsync(article.slug);
      } catch (err) {
        console.error("Failed to delete article:", err);
      }
    }
  };

  const handleUploadFile = async (file: File) => {
    if (editing === "new" || !editing) throw new Error("No article to attach to.");
    return uploadAttachment.mutateAsync({ slug: editing.slug, file });
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    await deleteAttachment.mutateAsync(attachmentId);
  };

  const filteredArticles = useMemo(() => {
    return articles?.filter((article) => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategoryFilter === "all" || article.category.id === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategoryFilter]);

  const isSaving = createArticle.isPending || updateArticle.isPending;

  return (
    <AppShell title="Knowledge Base">
      <div className="p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
              Knowledge Base
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              Create, organize, and publish internal documentation and guides.
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus size={18} />
            <span>New Article</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="relative sm:col-span-7 lg:col-span-8">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search articles by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="relative sm:col-span-5 lg:col-span-4">
            <Filter
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none z-10"
            />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-8 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl p-5 animate-pulse flex justify-between items-center"
              >
                <div className="space-y-2.5 w-2/3">
                  <div className="h-4 bg-border/60 rounded w-1/2" />
                  <div className="h-3 bg-border/40 rounded w-1/3" />
                </div>
                <div className="h-8 bg-border/40 rounded w-16" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredArticles?.length === 0 && (
          <div className="bg-surface border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-canvas border border-border rounded-full text-ink-muted">
              <FileText size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-ink">No articles found</h3>
              <p className="text-sm text-ink-muted max-w-sm">
                {searchQuery || selectedCategoryFilter !== "all"
                  ? "Try adjusting your search terms or filters."
                  : "Get started by creating your first knowledge base article."}
              </p>
            </div>
            {!articles?.length && (
              <button
                onClick={openNew}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Plus size={16} /> Create Article
              </button>
            )}
          </div>
        )}

        {/* Article list */}
        {!isLoading && (filteredArticles?.length ?? 0) > 0 && (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden shadow-sm">
            {filteredArticles?.map((article) => (
              <div
                key={article.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-canvas/50 transition-colors group"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      <Folder size={12} />
                      {article.category.name}
                    </span>
                    <h3 className="text-base font-medium text-ink truncate group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-ink-muted pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <User size={13} className="shrink-0" />
                      {article.author_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="shrink-0" />
                      Updated {new Date(article.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => openEdit(article)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-surface border border-border rounded-lg hover:bg-canvas hover:text-primary transition-colors"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(article)}
                    className="p-1.5 text-ink-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    aria-label={`Delete ${article.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor drawer — only mounts once we have what it needs to initialize
          correctly; while the article detail is still loading, show a
          lightweight loading panel instead of mounting the form early. */}
      {editing && editing !== "new" && isFetchingDetail && (
        <>
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40" onClick={closeModal} />
          <div className="fixed top-0 right-0 h-screen w-full max-w-2xl bg-surface z-50 flex flex-col shadow-2xl border-l border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-ink">Edit Article</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2 text-ink-muted text-sm">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span>Fetching article content...</span>
              </div>
            </div>
          </div>
        </>
      )}

      {editing && (editing === "new" || !isFetchingDetail) && (
        <ArticleEditorForm
          key={editing === "new" ? "new" : editing.slug}
          editing={editing}
          articleBody={editing !== "new" ? articleDetail?.body ?? "" : ""}
          articleAttachments={editing !== "new" ? articleDetail?.attachments ?? [] : []}
          categories={categories}
          onSave={handleSave}
          onClose={closeModal}
          onUploadFile={handleUploadFile}
          onDeleteAttachment={handleDeleteAttachment}
          isSaving={isSaving}
          isUploading={uploadAttachment.isPending}
        />
      )}
    </AppShell>
  );
}