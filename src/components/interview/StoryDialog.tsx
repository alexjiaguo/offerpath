"use client";

import { useState, useEffect } from "react";
import { X } from '@phosphor-icons/react';
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
 <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

 {/* Dialog */}
 <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-0 border border-surface-200 rounded-lg shadow-xl animate-scale-in">
 {/* Header */}
 <div className="sticky top-0 bg-surface-0 border-b border-surface-200 px-6 py-4 flex items-center justify-between z-10">
 <h2 className="text-base font-display font-bold text-surface-400">
 {editingStoryId ? "Edit Story" : "Add New Story"}
 </h2>
 <button
 onClick={onClose}
 className="p-1 rounded-md text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Form */}
 <div className="px-6 py-5 space-y-4">
 {/* Title */}
 <div>
 <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-surface-300 mb-1">
 Story Title *
 </label>
 <input
 type="text"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="e.g., Led ad platform revenue growth 3x"
 className="w-full px-3 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-xs text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-surface-400 font-sans"
 />
 </div>

 {/* Competency */}
 <div>
 <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-surface-300 mb-1">
 Competency
 </label>
 <div className="flex flex-wrap gap-1.5">
 {COMPETENCY_OPTIONS.map((c) => (
 <button
 key={c}
 onClick={() => setCompetency(c)}
 className={cn(
 "px-2.5 py-1 rounded-md text-[11px] font-mono font-medium capitalize border transition-all",
 competency === c
 ? "bg-surface-400 text-surface-0 border-surface-400"
 : "bg-surface-50 border-surface-200 text-surface-300 hover:text-surface-400 hover:bg-surface-100"
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
 { label: "Situation", value: situation, setter: setSituation, placeholder: "Set the context — what was the challenge or opportunity?" },
 { label: "Task", value: task, setter: setTask, placeholder: "What was your specific responsibility?" },
 { label: "Action", value: action, setter: setAction, placeholder: "What steps did you take? Be specific." },
 { label: "Result", value: result, setter: setResult, placeholder: "What was the outcome? Include numbers." },
 ].map((field) => (
 <div key={field.label}>
 <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-surface-300 mb-1">
 {field.label}
 </label>
 <textarea
 value={field.value}
 onChange={(e) => field.setter(e.target.value)}
 placeholder={field.placeholder}
 rows={4}
 className="w-full px-3 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-xs text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-surface-400 font-sans resize-none"
 />
 </div>
 ))}
 </div>

 {/* Metrics */}
 <div>
 <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-surface-300 mb-1">
 Key Metrics
 </label>
 <input
 type="text"
 value={metrics}
 onChange={(e) => setMetrics(e.target.value)}
 placeholder="e.g., 3x revenue growth, 40% CTR improvement"
 className="w-full px-3 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-xs text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-surface-400 font-sans"
 />
 </div>

 {/* Tags */}
 <div>
 <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-surface-300 mb-1">
 Tags (comma-separated)
 </label>
 <input
 type="text"
 value={tagsInput}
 onChange={(e) => setTagsInput(e.target.value)}
 placeholder="e.g., revenue, growth, ad-tech"
 className="w-full px-3 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-xs text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-surface-400 font-sans"
 />
 </div>
 </div>

 {/* Footer */}
 <div className="sticky bottom-0 bg-surface-0 border-t border-surface-200 px-6 py-4 flex items-center justify-end gap-3">
 <button
 onClick={onClose}
 className="btn-editorial-secondary"
 >
 Cancel
 </button>
 <button
 onClick={handleSubmit}
 disabled={!title.trim()}
 className="btn-editorial-primary disabled:opacity-40"
 >
 {editingStoryId ? "Save" : "Add Story"}
 </button>
 </div>
 </div>
 </div>
 );
}
