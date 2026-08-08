"use client";

import { useState } from "react";
import { Camera, Plus, Trash, User, X, TextT, PenNib } from "@phosphor-icons/react";
import Image from "next/image";
import { toast } from "sonner";
import type { ResumeData, ExperienceEntry, EducationEntry, ProjectEntry, TechnicalSkillCategory } from "@/types";
import dynamic from "next/dynamic";
import type { EditorMode } from "@/components/resume/editor-helpers";
import { cn } from "@/lib/utils";

const RichTextEditor = dynamic(() => import("@/components/resume/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="rounded-xl bg-surface-100 border border-surface-200 p-8 flex items-center justify-center min-h-[200px]"><div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>,
});
const RichTextField = dynamic(() => import("@/components/resume/RichTextField"), {
  ssr: false,
  loading: () => <div className="rounded-xl bg-surface-100 border border-surface-200 p-4 min-h-[80px]" />,
});

interface ResumeSectionEditorsProps {
  activeSection: string;
  data: ResumeData;
  resumeId: string;
  updateResume: (id: string, updates: { data: ResumeData }) => void;
  saveToHistory: (id: string) => void;
  undo: (id: string) => void;
  setConfirmDelete: (val: { type: "experience" | "education"; index: number } | null) => void;
  editorMode?: EditorMode;
}

function SectionHeader({
  title,
  mode,
  onModeChange,
  onAdd,
  hasRichText = true,
}: {
  title: string;
  mode: EditorMode;
  onModeChange: (m: EditorMode) => void;
  onAdd?: () => void;
  hasRichText?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 pb-3 border-b border-surface-200 mb-5">
      <h2 className="text-sm font-bold font-display text-surface-400 uppercase tracking-widest min-w-0 truncate">
        {title}
      </h2>
      <div className="flex items-center gap-2 flex-shrink-0">
        {hasRichText && (
          <div className="flex items-center bg-white border border-surface-200 rounded-lg p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => onModeChange("form")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                mode === "form" ? "bg-surface-200 text-surface-400 shadow-xs" : "text-surface-300 hover:text-surface-400"
              )}
            >
              <TextT className="w-3 h-3" /> Form
            </button>
            <button
              type="button"
              onClick={() => onModeChange("richtext")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                mode === "richtext" ? "bg-brand-500 text-white shadow-xs" : "text-surface-300 hover:text-surface-400"
              )}
            >
              <PenNib className="w-3 h-3" /> Rich Text
            </button>
          </div>
        )}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="p-1.5 rounded-xl bg-surface-50 border border-surface-200 text-surface-300 hover:bg-surface-100 hover:text-surface-400 transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
            title="Add entry"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ResumeSectionEditors({
  activeSection,
  data,
  resumeId: id,
  updateResume,
  saveToHistory,
  undo,
  setConfirmDelete,
  editorMode = "form",
}: ResumeSectionEditorsProps) {
  const [sectionModes, setSectionModes] = useState<Record<string, EditorMode>>({});
  const currentMode = sectionModes[activeSection] || editorMode || "form";
  const setSectionMode = (mode: EditorMode) => {
    setSectionModes((prev) => ({ ...prev, [activeSection]: mode }));
  };

  const updateField = (section: keyof ResumeData, field: string, value: unknown) => {
    updateResume(id, {
      data: {
        ...data,
        [section]:
          section === "personal"
            ? { ...(data.personal || {}), [field]: value }
            : value,
      },
    });
  };

  const isRichText = currentMode === "richtext";
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
  const stripPTags = (html: string) => html.replace(/<\/p>/g, '').replace(/<p>/g, '');
  const ensureHtml = (content: string) => {
    if (!content) return '<p></p>';
    if (content.startsWith('<')) return content;
    return `<p>${content}</p>`;
  };

  return (
   <div className="card-editorial rounded-2xl p-5 animate-fade-in min-h-[500px]">
   {/* Personal Info */}
   {activeSection === "personal" && (
   <div className="space-y-6">
    <SectionHeader title="Personal Details" mode={currentMode} onModeChange={setSectionMode} hasRichText={false} />
  
   {/* Headshot — used by photo-based templates (Premium Headshot, Photo Header, etc.) */}
   <div className="flex items-center gap-4">
   <div className="relative w-20 h-20 rounded-md overflow-hidden bg-surface-100 border border-surface-200 flex-shrink-0">
   {data.personal?.photo_url ? (
   <Image src={data.personal.photo_url} alt="Headshot" fill className="object-cover" sizes="80px" />
   ) : (
   <div className="w-full h-full flex items-center justify-center text-surface-300">
   <User className="w-7 h-7" />
   </div>
   )}
   </div>
   <div className="flex-1 min-w-0 space-y-2">
   <p className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">Headshot <span className="text-surface-300 normal-case font-medium">· used by photo templates</span></p>
   <div className="flex items-center gap-2 flex-wrap">
   <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-200 text-[10px] font-bold uppercase tracking-widest text-surface-400 hover:bg-surface-100 cursor-pointer transition-all">
   <Camera className="w-3.5 h-3.5" />
   Upload
   <input
   type="file"
   accept="image/*"
   className="hidden"
   onChange={(e) => {
   const file = e.target.files?.[0];
   if (!file) return;
   if (file.size > 2 * 1024 * 1024) {
   toast.error("Image must be under 2MB");
   return;
   }
   const reader = new FileReader();
   reader.onload = () => {
   saveToHistory(id);
   updateField("personal", "photo_url", String(reader.result || ""));
   };
   reader.readAsDataURL(file);
   }}
   />
   </label>
   {data.personal?.photo_url && (
   <button
   onClick={() => { saveToHistory(id); updateField("personal", "photo_url", ""); }}
   className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-surface-300 hover:text-red-500 transition-all"
   >
   Remove
   </button>
   )}
   </div>
   </div>
   </div>
  
   <div className="space-y-4">
   {[
   { label: "Full Name", field: "name", value: data.personal?.name || "" },
   { label: "Email", field: "email", value: data.personal?.email || "" },
   { label: "Phone", field: "phone", value: data.personal?.phone || "" },
   { label: "Location", field: "location", value: data.personal?.location || "" },
   { label: "LinkedIn", field: "linkedin", value: data.personal?.linkedin || "" },
   { label: "Website", field: "website", value: data.personal?.website || "" },
   ].map((input) => (
   <div key={input.field} className="space-y-1.5">
   <label className="block text-[9px] font-bold text-surface-300 uppercase tracking-widest ml-1">{input.label}</label>
   <input
   type="text"
   value={input.value as string}
   onBlur={() => saveToHistory(id)}
   onChange={(e) => updateField("personal", input.field, e.target.value)}
   className="w-full px-4 py-2.5 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:bg-surface-100 transition-all font-sans"
   />
   </div>
   ))}
   
   {/* Custom Fields */}
   {(data.personal?.custom_fields || []).length > 0 && (
   <div className="space-y-3 pt-2 border-t border-surface-200">
   <label className="block text-[9px] font-bold text-surface-300 uppercase tracking-widest ml-1">Custom Fields</label>
   {(data.personal?.custom_fields || []).map((cf, ci) => (
   <div key={ci} className="flex items-center gap-2">
   <input
   type="text"
   value={cf.label}
   onBlur={() => saveToHistory(id)}
   onChange={(e) => {
   const fields = [...(data.personal?.custom_fields || [])];
   fields[ci] = { ...fields[ci], label: e.target.value };
   updateField("personal", "custom_fields", fields);
   }}
   placeholder="Label"
   className="w-1/3 px-3 py-2 rounded-xl bg-white border border-surface-200 text-xs font-bold text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all font-sans"
   />
   <input
   type="text"
   value={cf.value}
   onBlur={() => saveToHistory(id)}
   onChange={(e) => {
   const fields = [...(data.personal?.custom_fields || [])];
   fields[ci] = { ...fields[ci], value: e.target.value };
   updateField("personal", "custom_fields", fields);
   }}
   placeholder="Value"
   className="flex-1 px-3 py-2 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all font-sans"
   />
   <button
   onClick={() => { saveToHistory(id); const fields = [...(data.personal?.custom_fields || [])]; fields.splice(ci, 1); updateField("personal", "custom_fields", fields); }}
   className="p-1.5 text-surface-400 hover:text-red-500 transition-colors"
   >
   <X className="w-3.5 h-3.5" />
   </button>
   </div>
   ))}
   </div>
   )}
   
   <button
   onClick={() => { saveToHistory(id); const fields = [...(data.personal?.custom_fields || []), { label: "", value: "" }]; updateField("personal", "custom_fields", fields); }}
   className="text-[10px] font-bold text-brand-500 hover:text-brand-400 transition-colors uppercase tracking-widest"
   >
   + Add Custom Field
   </button>
   </div>
   </div>
   )}
  
   {/* Summary */}
   {activeSection === "summary" && (
   <div className="space-y-6">
    <SectionHeader title="Professional Summary" mode={currentMode} onModeChange={setSectionMode} hasRichText={true} />
   {isRichText ? (
   <RichTextEditor
   content={ensureHtml(data.summary || "")}
   onChange={(html) => updateResume(id, { data: { ...data, summary: html } })}
   />
   ) : (
   <textarea
   value={stripHtml(data.summary || "")}
   onBlur={() => saveToHistory(id)}
   onChange={(e) => updateResume(id, { data: { ...data, summary: e.target.value } })}
   placeholder="Write a brief professional summary..."
   rows={12}
   className="w-full px-5 py-4 rounded-2xl bg-white border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:bg-surface-50 transition-all resize-none leading-relaxed font-sans"
   />
   )}
   </div>
   )}
  
   {/* Experience */}
   {activeSection === "experience" && (
   <div className="space-y-6">
    <SectionHeader title="Work Experience" mode={currentMode} onModeChange={setSectionMode} hasRichText={true} onAdd={() => {
    saveToHistory(id);
    const newExp: ExperienceEntry = { company: "", title: "", location: "", start_date: "", end_date: "", current: false, bullets: [""] };
    updateResume(id, { data: { ...data, experience: [...(data.experience || []), newExp] } });
    }} />
   <div className="space-y-4">
   {(data.experience || []).map((exp, index) => (
   <div key={`exp-${index}`} className="p-4 sm:p-6 rounded-[24px] bg-surface-50 border border-surface-200 group/item relative">
   <button
   onClick={() => setConfirmDelete({ type: "experience", index })}
   className="absolute top-4 right-4 p-1.5 rounded-lg text-surface-400 hover:text-red-500 opacity-70 group-hover/item:opacity-100 transition-all"
   >
   <Trash className="w-4 h-4" />
   </button>
   <div className="space-y-4">
   <div className="pr-8">
   <input type="text" value={exp.title} onBlur={() => saveToHistory(id)} onChange={(e) => {
   const newExps = [...(data.experience || [])];
   newExps[index] = { ...newExps[index], title: e.target.value };
   updateResume(id, { data: { ...data, experience: newExps } });
   }} placeholder="Job Title" className="w-full bg-transparent border-none p-0 text-base font-bold text-surface-400 focus:ring-0 placeholder:text-surface-300" />
   
   <input type="text" value={exp.company} onBlur={() => saveToHistory(id)} onChange={(e) => {
   const newExps = [...(data.experience || [])];
   newExps[index] = { ...newExps[index], company: e.target.value };
   updateResume(id, { data: { ...data, experience: newExps } });
   }} placeholder="Company" className="w-full bg-transparent border-none p-0 mt-1 text-sm text-surface-300 focus:ring-0 placeholder:text-surface-300" />
   </div>
  
   <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-200">
   <div>
   <label className="block text-[10px] font-bold text-surface-300 uppercase tracking-widest pl-1 mb-1">Start Date</label>
   <input type="text" value={exp.start_date} onBlur={() => saveToHistory(id)} onChange={(e) => {
   const newExps = [...(data.experience || [])];
   newExps[index] = { ...newExps[index], start_date: e.target.value };
   updateResume(id, { data: { ...data, experience: newExps } });
   }} placeholder="e.g. Jan 2020" className="w-full px-3 py-2 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:bg-surface-100 transition-all font-sans placeholder:text-surface-300" />
   </div>
   <div>
   <label className="block text-[10px] font-bold text-surface-300 uppercase tracking-widest pl-1 mb-1">End Date</label>
   <input type="text" value={exp.end_date} onBlur={() => saveToHistory(id)} onChange={(e) => {
   const newExps = [...(data.experience || [])];
   newExps[index] = { ...newExps[index], end_date: e.target.value };
   updateResume(id, { data: { ...data, experience: newExps } });
   }} placeholder="e.g. Present" className="w-full px-3 py-2 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:bg-surface-100 transition-all font-sans placeholder:text-surface-300" />
   </div>
   </div>
   <div className="pt-2">
   <label className="block text-[10px] font-bold text-surface-300 uppercase tracking-widest pl-1 mb-2">Bullet Points</label>
   {(exp.bullets || [""]).map((bullet, bi) => (
   <div key={`bullet-${index}-${bi}`} className={`mb-2 group/bullet ${isRichText ? 'relative' : 'flex items-start gap-2'}`}>
   {!isRichText && <div className="w-1.5 h-1.5 rounded-full bg-surface-300 mt-2 flex-shrink-0" />}
   {isRichText ? (
   <RichTextField
   content={ensureHtml(bullet)}
   onChange={(html) => {
   const newExps = [...(data.experience || [])];
   const newBullets = [...(newExps[index].bullets || [])];
   newBullets[bi] = stripPTags(html);
   newExps[index] = { ...newExps[index], bullets: newBullets };
   updateResume(id, { data: { ...data, experience: newExps } });
   }}
   placeholder="Describe your achievement..."
   minHeight={60}
   />
   ) : (
   <textarea
   value={stripHtml(bullet)}
   onBlur={() => saveToHistory(id)}
   onChange={(e) => {
   const newExps = [...(data.experience || [])];
   const newBullets = [...(newExps[index].bullets || [])];
   newBullets[bi] = e.target.value;
   newExps[index] = { ...newExps[index], bullets: newBullets };
   updateResume(id, { data: { ...data, experience: newExps } });
   }}
   placeholder="Describe your achievement..."
   rows={2}
   className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:bg-surface-100 transition-all resize-none font-sans placeholder:text-surface-300"
   />
   )}
   <button
   onClick={() => {
   saveToHistory(id);
   const newExps = [...(data.experience || [])];
   const newBullets = [...(newExps[index].bullets || [])];
   newBullets.splice(bi, 1);
   newExps[index] = { ...newExps[index], bullets: newBullets };
   updateResume(id, { data: { ...data, experience: newExps } });
   toast("Bullet removed", { action: { label: "Undo", onClick: () => undo(id) } });
   }}
   className={`${isRichText ? 'absolute top-1 right-1' : 'mt-2'} p-1 text-surface-400 hover:text-red-500 transition-colors opacity-70 group-hover/bullet:opacity-100`}
   >
   <X className="w-3.5 h-3.5" />
   </button>
   </div>
   ))}
   <button
   onClick={() => {
   saveToHistory(id);
   const newExps = [...(data.experience || [])];
   newExps[index] = { ...newExps[index], bullets: [...(newExps[index].bullets || []), ""] };
   updateResume(id, { data: { ...data, experience: newExps } });
   }}
   className="text-[10px] font-bold text-brand-500 hover:text-brand-400 transition-colors uppercase tracking-widest pl-3 mt-1"
   >
   + Add Bullet
   </button>
   </div>
   </div>
   </div>
   ))}
   </div>
   </div>
   )}
  
   {/* Education */}
   {activeSection === "education" && (
   <div className="space-y-6">
   <div className="flex items-center justify-between">
   <h2 className="text-sm font-bold font-display text-surface-400 uppercase tracking-widest">Education</h2>
   <button
   onClick={() => {
   saveToHistory(id);
   const newEdu: EducationEntry = { institution: "", degree: "", field: "", start_date: "", end_date: "" };
   updateResume(id, { data: { ...data, education: [...(data.education || []), newEdu] } });
   }}
   className="p-2 rounded-xl bg-surface-50 border border-surface-200 text-surface-300 hover:bg-surface-100 hover:text-surface-400 transition-all"
   >
   <Plus className="w-4 h-4" />
   </button>
   </div>
  
   <div className="space-y-4">
   {(data.education || []).map((edu, index) => (
   <div key={`edu-${index}`} className="p-4 sm:p-6 rounded-[24px] bg-surface-50 border border-surface-200 group/item relative">
   <button
   onClick={() => setConfirmDelete({ type: "education", index })}
   className="absolute top-4 right-4 p-1.5 rounded-lg text-surface-400 hover:text-red-500 opacity-70 group-hover/item:opacity-100 transition-all"
   >
   <Trash className="w-4 h-4" />
   </button>
   <div className="space-y-4 pr-8">
   <input type="text" value={edu.institution} onBlur={() => saveToHistory(id)} onChange={(e) => {
   const newEdus = [...(data.education || [])];
   newEdus[index] = { ...newEdus[index], institution: e.target.value };
   updateResume(id, { data: { ...data, education: newEdus } });
   }} placeholder="Institution Name" className="w-full bg-transparent border-none p-0 text-base font-bold text-surface-400 focus:ring-0 placeholder:text-surface-300" />
   
   <input type="text" value={edu.degree} onBlur={() => saveToHistory(id)} onChange={(e) => {
   const newEdus = [...(data.education || [])];
   newEdus[index] = { ...newEdus[index], degree: e.target.value };
   updateResume(id, { data: { ...data, education: newEdus } });
   }} placeholder="Degree (e.g. B.S. Computer Science)" className="w-full bg-transparent border-none p-0 text-sm text-surface-300 focus:ring-0 placeholder:text-surface-300" />
  
   <input type="text" value={edu.field} onBlur={() => saveToHistory(id)} onChange={(e) => {
   const newEdus = [...(data.education || [])];
   newEdus[index] = { ...newEdus[index], field: e.target.value };
   updateResume(id, { data: { ...data, education: newEdus } });
   }} placeholder="Field of Study / Major (e.g. Computer Science)" className="w-full bg-transparent border-none p-0 text-sm text-surface-300 focus:ring-0 placeholder:text-surface-300" />
  
   <div className="grid grid-cols-3 gap-3 pt-2 border-t border-surface-200">
   <div>
   <label className="block text-[10px] font-bold text-surface-300 uppercase tracking-widest pl-1 mb-1">Start Date</label>
   <input type="text" value={edu.start_date || ''} onBlur={() => saveToHistory(id)} onChange={(e) => {
   const newEdus = [...(data.education || [])];
   newEdus[index] = { ...newEdus[index], start_date: e.target.value };
   updateResume(id, { data: { ...data, education: newEdus } });
   }} placeholder="e.g. Sep 2020" className="w-full px-3 py-2 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:bg-surface-100 transition-all font-sans placeholder:text-surface-300" />
   </div>
   <div>
   <label className="block text-[10px] font-bold text-surface-300 uppercase tracking-widest pl-1 mb-1">End Date</label>
   <input type="text" value={edu.end_date || ''} onBlur={() => saveToHistory(id)} onChange={(e) => {
   const newEdus = [...(data.education || [])];
   newEdus[index] = { ...newEdus[index], end_date: e.target.value };
   updateResume(id, { data: { ...data, education: newEdus } });
   }} placeholder="e.g. May 2024" className="w-full px-3 py-2 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:bg-surface-100 transition-all font-sans placeholder:text-surface-300" />
   </div>
   <div>
   <label className="block text-[10px] font-bold text-surface-300 uppercase tracking-widest pl-1 mb-1">GPA / Honors</label>
   <input type="text" value={edu.gpa || ''} onBlur={() => saveToHistory(id)} onChange={(e) => {
   const newEdus = [...(data.education || [])];
   newEdus[index] = { ...newEdus[index], gpa: e.target.value };
   updateResume(id, { data: { ...data, education: newEdus } });
   }} placeholder="e.g. 3.9 GPA" className="w-full px-3 py-2 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:bg-surface-100 transition-all font-sans placeholder:text-surface-300" />
   </div>
   </div>
   </div>
   </div>
   ))}
   </div>
   </div>
   )}
  
   {/* Skills */}
   {activeSection === "skills" && (
   <div className="space-y-6">
    <SectionHeader title="Skills" mode={currentMode} onModeChange={setSectionMode} hasRichText={false} />
   
   <div className="flex flex-wrap gap-2">
   {(data.skills || []).map((skill, index) => (
   <div
   key={`skill-${index}`}
   className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-200 text-xs font-bold text-surface-400 group transition-all"
   >
   <span>{typeof skill === 'string' ? skill : skill.name}</span>
   <button
   onClick={() => {
   saveToHistory(id);
   const newSkills = [...(data.skills || [])];
   newSkills.splice(index, 1);
   updateResume(id, { data: { ...data, skills: newSkills } });
   toast("Skill removed", { action: { label: "Undo", onClick: () => undo(id) } });
   }}
   className="text-surface-400 hover:text-red-500 transition-colors opacity-70 group-hover:opacity-100 -mr-1"
   >
   <X className="w-3.5 h-3.5" />
   </button>
   </div>
   ))}
   </div>
   
   <div className="space-y-1.5">
   <label className="block text-[10px] font-bold text-surface-300 uppercase tracking-widest pl-1 mb-1">Add New Skill</label>
   <input
   type="text"
   placeholder="Type a skill and press enter..."
   onKeyDown={(e) => {
   if (
   e.key === "Enter" &&
   (e.target as HTMLInputElement).value.trim()
   ) {
   saveToHistory(id);
   const newSkillName = (
   e.target as HTMLInputElement
   ).value.trim();
   const newSkill = { id: `s-${Date.now()}`, name: newSkillName, isHighlighted: false };
   updateResume(id, {
   data: {
   ...data,
   skills: [...(data.skills || []), newSkill],
   },
   });
   (e.target as HTMLInputElement).value = "";
   }
   }}
   className="w-full px-4 py-3 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:bg-surface-100 transition-all font-sans placeholder:text-surface-300"
   />
   </div>
   </div>
   )}
   {/* Languages */}
   {activeSection === "languages" && (
   <div className="space-y-6">
    <SectionHeader title="Languages" mode={currentMode} onModeChange={setSectionMode} hasRichText={false} />
   <div className="flex flex-wrap gap-2">
   {(data.languages || []).map((lang, index) => (
   <div key={`lang-${index}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-200 text-xs font-bold text-surface-400">
   <span>{lang}</span>
   <button
   onClick={() => { saveToHistory(id); const next = [...(data.languages || [])]; next.splice(index, 1); updateResume(id, { data: { ...data, languages: next } }); toast("Language removed", { action: { label: "Undo", onClick: () => undo(id) } }); }}
   className="text-surface-400 hover:text-red-500 transition-colors opacity-70"
   >
   <X className="w-3.5 h-3.5" />
   </button>
   </div>
   ))}
   </div>
   <input
   type="text"
   placeholder="Type a language and press enter..."
   onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) { saveToHistory(id); const val = (e.target as HTMLInputElement).value.trim(); updateResume(id, { data: { ...data, languages: [...(data.languages || []), val] } }); (e.target as HTMLInputElement).value = ""; } }}
   className="w-full px-4 py-3 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-surface-300"
   />
   </div>
   )}
  
   {/* Certifications */}
   {activeSection === "certifications" && (
   <div className="space-y-6">
    <SectionHeader title="Certifications" mode={currentMode} onModeChange={setSectionMode} hasRichText={false} />
   <div className="flex flex-wrap gap-2">
   {(data.certifications || []).map((cert, index) => (
   <div key={`cert-${index}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-200 text-xs font-bold text-surface-400">
   <span>{cert}</span>
   <button
   onClick={() => { saveToHistory(id); const next = [...(data.certifications || [])]; next.splice(index, 1); updateResume(id, { data: { ...data, certifications: next } }); toast("Certification removed", { action: { label: "Undo", onClick: () => undo(id) } }); }}
   className="text-surface-400 hover:text-red-500 transition-colors opacity-70"
   >
   <X className="w-3.5 h-3.5" />
   </button>
   </div>
   ))}
   </div>
   <input
   type="text"
   placeholder="Type a certification and press enter..."
   onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) { saveToHistory(id); const val = (e.target as HTMLInputElement).value.trim(); updateResume(id, { data: { ...data, certifications: [...(data.certifications || []), val] } }); (e.target as HTMLInputElement).value = ""; } }}
   className="w-full px-4 py-3 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-surface-300"
   />
   </div>
   )}
  
   {/* Projects */}
   {activeSection === "projects" && (
   <div className="space-y-6">
    <SectionHeader title="Projects" mode={currentMode} onModeChange={setSectionMode} hasRichText={true} onAdd={() => { saveToHistory(id); const newProj: ProjectEntry = { name: "", description: "" }; updateResume(id, { data: { ...data, projects: [...(data.projects || []), newProj] } }); }} />
   <div className="space-y-4">
   {(data.projects || []).map((proj, index) => (
   <div key={`proj-${index}`} className="p-4 sm:p-6 rounded-[24px] bg-surface-50 border border-surface-200 group/item relative">
   <button
   onClick={() => { saveToHistory(id); const next = [...(data.projects || [])]; next.splice(index, 1); updateResume(id, { data: { ...data, projects: next } }); toast("Project removed", { action: { label: "Undo", onClick: () => undo(id) } }); }}
   className="absolute top-4 right-4 p-1.5 rounded-lg text-surface-400 hover:text-red-500 transition-all opacity-70 group-hover/item:opacity-100"
   >
   <Trash className="w-4 h-4" />
   </button>
   <div className="space-y-4 pr-8">
   <input type="text" value={proj.name} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.projects || [])]; next[index] = { ...next[index], name: e.target.value }; updateResume(id, { data: { ...data, projects: next } }); }} placeholder="Project Name" className="w-full bg-transparent border-none p-0 text-base font-bold text-surface-400 focus:ring-0 placeholder:text-surface-300" />
   {isRichText ? (
   <RichTextField
   content={ensureHtml(proj.description)}
   onChange={(html) => { const next = [...(data.projects || [])]; next[index] = { ...next[index], description: stripPTags(html) }; updateResume(id, { data: { ...data, projects: next } }); }}
   placeholder="Short description..."
   minHeight={60}
   />
   ) : (
   <textarea value={stripHtml(proj.description)} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.projects || [])]; next[index] = { ...next[index], description: e.target.value }; updateResume(id, { data: { ...data, projects: next } }); }} placeholder="Short description..." rows={2} className="w-full px-3 py-2.5 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all resize-none font-sans placeholder:text-surface-300" />
   )}
   <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-200">
   <input type="text" value={proj.url || ""} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.projects || [])]; next[index] = { ...next[index], url: e.target.value }; updateResume(id, { data: { ...data, projects: next } }); }} placeholder="URL (optional)" className="w-full px-3 py-2 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-surface-300" />
   <input type="text" value={(proj.tech || []).join(", ")} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.projects || [])]; next[index] = { ...next[index], tech: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }; updateResume(id, { data: { ...data, projects: next } }); }} placeholder="Tech (comma separated)" className="w-full px-3 py-2 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-surface-300" />
   </div>
   </div>
   </div>
   ))}
   </div>
   </div>
   )}
  
   {/* Technical Skills */}
   {activeSection === "technicalSkills" && (
   <div className="space-y-6">
    <SectionHeader title="Technical Skills" mode={currentMode} onModeChange={setSectionMode} hasRichText={false} onAdd={() => { saveToHistory(id); const newCat: TechnicalSkillCategory = { id: `ts-${Date.now()}`, category: "", skills: "" }; updateResume(id, { data: { ...data, technicalSkills: [...(data.technicalSkills || []), newCat] } }); }} />
   <div className="space-y-3">
   {(data.technicalSkills || []).map((cat, index) => (
   <div key={cat.id || `ts-${index}`} className="p-4 rounded-2xl bg-surface-50 border border-surface-200 group/item relative">
   <button
   onClick={() => { saveToHistory(id); const next = [...(data.technicalSkills || [])]; next.splice(index, 1); updateResume(id, { data: { ...data, technicalSkills: next } }); toast("Category removed", { action: { label: "Undo", onClick: () => undo(id) } }); }}
   className="absolute top-3 right-3 p-1.5 rounded-lg text-surface-400 hover:text-red-500 transition-all opacity-70 group-hover/item:opacity-100"
   >
   <Trash className="w-4 h-4" />
   </button>
   <div className="grid grid-cols-[1fr_2fr] gap-3 pr-8">
   <input type="text" value={cat.category} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.technicalSkills || [])]; next[index] = { ...next[index], category: e.target.value }; updateResume(id, { data: { ...data, technicalSkills: next } }); }} placeholder="Category" className="w-full px-3 py-2 rounded-xl bg-white border border-surface-200 text-sm font-bold text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-surface-300" />
   <input type="text" value={cat.skills} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.technicalSkills || [])]; next[index] = { ...next[index], skills: e.target.value }; updateResume(id, { data: { ...data, technicalSkills: next } }); }} placeholder="Skills (comma separated)" className="w-full px-3 py-2 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-surface-300" />
   </div>
   </div>
   ))}
   </div>
   </div>
   )}
   </div>
  )
}
