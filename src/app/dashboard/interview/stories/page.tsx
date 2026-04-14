"use client";

import { useState, useRef } from "react";
import {
  Library,
  Plus,
  Search,
  Tag,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  BarChart3,
  X,
  FileUp,
  Loader2,
} from "lucide-react";
import { useInterviewStore } from "@/store/interviewStore";
import { cn } from "@/lib/utils";
import StoryDialog from "@/components/interview/StoryDialog";
import { FileParserService } from "@/lib/FileParserService";
import { extractStoriesFromFile } from "@/lib/aiService";

/* ═══════════════════════════════════════════════════
   Story Bank — STAR story CRUD manager
   /dashboard/interview/stories
   ═══════════════════════════════════════════════════ */

const COMPETENCY_COLORS: Record<string, string> = {
  leadership: "text-amber-700 dark:text-amber-300 bg-amber-500/10",
  "conflict-resolution": "text-rose-700 dark:text-rose-300 bg-rose-500/10",
  technical: "text-blue-700 dark:text-blue-300 bg-blue-500/10",
  analytical: "text-cyan-700 dark:text-cyan-300 bg-cyan-500/10",
  culture: "text-purple-700 dark:text-purple-300 bg-purple-500/10",
  communication: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10",
  execution: "text-orange-700 dark:text-orange-300 bg-orange-500/10",
  innovation: "text-pink-700 dark:text-pink-300 bg-pink-500/10",
};

function getCompetencyStyle(competency: string) {
  return COMPETENCY_COLORS[competency] || "text-zinc-700 dark:text-gray-300 bg-gray-500/10";
}

export default function StoriesPage() {
  const { stories, deleteStory, getAllCompetencies, addStory } = useInterviewStore();
  const [search, setSearch] = useState("");
  const [filterCompetency, setFilterCompetency] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const competencies = getAllCompetencies();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsExtracting(true);
      const text = await FileParserService.parseFile(file);
      const extractedStories = await extractStoriesFromFile(text);
      
      extractedStories.forEach(story => {
        addStory({
          title: story.title || "Untitled Story",
          competency: story.competency || "unspecified",
          tags: story.tags || [],
          situation: story.situation,
          task: story.task,
          action: story.action,
          result: story.result,
          metrics: story.metrics,
        });
      });
    } catch (error) {
      console.error("Failed to extract stories:", error);
      alert("Failed to parse the file. Only PDF, DOCX, TXT, and MD are supported.");
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const filteredStories = stories.filter((s) => {
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.competency.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCompetency = !filterCompetency || s.competency === filterCompetency;
    return matchesSearch && matchesCompetency;
  });

  const handleEdit = (id: string) => {
    setEditingStoryId(id);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingStoryId(null);
    setDialogOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Library className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold">Story Bank</h1>
          <span className="text-sm text-zinc-500 dark:text-gray-500">
            {stories.length} {stories.length === 1 ? "story" : "stories"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExtracting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileUp className="w-4 h-4" />
            )}
            Import Document
          </button>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Story
          </button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-zinc-700 dark:hover:text-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Competency chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCompetency(null)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              !filterCompetency
                ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                : "bg-surface-200 text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-zinc-700 dark:hover:text-gray-300"
            )}
          >
            All
          </button>
          {competencies.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCompetency(filterCompetency === c ? null : c)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                filterCompetency === c
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                  : "bg-surface-200 text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-zinc-700 dark:hover:text-gray-300"
              )}
            >
              {c.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Library className="w-10 h-10 text-zinc-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {stories.length === 0 ? "Build your story bank" : "No matching stories"}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
            {stories.length === 0
              ? "STAR stories are your secret weapon for behavioral interviews. Add your best accomplishments here and reuse them across multiple interviews."
              : "Try adjusting your search or filter criteria."}
          </p>
          {stories.length === 0 && (
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Your First Story
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStories.map((story) => {
            const isExpanded = expandedId === story.id;

            return (
              <div
                key={story.id}
                className="glass-hover rounded-xl overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : story.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{story.title}</h3>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-md font-medium capitalize",
                            getCompetencyStyle(story.competency)
                          )}
                        >
                          {story.competency.replace("-", " ")}
                        </span>
                      </div>

                      {/* Tags */}
                      {story.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Tag className="w-3 h-3 text-zinc-400 dark:text-gray-600" />
                          {story.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 text-zinc-500 dark:text-gray-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Metrics preview */}
                      {story.metrics && (
                        <p className="text-xs text-zinc-600 dark:text-gray-400 flex items-center gap-1.5">
                          <BarChart3 className="w-3 h-3 text-emerald-400" />
                          {story.metrics}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-base font-bold">{story.used_count}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-gray-600">uses</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-500 dark:text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded STAR Detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/[0.04] pt-4 animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {[
                        { label: "Situation", content: story.situation, color: "text-blue-400" },
                        { label: "Task", content: story.task, color: "text-amber-400" },
                        { label: "Action", content: story.action, color: "text-emerald-400" },
                        { label: "Result", content: story.result, color: "text-purple-400" },
                      ].map((section) => (
                        <div key={section.label} className="p-3 rounded-lg bg-surface-200/30">
                          <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-1.5", section.color)}>
                            {section.label}
                          </h4>
                          <p className="text-sm text-zinc-700 dark:text-gray-300 leading-relaxed">
                            {section.content || "—"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(story.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-200/50 text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-zinc-800 dark:hover:text-gray-200 text-xs font-medium transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this story?")) {
                            deleteStory(story.id);
                            setExpandedId(null);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-200/50 text-red-400/70 hover:text-red-400 text-xs font-medium transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Story Dialog */}
      <StoryDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingStoryId(null);
        }}
        editingStoryId={editingStoryId}
      />
    </div>
  );
}
