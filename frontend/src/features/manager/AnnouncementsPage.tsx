import { useState, type FormEvent } from "react";
import {
  Plus,
  X,
  Megaphone,
  Bell,
  ChevronDown,
  Loader2,
  Send,
  User,
  Clock,
  MessageSquare,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import type { AnnouncementCategory } from "../../types/announcement";

const CATEGORIES: { value: AnnouncementCategory | "all"; label: string }[] = [
  { value: "all", label: "All Updates" },
  { value: "orientation", label: "Orientation" },
  { value: "engineering", label: "Engineering" },
  { value: "office", label: "Office" },
  { value: "maintenance", label: "Maintenance" },
  { value: "training", label: "Training" },
];

export default function ManagerAnnouncementsPage() {
  const [filter, setFilter] = useState<AnnouncementCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: announcements, isLoading } = useAnnouncements(
    filter === "all" ? undefined : filter
  );
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("engineering");

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      await client.post("/announcements/", {
        title,
        body,
        category,
        audience_scope: "manager_team",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setTitle("");
      setBody("");
      setDrawerOpen(false);
    },
  });

  const handleToggle = async (id: string, isRead: boolean) => {
    setExpandedId(expandedId === id ? null : id);
    if (!isRead) {
      await client.get(`/announcements/${id}/`);
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createAnnouncement.mutate();
  };

  return (
    <AppShell title="Announcements">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        
        {/* Header Section */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
              <Megaphone className="text-primary" size={24} />
              Team Announcements
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Broadcast updates, policy changes, and news to your team.
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors shadow-xs shrink-0"
          >
            <Plus size={16} /> New Announcement
          </button>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = filter === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs border ${
                  isActive
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-ink-muted border-border hover:bg-canvas hover:text-ink"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !announcements || announcements.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-xs flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell size={28} />
            </div>
            <h3 className="font-display font-semibold text-ink text-base mb-1">
              No announcements found
            </h3>
            <p className="text-sm text-ink-muted max-w-sm mx-auto">
              There are no announcements in this category yet. You can create a new one using the button above.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {announcements.map((a) => {
              const isExpanded = expandedId === a.id;
              const isUnread = !a.is_read;

              return (
                <div
                  key={a.id}
                  className={`bg-surface border rounded-2xl overflow-hidden transition-all shadow-xs ${
                    isUnread ? "border-primary/40" : "border-border"
                  }`}
                >
                  <button
                    onClick={() => handleToggle(a.id, a.is_read)}
                    className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 flex items-start gap-4 hover:bg-canvas/30 transition-colors group"
                  >
                    <div className="shrink-0 mt-0.5 relative">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isUnread ? "bg-primary text-white" : "bg-canvas border border-border text-ink-muted"}`}>
                        {a.author_name.charAt(0)}
                      </div>
                      {isUnread && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger border-2 border-surface rounded-full"></span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className={`text-sm sm:text-base truncate ${isUnread ? "font-bold text-ink" : "font-semibold text-ink/90"}`}>
                          {a.title}
                        </h3>
                        <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-ink-muted bg-canvas border border-border px-2 py-0.5 rounded-md shrink-0">
                          {a.category}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                        <span className="flex items-center gap-1 font-medium text-ink/80">
                          <User size={13} className="text-ink-muted/70" />
                          {a.author_name}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-ink-muted/70" />
                          {new Date(a.published_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 ml-auto flex items-center h-10 text-ink-muted group-hover:text-ink transition-colors">
                      <ChevronDown
                        size={20}
                        className={`transition-transform duration-200 ${isExpanded ? "-rotate-180 text-primary" : ""}`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-border/60 bg-surface/50">
                      <div className="prose prose-sm prose-ink max-w-none text-sm text-ink leading-relaxed whitespace-pre-wrap pl-14">
                        {a.body}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Drawer for New Announcement */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs z-40 animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-screen w-full max-w-md bg-surface z-50 flex flex-col shadow-2xl animate-in slide-in-from-right-full duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface">
              <div className="flex items-center gap-2 text-ink">
                <MessageSquare size={18} className="text-primary" />
                <h2 className="font-display font-semibold text-lg">New Announcement</h2>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 -mr-2 rounded-xl text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="E.g., Q3 Engineering All-Hands"
                  className="w-full bg-canvas border border-border rounded-xl px-4 py-3 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                    className="w-full bg-canvas border border-border rounded-xl px-4 py-3 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  >
                    {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  Message Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={8}
                  placeholder="Write your announcement details here..."
                  className="w-full flex-1 bg-canvas border border-border rounded-xl px-4 py-3 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-ink-muted/50"
                />
              </div>

              <div className="pt-4 border-t border-border mt-auto">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 mb-4 flex items-start gap-3">
                  <Bell className="text-primary shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-ink/80 leading-relaxed">
                    This announcement will be published exclusively to members of your immediate team.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={createAnnouncement.isPending || !title.trim() || !body.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl py-3.5 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAnnouncement.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Publish Announcement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}