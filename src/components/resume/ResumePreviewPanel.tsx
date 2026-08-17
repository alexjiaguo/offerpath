"use client";

import type { ResumeData } from "@/types";
import { getSkills, formatDates } from "./templates/shared";
import type { SectionKey } from "@/types";
import { useTranslation } from "@/i18n";

interface ResumePreviewPanelProps {
  data: ResumeData;
  sectionOrder: SectionKey[];
}

/* Read-only, content-focused view of resume data.
   Renders at reading width (not A4 template scale) so
   the user can review what they wrote without form chrome. */

export default function ResumePreviewPanel({ data, sectionOrder }: ResumePreviewPanelProps) {
  const { t } = useTranslation();
  const skills = getSkills(data);
  const p = data.personal;

  return (
    <div className="card-editorial rounded-2xl p-6 space-y-6 min-h-[500px] max-w-none">
      {/* Header */}
      {(p?.name || p?.email) && (
        <div className="border-b border-surface-200 pb-4">
          {p?.name && (
            <h1 className="text-xl font-bold text-surface-400 font-display tracking-tight">
              {p.name}
            </h1>
          )}
          {p?.title && (
            <p className="text-sm text-surface-300 mt-0.5">{p.title}</p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-surface-300">
            {p?.email && <span>{p.email}</span>}
            {p?.phone && <span>{p.phone}</span>}
            {p?.location && <span>{p.location}</span>}
            {p?.linkedin && <span>{p.linkedin}</span>}
            {p?.website && <span>{p.website}</span>}
          </div>
        </div>
      )}

      {sectionOrder.map((key) => {
        switch (key) {
          case "summary":
            return data.summary ? (
              <div key="summary">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-surface-300 mb-2">{t("resumeStudio.sections.summary") || "Summary"}</h2>
                <p className="text-sm text-surface-400 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
              </div>
            ) : null;

          case "experience":
            return data.experience?.length ? (
              <div key="experience">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-surface-300 mb-3">{t("resumeStudio.sections.experience") || "Experience"}</h2>
                <div className="space-y-4">
                  {data.experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold text-surface-400">{exp.title}</span>
                          {exp.company && <span className="text-sm text-surface-300"> · {exp.company}</span>}
                        </div>
                        <span className="text-[11px] text-surface-300 whitespace-nowrap flex-shrink-0">
                          {formatDates(exp.start_date, exp.end_date, exp.current)}
                        </span>
                      </div>
                      {exp.location && <p className="text-[11px] text-surface-300">{exp.location}</p>}
                      {exp.bullets?.length > 0 && (
                        <ul className="mt-1.5 space-y-1">
                          {exp.bullets.filter((b) => b.trim()).map((b, bi) => (
                            <li key={bi} className="text-[13px] text-surface-400 leading-relaxed flex gap-2">
                              <span className="text-surface-300 mt-1 flex-shrink-0">·</span>
                              <span>{b.replace(/<[^>]*>/g, "")}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null;

          case "education":
            return data.education?.length ? (
              <div key="education">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-surface-300 mb-3">{t("resumeStudio.sections.education") || "Education"}</h2>
                <div className="space-y-2">
                  {data.education.map((edu, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold text-surface-400">{edu.institution}</span>
                          {edu.degree && <span className="text-sm text-surface-300"> · {edu.degree}</span>}
                          {edu.field && <span className="text-[13px] text-surface-300 italic">, {edu.field}</span>}
                        </div>
                        <span className="text-[11px] text-surface-300 whitespace-nowrap flex-shrink-0">
                          {formatDates(edu.start_date, edu.end_date)}
                        </span>
                      </div>
                      {edu.gpa && <p className="text-[11px] text-surface-300">{edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : null;

          case "skills":
            return skills.length > 0 ? (
              <div key="skills">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-surface-300 mb-2">{t("resumeStudio.sections.skills") || "Skills"}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s.id} className="px-2 py-0.5 rounded-md bg-surface-100 text-[12px] font-medium text-surface-400">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null;

          case "technicalSkills":
            return data.technicalSkills?.length ? (
              <div key="technicalSkills">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-surface-300 mb-2">{t("resumeStudio.sections.technicalSkills") || "Technical Skills"}</h2>
                <div className="space-y-1">
                  {data.technicalSkills.map((cat) => (
                    <div key={cat.id} className="text-[13px]">
                      <span className="font-semibold text-surface-400">{cat.category}:</span>{" "}
                      <span className="text-surface-300">{cat.skills}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;

          case "languages":
            return data.languages?.length ? (
              <div key="languages">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-surface-300 mb-2">{t("resumeStudio.sections.languages") || "Languages"}</h2>
                <p className="text-[13px] text-surface-400">{data.languages.join(" · ")}</p>
              </div>
            ) : null;

          case "certifications":
            return data.certifications?.length ? (
              <div key="certifications">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-surface-300 mb-2">{t("resumeStudio.sections.certifications") || "Certifications"}</h2>
                <p className="text-[13px] text-surface-400">{data.certifications.join(" · ")}</p>
              </div>
            ) : null;

          case "projects":
            return data.projects?.length ? (
              <div key="projects">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-surface-300 mb-3">{t("resumeStudio.sections.projects") || "Projects"}</h2>
                <div className="space-y-3">
                  {data.projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-surface-400">{proj.name}</span>
                        {proj.url && <span className="text-[11px] text-surface-300">{proj.url}</span>}
                      </div>
                      {proj.description && <p className="text-[13px] text-surface-400 leading-relaxed mt-0.5">{proj.description}</p>}
                      {proj.tech?.length ? (
                        <p className="text-[11px] text-surface-300 mt-0.5">{proj.tech.join(" · ")}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null;

          default:
            return null;
        }
      })}

      {/* Empty state */}
      {!p?.name && !data.summary && !data.experience?.length && (
        <div className="text-center py-12">
          <p className="text-sm text-surface-300">{t("resumeStudio.emptyState") || "No content yet. Switch to Form or Markdown to start editing."}</p>
        </div>
      )}
    </div>
  );
}
