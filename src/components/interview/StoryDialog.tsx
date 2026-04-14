"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useInterviewStore } from "@/store/interviewStore";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   Story Dialog — Add/Edit STAR stories
   ═══════════════════════════════════════════════════ */

const COMPETENCY_OPTIONS = [
  "leadership",
  "conflict-resolution",
  "technical",
  "analytical",
  "culture",
  "communication",
  "execution",
  "innovation",
  "teamwork",
  "problem-solving",
];

interface StoryDialogProps {
  open: boolean;
  onClose: () => void;
  editingStoryId: string | null;
}

export default function StoryDialog({ open, onClose, editingStoryId }: StoryDialogProps) {
  const { addStory, updateStory, getStoryById } = useInterviewStore();

  const [title, setTitle] = useState("");
  const [competency, setCompetency] = useState("leadership");
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [metrics, setMetrics] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Load existing story data when editing
  useEffect(() => {
    if (editingStoryId) {
      const story = getStoryById(editingStoryId);
      if (story) {
        setTitle(story.title);
        setCompetency(story.competency);
        setSituation(story.situation || "");
        setTask(story.task || "");
        setAction(story.action || "");
        setResult(story.result || "");
        setMetrics(story.metrics || "");
        setTagsInput(story.tags.join(", "));
      }
    } else {
      // Reset form
      setTitle("");
      setCompetency("leadership");
      setSituation("");
      setTask("");
      setAction("");
      setResult("");
      setMetrics("");
      setTagsInput("");
    }
  }, [editingStoryId, open, getStoryById]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const storyData = {
      title: title.trim(),
      competency,
      situation: situation.trim() || undefined,
      task: task.trim() || undefined,
      action: action.trim() || undefined,
      result: result.trim() || undefined,
      metrics: metrics.trim() || undefined,
      tags,
    };

    if (editingStoryId) {
      updateStory(editingStoryId, storyData);
    } else {
      addStory(storyData);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-50 border border-white/[0.08] rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-surface-50 border-b border-white/[0.04] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">
            {editingStoryId ? "Edit Story" : "Add New Story"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-zinc-700 dark:hover:text-gray-300 hover:bg-white/[0.04] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
              Story Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Led ad platform revenue growth 3x"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>

          {/* Competency */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
              Competency
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMPETENCY_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCompetency(c)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                    competency === c
                      ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                      : "bg-surface-200 text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-zinc-700 dark:hover:text-gray-300 border border-transparent"
                  )}
                >
                  {c.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* STAR Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Situation", value: situation, setter: setSituation, color: "border-blue-500/20", placeholder: "Set the context — what was the challenge or opportunity?" },
              { label: "Task", value: task, setter: setTask, color: "border-amber-500/20", placeholder: "What was your specific responsibility?" },
              { label: "Action", value: action, setter: setAction, color: "border-emerald-500/20", placeholder: "What steps did you take? Be specific." },
              { label: "Result", value: result, setter: setResult, color: "border-purple-500/20", placeholder: "What was the outcome? Include numbers." },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
                  {field.label}
                </label>
                <textarea
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-xl bg-surface-100 border text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none",
                    field.color
                  )}
                />
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
              Key Metrics
            </label>
            <input
              type="text"
              value={metrics}
              onChange={(e) => setMetrics(e.target.value)}
              placeholder="e.g., 3x revenue growth, 40% CTR improvement"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., revenue, growth, ad-tech"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface-50 border-t border-white/[0.04] px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-surface-200 text-zinc-700 dark:text-gray-300 text-sm font-medium hover:text-zinc-900 dark:hover:text-white hover:bg-surface-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {editingStoryId ? "Save Changes" : "Add Story"}
          </button>
        </div>
      </div>
    </div>
  );
}
