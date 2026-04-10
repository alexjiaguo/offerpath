"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  AlertCircle,
  PenTool,
  FormInput,
  Palette,
  Sparkles,
  Loader2,
  X,
  CheckCircle,
} from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { useProfileStore } from "@/store/profileStore";
import { cn } from "@/lib/utils";
import type { ExperienceEntry, EducationEntry, ResumeTheme } from "@/types";
import ExportButtons from "@/components/resume/ExportButtons";
import ResumePreview, {
  TEMPLATE_CONFIGS,
} from "@/components/resume/ResumePreview";
import ThemePicker from "@/components/resume/ThemePicker";
import { tailorResume } from "@/lib/aiService";

// Dynamic import for TipTap to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/resume/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl bg-surface-100 border border-white/[0.06] p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

/* ═══════════════════════════════════════════════════
   Resume Editor — Form + Rich Text + Live Preview
   /dashboard/resume/[id]
   ═══════════════════════════════════════════════════ */

type EditorMode = "form" | "richtext";

export default function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getResumeById, updateResume } = useResumeStore();
  const { getProfileSummary } = useProfileStore();
  const resume = getResumeById(id);

  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [editorMode, setEditorMode] = useState<EditorMode>("form");
  const [showPreview, setShowPreview] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    resume?.template || "classic-minimal"
  );
  // AI Tailoring state
  const [showTailorDialog, setShowTailorDialog] = useState(false);
  const [tailorJD, setTailorJD] = useState("");
  const [tailorJobTitle, setTailorJobTitle] = useState("");
  const [tailorCompany, setTailorCompany] = useState("");
  const [tailoring, setTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<string | null>(null);

  // Convert resume data to HTML for the rich text editor
  // (must be before early return to satisfy rules of hooks)
  const resumeData = resume?.data;
  const resumeHtml = useMemo(() => {
    const d = resumeData;
    if (!d) return "";
    const parts: string[] = [];
    if (d.personal?.name) parts.push(`<h1>${d.personal.name}</h1>`);
    if (d.summary) parts.push(`<h2>Professional Summary</h2><p>${d.summary}</p>`);
    if (d.experience?.length) {
      parts.push("<h2>Experience</h2>");
      for (const exp of d.experience) {
        parts.push(`<h3>${exp.title} — ${exp.company}</h3>`);
        if (exp.bullets?.length) {
          parts.push("<ul>" + exp.bullets.filter(b => b.trim()).map(b => `<li>${b}</li>`).join("") + "</ul>");
        }
      }
    }
    if (d.education?.length) {
      parts.push("<h2>Education</h2>");
      for (const edu of d.education) {
        parts.push(`<h3>${edu.degree} — ${edu.institution}</h3>`);
      }
    }
    if (d.skills?.length) {
      parts.push("<h2>Skills</h2><p>" + d.skills.map((s: unknown) => typeof s === "string" ? s : (s as { name: string }).name).join(", ") + "</p>");
    }
    return parts.join("\n");
  }, [resumeData]);

  // Resolve the theme color for the preview
  const themeColor = resume?.theme?.primaryColor || undefined;

  if (!resume) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="glass rounded-2xl p-12 text-center">
          <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Resume not found</h2>
          <Link
            href="/dashboard/resume"
            className="text-sm text-brand-400 hover:text-brand-300"
          >
            ← Back to Resumes
          </Link>
        </div>
      </div>
    );
  }

  const data = resume.data;

  const handleSave = () => {
    updateResume(id, { template: selectedTemplate });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTailorWithAI = async () => {
    if (!tailorJD.trim()) return;
    setTailoring(true);
    setTailorResult(null);
    try {
      const result = await tailorResume({
        baseResume: data,
        jobDescription: tailorJD,
        jobTitle: tailorJobTitle || "Target Role",
        companyName: tailorCompany || "Target Company",
        profileSummary: getProfileSummary(),
      });

      // Apply tailored content to resume
      updateResume(id, {
        data: {
          ...data,
          summary: result.summary,
          experience: result.experience,
        },
      });
      setTailorResult(result.tailoringNotes);
    } catch {
      setTailorResult("Tailoring failed. Please try again.");
    } finally {
      setTailoring(false);
    }
  };

  const updateField = (section: string, field: string, value: unknown) => {
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

  const SECTIONS = [
    { key: "personal", label: "Personal Info", icon: User },
    { key: "summary", label: "Summary", icon: FileText },
    { key: "experience", label: "Experience", icon: Briefcase },
    { key: "education", label: "Education", icon: GraduationCap },
    { key: "skills", label: "Skills", icon: Wrench },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/resume"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold">{resume.title}</h1>
            <p className="text-xs text-gray-500">
              Template: {TEMPLATE_CONFIGS.find(t => t.id === selectedTemplate)?.name || selectedTemplate} ·{" "}
              {resume.is_base ? "Base Resume" : "Tailored"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode toggle */}
          <div className="flex items-center bg-surface-200 rounded-lg p-0.5">
            <button
              onClick={() => setEditorMode("form")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                editorMode === "form"
                  ? "bg-surface-300 text-white"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <FormInput className="w-3.5 h-3.5" />
              Form
            </button>
            <button
              onClick={() => setEditorMode("richtext")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                editorMode === "richtext"
                  ? "bg-surface-300 text-white"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <PenTool className="w-3.5 h-3.5" />
              Rich Editor
            </button>
          </div>

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
              showPreview
                ? "bg-brand-500/20 text-brand-300"
                : "bg-surface-200 text-gray-300 hover:text-white hover:bg-surface-300"
            )}
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Preview</span>
          </button>

          <ExportButtons resumeData={data} resumeTitle={resume.title} />

          {/* Tailor with AI */}
          <button
            onClick={() => setShowTailorDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-medium hover:bg-purple-500/20 border border-purple-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Tailor with AI</span>
          </button>

          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              saved
                ? "bg-emerald-500/20 text-emerald-300"
                : "gradient-brand text-white hover:opacity-90"
            )}
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* Template Picker Strip */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Palette className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {TEMPLATE_CONFIGS.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                setSelectedTemplate(tmpl.id);
                updateResume(id, { template: tmpl.id });
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0",
                selectedTemplate === tmpl.id
                  ? "border-brand-500/40 bg-brand-500/10 text-brand-300"
                  : "border-white/[0.04] bg-surface-100 text-gray-500 hover:text-gray-300 hover:bg-surface-200"
              )}
            >
              {tmpl.name}
              {tmpl.pro && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                  PRO
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content — editor + preview */}
      <div
        className={cn(
          "grid gap-6 transition-all",
          showPreview ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1 max-w-4xl"
        )}
      >
        {/* Left: Editor */}
        <div>
          {editorMode === "richtext" ? (
            /* Rich Text Mode */
            <RichTextEditor
              content={resumeHtml}
              onChange={(_html) => {
                // In a real app, we'd parse HTML back to structured data
                // For now, rich text is a view-only rendering of the data
              }}
            />
          ) : (
            /* Form Mode */
            <>
              {/* Section Nav */}
              <div className="flex gap-1 mb-6 bg-surface-100 rounded-xl p-1 overflow-x-auto">
                {SECTIONS.map((section) => (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                      activeSection === section.key
                        ? "bg-surface-200 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </button>
                ))}
              </div>

              <div className="glass rounded-2xl p-6 animate-fade-in">
                {/* Personal Info */}
                {activeSection === "personal" && (
                  <div className="space-y-4">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-brand-400" />
                      Personal Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: "Full Name", field: "name", value: data.personal?.name || "" },
                        { label: "Email", field: "email", value: data.personal?.email || "" },
                        { label: "Phone", field: "phone", value: data.personal?.phone || "" },
                        { label: "Location", field: "location", value: data.personal?.location || "" },
                        { label: "LinkedIn", field: "linkedin", value: data.personal?.linkedin || "" },
                        { label: "Website", field: "website", value: data.personal?.website || "" },
                      ].map((input) => (
                        <div key={input.field}>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">
                            {input.label}
                          </label>
                          <input
                            type="text"
                            value={input.value}
                            onChange={(e) =>
                              updateField("personal", input.field, e.target.value)
                            }
                            className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {activeSection === "summary" && (
                  <div>
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-brand-400" />
                      Professional Summary
                    </h2>
                    <textarea
                      value={data.summary || ""}
                      onChange={(e) =>
                        updateResume(id, {
                          data: { ...data, summary: e.target.value },
                        })
                      }
                      placeholder="Write a compelling 3-4 sentence professional summary..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none leading-relaxed"
                    />
                    <p className="text-[10px] text-gray-600 mt-2">
                      {(data.summary || "").length} characters
                    </p>
                  </div>
                )}

                {/* Experience */}
                {activeSection === "experience" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-brand-400" />
                        Experience
                      </h2>
                      <button
                        onClick={() => {
                          const newExp: ExperienceEntry = {
                            company: "",
                            title: "",
                            location: "",
                            start_date: "",
                            end_date: "",
                            current: false,
                            bullets: [""],
                          };
                          updateResume(id, {
                            data: {
                              ...data,
                              experience: [...(data.experience || []), newExp],
                            },
                          });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-200 text-gray-400 hover:text-brand-300 text-xs font-medium transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(data.experience || []).map((exp, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl bg-surface-100/50 border border-white/[0.04]"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-gray-400">
                              Position {index + 1}
                            </span>
                            <button
                              onClick={() => {
                                const newExps = [...(data.experience || [])];
                                newExps.splice(index, 1);
                                updateResume(id, {
                                  data: { ...data, experience: newExps },
                                });
                              }}
                              className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            {[
                              { label: "Job Title", key: "title", value: exp.title },
                              { label: "Company", key: "company", value: exp.company },
                              { label: "Location", key: "location", value: exp.location || "" },
                              { label: "Start Date", key: "start_date", value: exp.start_date },
                              { label: "End Date", key: "end_date", value: exp.end_date || "" },
                            ].map((field) => (
                              <div key={field.key}>
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                  {field.label}
                                </label>
                                <input
                                  type="text"
                                  value={field.value}
                                  onChange={(e) => {
                                    const newExps = [...(data.experience || [])];
                                    newExps[index] = {
                                      ...newExps[index],
                                      [field.key]: e.target.value,
                                    };
                                    updateResume(id, {
                                      data: { ...data, experience: newExps },
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-surface-200 border border-white/[0.04] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 transition-all"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Bullets */}
                          <div className="mt-3">
                            <label className="block text-[10px] font-medium text-gray-500 mb-1.5">
                              Bullet Points
                            </label>
                            {(exp.bullets || [""]).map((bullet, bi) => (
                              <div key={bi} className="flex items-start gap-2 mb-1.5">
                                <span className="text-gray-600 text-xs mt-2">•</span>
                                <textarea
                                  value={bullet}
                                  onChange={(e) => {
                                    const newExps = [...(data.experience || [])];
                                    const newBullets = [...(newExps[index].bullets || [])];
                                    newBullets[bi] = e.target.value;
                                    newExps[index] = {
                                      ...newExps[index],
                                      bullets: newBullets,
                                    };
                                    updateResume(id, {
                                      data: { ...data, experience: newExps },
                                    });
                                  }}
                                  rows={1}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-surface-200 border border-white/[0.04] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 transition-all resize-none"
                                />
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newExps = [...(data.experience || [])];
                                newExps[index] = {
                                  ...newExps[index],
                                  bullets: [...(newExps[index].bullets || []), ""],
                                };
                                updateResume(id, {
                                  data: { ...data, experience: newExps },
                                });
                              }}
                              className="text-[10px] text-brand-400 hover:text-brand-300 mt-1 transition-colors"
                            >
                              + Add bullet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {activeSection === "education" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-brand-400" />
                        Education
                      </h2>
                      <button
                        onClick={() => {
                          const newEdu: EducationEntry = {
                            institution: "",
                            degree: "",
                            field: "",
                            start_date: "",
                            end_date: "",
                          };
                          updateResume(id, {
                            data: {
                              ...data,
                              education: [...(data.education || []), newEdu],
                            },
                          });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-200 text-gray-400 hover:text-brand-300 text-xs font-medium transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(data.education || []).map((edu, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl bg-surface-100/50 border border-white/[0.04]"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-gray-400">
                              Education {index + 1}
                            </span>
                            <button
                              onClick={() => {
                                const newEdus = [...(data.education || [])];
                                newEdus.splice(index, 1);
                                updateResume(id, {
                                  data: { ...data, education: newEdus },
                                });
                              }}
                              className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            {[
                              { label: "Institution", key: "institution", value: edu.institution },
                              { label: "Degree", key: "degree", value: edu.degree },
                              { label: "Field of Study", key: "field", value: edu.field },
                              { label: "Start Date", key: "start_date", value: edu.start_date || "" },
                              { label: "End Date", key: "end_date", value: edu.end_date || "" },
                              { label: "GPA", key: "gpa", value: edu.gpa || "" },
                            ].map((field) => (
                              <div key={field.key}>
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                  {field.label}
                                </label>
                                <input
                                  type="text"
                                  value={field.value}
                                  onChange={(e) => {
                                    const newEdus = [...(data.education || [])];
                                    newEdus[index] = {
                                      ...newEdus[index],
                                      [field.key]: e.target.value,
                                    };
                                    updateResume(id, {
                                      data: { ...data, education: newEdus },
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-surface-200 border border-white/[0.04] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 transition-all"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {activeSection === "skills" && (
                  <div>
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                      <Wrench className="w-5 h-5 text-brand-400" />
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(data.skills || []).map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-200 text-sm text-gray-300 group"
                        >
                          <span>{typeof skill === 'string' ? skill : skill.name}</span>
                          <button
                            onClick={() => {
                              const newSkills = [...(data.skills || [])];
                              newSkills.splice(index, 1);
                              updateResume(id, {
                                data: { ...data, skills: newSkills },
                              });
                            }}
                            className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a skill and press Enter"
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            (e.target as HTMLInputElement).value.trim()
                          ) {
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
                        className="flex-1 px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">
                      {(data.skills || []).length} skills added
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Live Preview + Theme Picker */}
        {showPreview && (
          <div className="hidden lg:block sticky top-20 self-start space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Live Preview
              </h3>
              <span className="text-[10px] text-gray-600">
                {TEMPLATE_CONFIGS.find((t) => t.id === selectedTemplate)?.name}
              </span>
            </div>
            <ResumePreview
              data={data}
              template={selectedTemplate}
              themeColor={themeColor}
              className="w-full"
            />

            {/* Theme Picker */}
            <ThemePicker
              theme={resume.theme || { primaryColor: "#4f46e5", accentColor: "#7f8c8d", backgroundColor: "#ffffff", textColor: "#2c3e50", fontFamily: "'Inter', sans-serif", baseFontSize: 11, headerFontSize: 24, sectionTitleSize: 14, companyFontSize: 12, lineHeight: 1.4, pagePadding: 48, sectionSpacing: 18, itemSpacing: 8 }}
              onChange={(updates) => {
                updateResume(id, {
                  theme: { ...resume.theme, ...updates } as ResumeTheme,
                });
              }}
            />
          </div>
        )}
      </div>

      {/* ═══ Modal: Tailor with AI ═══ */}
      {showTailorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-50 border border-white/[0.08] rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-semibold">Tailor Resume with AI</h2>
              </div>
              <button onClick={() => { setShowTailorDialog(false); setTailorResult(null); }} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {tailorResult ? (
              /* Result view */
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-emerald-300 font-medium">Resume tailored successfully!</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.04] text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {tailorResult}
                </div>
                <button
                  onClick={() => { setShowTailorDialog(false); setTailorResult(null); setTailorJD(""); }}
                  className="w-full px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Done — Review Changes
                </button>
              </div>
            ) : (
              /* Input view */
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-xs text-gray-400">
                    Paste a job description below. AI will optimize your summary, bullet points, and skill highlights to match the role.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Job Title</label>
                    <input type="text" value={tailorJobTitle} onChange={(e) => setTailorJobTitle(e.target.value)} placeholder="e.g. Senior PM" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Company</label>
                    <input type="text" value={tailorCompany} onChange={(e) => setTailorCompany(e.target.value)} placeholder="e.g. Google" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Job Description</label>
                  <textarea
                    value={tailorJD}
                    onChange={(e) => setTailorJD(e.target.value)}
                    rows={8}
                    placeholder="Paste the full job description here..."
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowTailorDialog(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-surface-200 hover:bg-surface-300 transition-all">Cancel</button>
                  <button
                    onClick={handleTailorWithAI}
                    disabled={tailoring || !tailorJD.trim()}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      tailoring || !tailorJD.trim()
                        ? "bg-surface-300 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-brand-500 text-white hover:opacity-90"
                    )}
                  >
                    {tailoring ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Tailoring...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Tailor Resume</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
