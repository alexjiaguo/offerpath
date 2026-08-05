"use client";

import { useState, useRef } from "react";
import { ArrowsClockwise, ChartBar, CaretDown, CaretUp, Cards, FileArrowUp, PenNib, Plus, MagnifyingGlass, Tag, Trash, X } from '@phosphor-icons/react';
import { useInterviewStore } from "@/store/interviewStore";
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { cn } from "@/lib/utils";
import StoryDialog from "@/components/interview/StoryDialog";
import { FileParserService } from "@/lib/FileParserService";
import { extractStoriesFromFile } from "@/lib/aiService";

/* ═══════════════════════════════════════════════════
   Story Bank — STAR story CRUD manager
   /dashboard/interview/stories
   ═══════════════════════════════════════════════════ */

const COMPETENCY_COLORS: Record<string, string> = {
  leadership: "bg-pastel-yellow-bg text-pastel-yellow-fg border-pastel-yellow-fg/20",
  "conflict-resolution": "bg-pastel-red-bg text-pastel-red-fg border-pastel-red-fg/20",
  technical: "bg-pastel-blue-bg text-pastel-blue-fg border-pastel-blue-fg/20",
  analytical: "bg-pastel-blue-bg text-pastel-blue-fg border-pastel-blue-fg/20",
  culture: "bg-surface-100 text-surface-400 border-surface-200",
  communication: "bg-pastel-green-bg text-pastel-green-fg border-pastel-green-fg/20",
  execution: "bg-pastel-yellow-bg text-pastel-yellow-fg border-pastel-yellow-fg/20",
  innovation: "bg-pastel-red-bg text-pastel-red-fg border-pastel-red-fg/20",
};

function getCompetencyStyle(competency: string) {
  return COMPETENCY_COLORS[competency] || "bg-surface-100 text-surface-400 border-surface-200";
}

export default function StoriesPage() {
  const { stories, deleteStory, getAllCompetencies, addStory } = useInterviewStore();
  const search = usePipelineStore((s) => s.filters.search);
  const setSearch = (val: string) => {
    usePipelineStore.getState().setFilter({ search: val });
    useDiscoveryStore.getState().setSearchQuery(val);
  };
  const [filterCompetency, setFilterCompetency] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
      setUploadError("Failed to parse the file. Only PDF, DOCX, TXT, and MD are supported.");
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
    <div className="w-full space-y-6 pb-12">
      {/* Error Banner */}
      {uploadError && (
        <div className="p-3 rounded-md bg-pastel-red-bg border border-pastel-red-fg/20 text-xs font-mono text-pastel-red-fg flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="p-1 hover:bg-surface-0 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-surface-400 text-surface-0 flex items-center justify-center">
            <Cards weight="bold" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-surface-400">Story Bank</h1>
            <p className="text-xs text-surface-300 mt-0.5 font-mono">
              {stories.length} {stories.length === 1 ? "story" : "stories"} banked
            </p>
          </div>
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
            className="btn-editorial-secondary inline-flex items-center gap-2"
          >
            {isExtracting ? (
              <ArrowsClockwise className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileArrowUp weight="bold" className="w-3.5 h-3.5" />
            )}
            Import Doc
          </button>
          <button
            onClick={handleNew}
            className="btn-editorial-primary inline-flex items-center gap-2"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            Add Story
          </button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories…"
            className="w-full pl-9 pr-8 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-xs text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-surface-400 focus:bg-surface-0 transition-all font-sans"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-surface-300 hover:text-surface-400"
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
              "px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-all",
              !filterCompetency
                ? "bg-surface-400 text-surface-0 border-surface-400"
                : "bg-surface-50 border-surface-200 text-surface-300 hover:text-surface-400 hover:bg-surface-100"
            )}
          >
            All
          </button>
          {competencies.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCompetency(filterCompetency === c ? null : c)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-mono font-medium capitalize border transition-all",
                filterCompetency === c
                  ? "bg-surface-400 text-surface-0 border-surface-400"
                  : "bg-surface-50 border-surface-200 text-surface-300 hover:text-surface-400 hover:bg-surface-100"
              )}
            >
              {(c || "").replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <div className="card-editorial p-10 text-center">
          <Cards className="w-8 h-8 text-surface-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-surface-400 mb-1 font-display">
            {stories.length === 0 ? "Build your story bank" : "No matching stories"}
          </h3>
          <p className="text-xs text-surface-300 mb-4 max-w-md mx-auto font-sans">
            {stories.length === 0
              ? "STAR stories are your secret weapon for behavioral interviews. Add your best accomplishments here and reuse them across multiple interviews."
              : "Try adjusting your search or filter criteria."}
          </p>
          {stories.length === 0 && (
            <button
              onClick={handleNew}
              className="btn-editorial-primary inline-flex items-center gap-2"
            >
              <Plus weight="bold" className="w-3.5 h-3.5" />
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
                className="card-editorial overflow-hidden p-0"
              >
                {/* Card Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-surface-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : story.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="text-sm font-display font-bold text-surface-400">{story.title}</h3>
                        <span
                          className={cn(
                            "eyebrow-tag border capitalize",
                            getCompetencyStyle(story.competency)
                          )}
                        >
                          {(story.competency || "").replace(/-/g, " ")}
                        </span>
                      </div>

                      {/* Tags */}
                      {(story.tags || []).length > 0 && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Tag weight="bold" className="w-3 h-3 text-surface-300" />
                          {(story.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-100 text-surface-400 border border-surface-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Metrics preview */}
                      {story.metrics && (
                        <p className="text-xs text-surface-300 flex items-center gap-1.5 font-mono">
                          <ChartBar className="w-3.5 h-3.5 text-pastel-green-fg" weight="fill" />
                          {story.metrics}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-center font-mono">
                        <p className="text-sm font-bold text-surface-400 tabular-nums">{story.used_count}</p>
                        <p className="text-[9px] text-surface-300 uppercase tracking-widest">uses</p>
                      </div>
                      {isExpanded ? (
                        <CaretUp weight="bold" className="w-4 h-4 text-surface-300" />
                      ) : (
                        <CaretDown weight="bold" className="w-4 h-4 text-surface-300" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded STAR Detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-surface-200 pt-4 bg-surface-50/50 space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { label: "Situation", content: story.situation },
                        { label: "Task", content: story.task },
                        { label: "Action", content: story.action },
                        { label: "Result", content: story.result },
                      ].map((section) => (
                        <div key={section.label} className="p-3 rounded-md bg-surface-0 border border-surface-200">
                          <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-400 mb-1">
                            {section.label}
                          </h4>
                          <p className="text-xs text-surface-400 leading-relaxed font-sans">
                            {section.content || "—"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-surface-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(story.id);
                        }}
                        className="btn-editorial-secondary inline-flex items-center gap-1.5"
                      >
                        <PenNib weight="bold" className="w-3.5 h-3.5" />
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
                        className="px-3 py-1.5 rounded-md border border-pastel-red-fg/20 bg-pastel-red-bg text-pastel-red-fg text-xs font-mono font-semibold uppercase tracking-wider hover:bg-red-100 transition-all inline-flex items-center gap-1.5"
                      >
                        <Trash weight="bold" className="w-3.5 h-3.5" />
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
