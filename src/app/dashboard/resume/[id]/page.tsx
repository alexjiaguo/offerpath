"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, ArrowsIn, ArrowsOut, CaretDown, WarningCircle, Eye, EyeSlash, FloppyDisk } from '@phosphor-icons/react';
import { useResumeStore, PLACEHOLDER_RESUME_DATA } from "@/store/resumeStore";
import { useProfileStore } from "@/store/profileStore";
import { cn } from "@/lib/utils";
import type { ResumeTheme, SectionKey, ResumeData } from "@/types";
import ExportButtons from "@/components/resume/ExportButtons";
import ResumePreview, {
 TEMPLATE_CONFIGS,
} from "@/components/resume/ResumePreview";
import ThemePicker from "@/components/resume/ThemePicker";
import AITailoringCard from "@/components/resume/AITailoringCard";
import ValidationPanel from "@/components/resume/ValidationPanel";
import PageFitIndicator from "@/components/resume/PageFitIndicator";
import type { TailorResult } from "@/lib/aiService";
import { saveResumeAction } from "@/app/actions/resume";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import { useDebouncedValue, metaFor, isResumeEmpty, SECTION_META } from "@/components/resume/editor-helpers";
import { SortableSectionTab } from "@/components/resume/SortableSectionTab";
import { AutoScaledPreview } from "@/components/resume/AutoScaledPreview";
import { ResumeSectionEditors } from "@/components/resume/ResumeSectionEditors";
import { generateAtsPlainText } from "@/lib/atsTextLayer";


export default function ResumeEditorPage({
 params,
}: {
 params: Promise<{ id: string }>;
}) {
 const { id } = use(params);
 const { 
 getResumeById, 
 updateResume, 
 undo,
 saveToHistory,
 toggleVisibility,
 } = useResumeStore();
 const { getProfileSummary } = useProfileStore();
 const resume = getResumeById(id);

 const [saved, setSaved] = useState(false);
 const [activeSection, setActiveSection] = useState<string>("personal");
 const [showPreview, setShowPreview] = useState(true);
 const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
 const [editorWidth, setEditorWidth] = useState(450);
 const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);
 const [isResizing, setIsResizing] = useState(false);
 const [mounted, setMounted] = useState(false);
 useEffect(() => { setMounted(true); }, []);

 useEffect(() => {
 const onMove = (e: PointerEvent) => {
 if (!dragStateRef.current) return;
 const delta = e.clientX - dragStateRef.current.startX;
 const max = Math.max(280, Math.floor(window.innerWidth * 0.65));
 setEditorWidth(Math.min(max, Math.max(280, dragStateRef.current.startWidth + delta)));
 };
 const onUp = () => { dragStateRef.current = null; setIsResizing(false); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
 window.addEventListener("pointermove", onMove);
 window.addEventListener("pointerup", onUp);
 window.addEventListener("pointercancel", onUp);
 return () => {
 window.removeEventListener("pointermove", onMove);
 window.removeEventListener("pointerup", onUp);
 window.removeEventListener("pointercancel", onUp);
 };
 }, []);
 const [selectedTemplate, setSelectedTemplate] = useState<string>(
 resume?.template || "classic-minimal"
 );

 const [confirmDelete, setConfirmDelete] = useState<null | { type: "experience" | "education"; index: number }>(null);

 const previewData = useDebouncedValue(resume?.data, 200);

 useEffect(() => {
 if (!isFullscreenPreview) return;
 const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFullscreenPreview(false); };
 document.addEventListener("keydown", onKey);
 document.body.style.overflow = "hidden";
 return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
 }, [isFullscreenPreview]);

 const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

 const themeColor = resume?.theme?.primaryColor || undefined;

 if (!resume) {
 return (
 <div className="w-full animate-fade-in">
 <div className="card-editorial rounded-2xl p-12 text-center">
 <WarningCircle className="w-10 h-10 text-surface-400 mx-auto mb-4" />
 <h2 className="text-lg font-semibold mb-2">Resume not found</h2>
 <Link href="/dashboard/resume" className="text-sm text-brand-400 hover:text-brand-300">
 - Back to Resumes
 </Link>
 </div>
 </div>
 );
 }

 const data = resume.data;
 const resumeIsEmpty = isResumeEmpty(data);
 const effectiveData: ResumeData = resumeIsEmpty ? PLACEHOLDER_RESUME_DATA : data;

 const handleSave = async () => {
 updateResume(id, { template: selectedTemplate });
 const currentResume = getResumeById(id);
 if (currentResume) {
 const result = await saveResumeAction(id, { ...currentResume, template: selectedTemplate });
 if (!result.success) {
 toast.error("Saved locally, but failed to sync to backend");
 }
 }
 setSaved(true);
 setTimeout(() => setSaved(false), 2000);
 };

 const handleApplyTailor = (result: TailorResult) => {
 updateResume(id, {
 data: { ...data, summary: result.summary, experience: result.experience },
 });
 toast.success("AI tailoring applied to resume");
 };

 const sectionOrder = resume.section_order || [
 "summary", "experience", "education", "technicalSkills", "skills", "languages", "certifications", "projects"
 ];

 const editableOrder: string[] = sectionOrder.filter((k): boolean => SECTION_META.some((m) => m.key === k));
 const tabItems = ["personal", ...editableOrder];

 const handleSectionDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
 const { active, over } = event;
 if (!over || active.id === over.id) return;
 const oldIndex = editableOrder.indexOf(String(active.id));
 const newIndex = editableOrder.indexOf(String(over.id));
 if (oldIndex < 0 || newIndex < 0) return;
 const newOrder = arrayMove(editableOrder, oldIndex, newIndex);
 saveToHistory(id);
 updateResume(id, { section_order: newOrder as SectionKey[] });
 };

 return (
 <div className="animate-fade-in pb-20 w-full">
 {/* Immersive Fullscreen Preview */}
 <AnimatePresence>
 {isFullscreenPreview && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-surface-0 flex flex-col">
 <div className="h-20 flex items-center justify-between px-8 border-b border-white/[0.03] bg-surface-0/80 backdrop-blur-xl">
 <div className="flex items-center gap-4">
 <button onClick={() => setIsFullscreenPreview(false)} className="p-2 rounded-xl bg-surface-100 border border-surface-200 text-surface-300 hover:text-surface-400 transition-all">
 <ArrowsIn className="w-5 h-5" />
 </button>
 <div>
 <h2 className="text-lg font-bold text-surface-400 font-display">{resume.title}</h2>
 <p className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">Full Page Visualization</p>
 </div>
 </div>
  <div className="flex items-center gap-4">
  <div className="px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest">Live Preview</div>
  </div>
  </div>
  <div className="flex-1 overflow-auto bg-surface-400/50 p-12 flex justify-center">
 <div className="w-full max-w-5xl shadow-[0_0_80px_rgba(0,0,0,0.5)] h-fit">
 <ResumePreview data={previewData ?? effectiveData} template={selectedTemplate} themeColor={themeColor} sectionOrder={sectionOrder as SectionKey[]} sectionVisibility={resume.section_visibility?.[selectedTemplate]} className="w-full" fullScale />
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Header - back + title only */}
 <div className="flex items-center gap-3 mb-5">
 <Link href="/dashboard/resume" className="p-2.5 rounded-xl bg-white border border-surface-200 text-surface-300 hover:text-surface-400 transition-all" aria-label="Back to resumes">
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <div className="min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300">{resume.is_base ? "Base Resume" : "Tailored Resume"}</span>
 {resumeIsEmpty && <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Sample preview</span>}
 </div>
 <h1 className="text-xl sm:text-2xl font-bold text-surface-400 font-display tracking-tight leading-tight">{resume.title}</h1>
 </div>
 </div>

 {/* Main Content - editor + preview */}
 <div className="flex w-full">
 {/* Left: Editor (fixed width, resizable) */}
 <div className="space-y-3 shrink-0 min-w-0" style={{ width: editorWidth }}>
 {/* Row 1: Template picker + Visual DNA (same height) */}
 <div className="flex items-center gap-2">
 <div className="relative flex-1 min-w-[100px]">
 <select value={selectedTemplate} onChange={(e) => { saveToHistory(id); setSelectedTemplate(e.target.value); updateResume(id, { template: e.target.value }); }} className="w-full appearance-none bg-surface-50 border border-surface-200 text-surface-400 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer focus:outline-none focus:border-brand-500/50 hover:bg-surface-100 transition-all truncate">
 {TEMPLATE_CONFIGS.map((tmpl) => (<option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>))}
 </select>
 <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-surface-300"><CaretDown className="w-3.5 h-3.5" /></div>
 </div>
 <ThemePicker theme={resume.theme} onChange={(updates) => { saveToHistory(id); updateResume(id, { theme: { ...resume.theme, ...updates } as ResumeTheme }); }} preview={<ResumePreview data={previewData ?? effectiveData} template={selectedTemplate} themeColor={themeColor} sectionOrder={sectionOrder as SectionKey[]} sectionVisibility={resume.section_visibility?.[selectedTemplate]} />} />
 </div>

 {/* Row 2: AI Tailoring (prominent, full-width) */}
 <AITailoringCard resumeData={data} resumeId={id} profileSummary={getProfileSummary()} onApply={handleApplyTailor} saveToHistory={saveToHistory} />

  {/* Row 3: Status Indicators (left) + Save & Export (right) */}
  <div className="flex flex-wrap items-center justify-between gap-2">
  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
  <ValidationPanel data={data} />
  <PageFitIndicator />
  </div>
  <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
  <button onClick={handleSave} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", saved ? "bg-emerald-500/15 text-emerald-400" : "bg-surface-400 text-white hover:bg-surface-400")}>
  <FloppyDisk className="w-3 h-3" />
  {saved ? "Saved" : "Save"}
  </button>
  <ExportButtons resumeData={data} resumeTitle={resume.title} />
  </div>
  </div>


 {mounted ? (
 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
 <SortableContext items={tabItems} strategy={rectSortingStrategy}>
 <div className="flex flex-wrap gap-1 bg-surface-50 border border-surface-200 rounded-xl p-1">
 {tabItems.map((tabId) => {
 const meta = metaFor(tabId);
 const isVisible = (resume.section_visibility?.[selectedTemplate]?.[tabId as SectionKey]) ?? true;
 const isPersonal = tabId === "personal";
 return (
 <SortableSectionTab key={tabId} tabId={tabId} label={meta.label} Icon={meta.icon} isActive={activeSection === tabId} isVisible={isVisible} canToggle={!isPersonal} disabled={isPersonal} onClick={() => setActiveSection(tabId)} onToggleVisibility={() => toggleVisibility(id, selectedTemplate, tabId as SectionKey)} />
 );
 })}
 </div>
 </SortableContext>
 </DndContext>
 ) : (
 <div className="flex flex-wrap gap-1 bg-surface-50 border border-surface-200 rounded-xl p-1">
 {tabItems.map((tabId) => {
 const meta = metaFor(tabId);
 const isVisible = (resume.section_visibility?.[selectedTemplate]?.[tabId as SectionKey]) ?? true;
 const isPersonal = tabId === "personal";
 return (
 <div key={tabId} role="tab" aria-selected={activeSection === tabId} onClick={() => setActiveSection(tabId)} className={cn("group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap select-none", activeSection === tabId ? "bg-surface-400 text-white shadow-sm" : "text-surface-300 hover:bg-surface-100 hover:text-surface-400", !isVisible && "opacity-45")}>
 <meta.icon className="w-3.5 h-3.5" />
 {meta.label}
 {!isPersonal && (
 <button onClick={(e) => { e.stopPropagation(); toggleVisibility(id, selectedTemplate, tabId as SectionKey); }} onPointerDown={(e) => e.stopPropagation()} title={isVisible ? "Hide section" : "Show section"} className={cn("p-0.5 rounded transition-opacity", activeSection === tabId ? "text-white/60 hover:text-white" : "text-surface-300 hover:text-surface-400", isVisible ? "opacity-0 group-hover:opacity-100" : "opacity-100")}>
 {isVisible ? <Eye className="w-3 h-3" /> : <EyeSlash className="w-3 h-3" />}
 </button>
 )}
 </div>
 );
 })}
 </div>
 )}

 <ResumeSectionEditors activeSection={activeSection} data={data} resumeId={id} updateResume={updateResume} saveToHistory={saveToHistory} undo={undo} setConfirmDelete={setConfirmDelete} />
 </div>

 {/* Drag handle */}
 {showPreview && (
 <div role="separator" aria-orientation="vertical" aria-label="Resize editor panel (double-click to reset)" aria-valuenow={editorWidth} aria-valuemin={280} aria-valuemax={Math.max(280, Math.floor(window.innerWidth * 0.65))} onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); dragStateRef.current = { startX: e.clientX, startWidth: editorWidth }; setIsResizing(true); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }} onDoubleClick={() => setEditorWidth(450)} className="relative flex w-3 mx-1 self-stretch items-center justify-center cursor-col-resize group touch-none" title="Drag to resize - double-click to reset">
 <div className={cn("w-1 h-full rounded-full transition-colors", isResizing ? "bg-brand-500" : "bg-surface-200 group-hover:bg-brand-500/60")} />
 {isResizing && (
 <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-1.5 py-0.5 rounded-md bg-surface-400 text-white text-[10px] font-bold tabular-nums pointer-events-none shadow-lg">{editorWidth}px</div>
 )}
 </div>
 )}

 {/* Right: Preview */}
 {showPreview && (
 <div className="flex-1 min-w-0">
 <div className="relative bg-surface-50 rounded-2xl p-3 sm:p-5 border border-surface-200 shadow-inner overflow-hidden min-h-[600px] flex justify-center">
 <button onClick={() => setIsFullscreenPreview(true)} className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-surface-0/80 backdrop-blur border border-surface-200 text-surface-300 hover:text-surface-400 transition-all group" title="Fullscreen Preview">
 <ArrowsOut className="w-4 h-4 group-hover:scale-110" />
 </button>
 <AutoScaledPreview>
 <ResumePreview data={previewData ?? effectiveData} template={selectedTemplate} themeColor={themeColor} sectionOrder={sectionOrder as SectionKey[]} sectionVisibility={resume.section_visibility?.[selectedTemplate]} className="w-full shadow-2xl" fullScale />
 </AutoScaledPreview>
 </div>
 </div>
 )}
 </div>

 {/* Print-only full-scale preview for faithful PDF export */}
 <div className="print-resume hidden print:block">
 <ResumePreview data={effectiveData} template={selectedTemplate} themeColor={themeColor} sectionOrder={sectionOrder as SectionKey[]} sectionVisibility={resume.section_visibility?.[selectedTemplate]} fullScale />
 {/* ATS plaintext layer: near-invisible text for ATS parser compatibility */}
 <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', fontSize: '1px', lineHeight: 0, color: '#ffffff', overflow: 'hidden', pointerEvents: 'none', opacity: 0.01, zIndex: -1 }}>
 <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, padding: 0 }}>{generateAtsPlainText(effectiveData)}</pre>
 </div>
 </div>

 {/* Delete confirmation */}
 {confirmDelete && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={() => setConfirmDelete(null)}>
 <div className="bg-surface-50 border border-white/[0.08] rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
 <h3 className="text-base font-bold text-surface-400 mb-2">Delete this entry?</h3>
 <p className="text-sm text-surface-300 mb-6">This can be undone with the undo button.</p>
 <div className="flex gap-3">
 <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-xl text-sm font-bold text-surface-300 bg-surface-100 border border-surface-200 hover:bg-surface-200 transition-all uppercase tracking-widest">Cancel</button>
 <button onClick={() => { saveToHistory(id); if (confirmDelete.type === "experience") { const next = [...(data.experience || [])]; next.splice(confirmDelete.index, 1); updateResume(id, { data: { ...data, experience: next } }); } else { const next = [...(data.education || [])]; next.splice(confirmDelete.index, 1); updateResume(id, { data: { ...data, education: next } }); } setConfirmDelete(null); }} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all uppercase tracking-widest">Delete</button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
