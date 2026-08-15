import { useState } from "react";
import {
  Megaphone,
  Compass,
  Cpu,
  Building2,
  Wrench,
  GraduationCap,
  Layers,
  ChevronDown,
  Clock,
  User,
  BellOff,
  Sparkles,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import {
  useAnnouncements,
  useMarkAnnouncementRead,
} from "../../hooks/useAnnouncements";
import type { AnnouncementCategory } from "../../types/announcement";

interface CategoryOption {
  value: AnnouncementCategory | "all";
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryOption[] = [
  { value: "all", label: "All Topics", icon: Layers },
  { value: "orientation", label: "Orientation", icon: Compass },
  { value: "engineering", label: "Engineering", icon: Cpu },
  { value: "office", label: "Office", icon: Building2 },
  { value: "maintenance", label: "Maintenance", icon: Wrench },
  { value: "training", label: "Training", icon: GraduationCap },
];

export default function AnnouncementsPage() {
  const [filter, setFilter] = useState<AnnouncementCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: announcements, isLoading } = useAnnouncements(
    filter === "all" ? undefined : filter
  );
  const markRead = useMarkAnnouncementRead();

  const handleToggle = async (id: string, isRead: boolean) => {
    setExpandedId(expandedId === id ? null : id);
    if (!isRead) {
      await markRead(id);
    }
  };

  const unreadCount =
    announcements?.filter((a) => !a.is_read).length ?? 0;

  return (
    <AppShell title="Announcements">
      <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Company Announcements
              </h1>
              {unreadCount > 0 && (
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Stay updated with company news, system maintenance, and team updates.
            </p>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = filter === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 border ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface text-ink-muted border-border hover:text-ink hover:bg-canvas"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-ink-muted"} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        {isLoading ? (
          /* Skeleton Loaders */
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-2xl p-5 space-y-3 animate-pulse shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-canvas rounded-md w-1/2" />
                  <div className="h-4 bg-canvas rounded-md w-1/6" />
                </div>
                <div className="h-3 bg-canvas rounded-md w-1/3" />
              </div>
            ))}
          </div>
        ) : !announcements || announcements.length === 0 ? (
          /* Empty State */
          <div className="bg-surface border border-border rounded-2xl p-10 text-center shadow-xs space-y-3 my-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
              <BellOff size={24} />
            </div>
            <h3 className="font-display font-semibold text-ink text-base">
              No announcements found
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
              {filter !== "all"
                ? `There are currently no announcements in the "${filter}" category.`
                : "You're all caught up! There are no announcements at this time."}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-2"
              >
                View all announcements
              </button>
            )}
          </div>
        ) : (
          /* Announcements List */
          <div className="space-y-3">
            {announcements.map((a) => {
              const isExpanded = expandedId === a.id;
              const isUnread = !a.is_read;

              return (
                <div
                  key={a.id}
                  className={`bg-surface border transition-all duration-200 rounded-2xl overflow-hidden shadow-xs ${
                    isUnread
                      ? "border-primary/40 ring-1 ring-primary/10 bg-gradient-to-r from-primary/[0.02] to-transparent"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <button
                    onClick={() => handleToggle(a.id, a.is_read)}
                    aria-expanded={isExpanded}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 group"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isUnread && (
                          <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            <Sparkles size={10} /> New
                          </span>
                        )}
                        <CategoryBadge category={a.category} />
                      </div>

                      <h2
                        className={`text-sm sm:text-base leading-snug transition-colors group-hover:text-primary ${
                          isUnread
                            ? "font-bold text-ink"
                            : "font-semibold text-ink/90"
                        }`}
                      >
                        {a.title}
                      </h2>

                      <div className="flex items-center gap-3 text-xs text-ink-muted flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <User size={12} className="text-ink-muted/70" />
                          {a.author_name}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-ink-muted/70" />
                          {new Date(a.published_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-canvas border border-border/60 text-ink-muted group-hover:text-ink shrink-0 transition-transform">
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Body Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-4 text-xs sm:text-sm text-ink/90 leading-relaxed whitespace-pre-wrap border-t border-border/60 bg-canvas/40 animate-in fade-in duration-150">
                      {a.body}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* Helper Component for Category Badges */
function CategoryBadge({ category }: { category: AnnouncementCategory }) {
  const styles: Record<
    AnnouncementCategory,
    { label: string; style: string; icon: React.ElementType }
  > = {
    orientation: {
      label: "Orientation",
      style: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      icon: Compass,
    },
    engineering: {
      label: "Engineering",
      style: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      icon: Cpu,
    },
    office: {
      label: "Office",
      style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: Building2,
    },
    maintenance: {
      label: "Maintenance",
      style: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      icon: Wrench,
    },
    training: {
      label: "Training",
      style: "bg-teal-500/10 text-teal-600 border-teal-500/20",
      icon: GraduationCap,
    },
  };

  const cat = styles[category] ?? {
    label: category,
    style: "bg-canvas text-ink-muted border-border",
    icon: Megaphone,
  };

  const Icon = cat.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-semibold capitalize ${cat.style}`}
    >
      <Icon size={11} />
      {cat.label}
    </span>
  );
}