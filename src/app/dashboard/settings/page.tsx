"use client";

import {
  Settings,
  User,
  Bell,
  Palette,
  Moon,
  Save,
  Upload,
  FileText,
  X,
  Briefcase,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";

/* ═══════════════════════════════════════════════════
   Settings Page — profile, background upload, preferences
   /dashboard/settings
   ═══════════════════════════════════════════════════ */

export default function SettingsPage() {
  const {
    profile,
    uploadedResume,
    updateProfile,
    addSkill,
    removeSkill,
    uploadResume,
    clearResume,
  } = useProfileStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [defaultTemplate, setDefaultTemplate] = useState("modern");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileUpload = async (file: File) => {
    if (
      !file.name.endsWith(".pdf") &&
      !file.name.endsWith(".docx") &&
      !file.name.endsWith(".txt")
    ) {
      return;
    }
    setUploading(true);
    await uploadResume(file);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSkillAdd = () => {
    const trimmed = skillInput.trim();
    if (trimmed) {
      addSkill(trimmed);
      setSkillInput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
            saved
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "gradient-brand text-white hover:opacity-90"
          )}
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Profile Section */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-semibold">Profile</h2>
          </div>

          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
              {profile.fullName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">
                Profile Photo
              </p>
              <button className="text-xs text-brand-400 hover:text-brand-300 mt-1 transition-colors">
                Upload new photo
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile({ email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>
        </section>

        {/* ═══ NEW: Profile & Background Section ═══ */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-semibold">
              Professional Background
            </h2>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            This information is used as ground truth for AI resume tailoring,
            job matching, and interview prep generation.
          </p>

          {/* Resume Upload Dropzone */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Resume / CV File
            </label>

            {uploadedResume ? (
              /* Uploaded state */
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {uploadedResume.fileName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500">
                          {(uploadedResume.fileSize / 1024).toFixed(1)} KB
                        </span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Parsed
                          successfully
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(
                            uploadedResume.uploadedAt
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-brand-400 hover:text-brand-300 px-3 py-1.5 rounded-lg hover:bg-brand-500/10 transition-all"
                    >
                      Replace
                    </button>
                    <button
                      onClick={clearResume}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Parsed preview */}
                <details className="mt-3 group">
                  <summary className="text-[10px] text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                    View parsed content →
                  </summary>
                  <div className="mt-2 p-3 rounded-lg bg-surface-200/30 text-xs text-gray-400 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                    {uploadedResume.parsedText}
                  </div>
                </details>
              </div>
            ) : (
              /* Empty dropzone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all",
                  dragOver
                    ? "border-brand-400 bg-brand-500/5"
                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.01]"
                )}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Parsing resume...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        Drop your resume here or{" "}
                        <span className="text-brand-400">browse</span>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        PDF, DOCX, or TXT · Max 10 MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>

          {/* Professional info fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Headline
              </label>
              <input
                type="text"
                value={profile.headline}
                onChange={(e) =>
                  updateProfile({ headline: e.target.value })
                }
                placeholder="e.g. Senior Product Manager | Ad Tech & AI"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Current Title
                </label>
                <input
                  type="text"
                  value={profile.currentTitle}
                  onChange={(e) =>
                    updateProfile({ currentTitle: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Current Company
                </label>
                <input
                  type="text"
                  value={profile.currentCompany}
                  onChange={(e) =>
                    updateProfile({ currentCompany: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="text"
                  value={profile.yearsOfExperience}
                  onChange={(e) =>
                    updateProfile({ yearsOfExperience: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Work Authorization
                </label>
                <input
                  type="text"
                  value={profile.workAuthorization}
                  onChange={(e) =>
                    updateProfile({ workAuthorization: e.target.value })
                  }
                  placeholder="e.g. US Citizen, H-1B, Singapore PR"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Target Role Summary
              </label>
              <textarea
                value={profile.targetRoleSummary}
                onChange={(e) =>
                  updateProfile({ targetRoleSummary: e.target.value })
                }
                rows={3}
                placeholder="Describe the type of roles you're targeting..."
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none"
              />
            </div>

            {/* Key Skills */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Key Skills
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {profile.keySkills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-brand-500/10 text-brand-300 font-medium group"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-brand-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSkillAdd();
                  }}
                  placeholder="Add skill and press Enter"
                  className="flex-1 px-3 py-2 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Career Goals
              </label>
              <textarea
                value={profile.careerGoals}
                onChange={(e) =>
                  updateProfile({ careerGoals: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none"
              />
            </div>
          </div>

          {/* Info banner */}
          <div className="mt-5 flex items-start gap-2.5 p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
            <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Your professional background and uploaded resume are used as{" "}
              <span className="text-gray-300 font-medium">ground truth</span>{" "}
              for AI-powered resume tailoring, job matching scores, and
              personalized interview prep generation.
            </p>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                label: "Push Notifications",
                description:
                  "Get notified about interview reminders and status updates",
                checked: notificationsEnabled,
                setter: setNotificationsEnabled,
              },
              {
                label: "Weekly Digest",
                description:
                  "Receive a weekly summary of your pipeline activity",
                checked: weeklyDigest,
                setter: setWeeklyDigest,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-all"
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => item.setter(!item.checked)}
                  className={cn(
                    "w-10 h-6 rounded-full transition-all relative",
                    item.checked ? "bg-brand-500" : "bg-surface-300"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full bg-white absolute top-1 transition-all",
                      item.checked ? "left-5" : "left-1"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Preferences */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Palette className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-semibold">Preferences</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Default Resume Template
              </label>
              <select
                value={defaultTemplate}
                onChange={(e) => setDefaultTemplate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.06] text-sm text-gray-200 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="modern">Modern</option>
                <option value="professional">Professional</option>
                <option value="minimal">Minimal</option>
                <option value="creative">Creative</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Currently active
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 font-medium">
                Always On
              </span>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="glass rounded-2xl p-6 border-red-500/10">
          <h2 className="text-base font-semibold text-red-400 mb-3">
            Danger Zone
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Once you delete your account, there is no going back.
          </p>
          <button className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all">
            Delete Account
          </button>
        </section>
      </div>
    </div>
  );
}
