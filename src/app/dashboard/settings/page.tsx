"use client";

import { Bell, Briefcase, CheckCircle, FileText, FloppyDisk, Gear, Palette, User, UploadSimple, X, Lock, Globe } from '@phosphor-icons/react';
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { useTranslation } from "@/i18n";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

/* ═══════════════════════════════════════════════════
   Settings Page — profile, background upload, preferences
   /dashboard/settings
   ═══════════════════════════════════════════════════ */

export default function SettingsPage() {
  const { t, isZh } = useTranslation();
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
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const SETTINGS_PREFS_KEY = "offerpath.settings.prefs";

  useEffect(() => {
    const raw = window.localStorage.getItem(SETTINGS_PREFS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { notificationsEnabled?: boolean; weeklyDigest?: boolean; defaultTemplate?: string };
        if (typeof parsed.notificationsEnabled === "boolean") setNotificationsEnabled(parsed.notificationsEnabled);
        if (typeof parsed.weeklyDigest === "boolean") setWeeklyDigest(parsed.weeklyDigest);
        if (typeof parsed.defaultTemplate === "string") setDefaultTemplate(parsed.defaultTemplate);
      } catch {
        /* ignore */
      }
    } else if (profile) {
      const p = profile as unknown as { notificationsEnabled?: boolean; weeklyDigest?: boolean; defaultTemplate?: string };
      if (typeof p.notificationsEnabled === "boolean") setNotificationsEnabled(p.notificationsEnabled);
      if (typeof p.weeklyDigest === "boolean") setWeeklyDigest(p.weeklyDigest);
      if (typeof p.defaultTemplate === "string") setDefaultTemplate(p.defaultTemplate);
    }
  }, [profile]);

  const handleSave = () => {
    window.localStorage.setItem(SETTINGS_PREFS_KEY, JSON.stringify({
      notificationsEnabled,
      weeklyDigest,
      defaultTemplate,
    }));
    updateProfile({
      notificationsEnabled,
      weeklyDigest,
      defaultTemplate,
    } as never);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success(isZh ? "个人偏好设置已成功保存！" : "Preferences saved successfully.");
  };

  const handleFileUpload = async (file: File) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx") && !name.endsWith(".txt") && !name.endsWith(".md")) {
      toast.error(isZh ? "不支持的文件格式。请使用 PDF, DOCX, MD 或 TXT。" : "Unsupported file type. Use PDF, DOCX, MD, or TXT.");
      return;
    }
    setUploading(true);
    try {
      await uploadResume(file);
      toast.success(isZh ? "简历解析成功！" : "Resume parsed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isZh ? "无法解析简历内容" : "Could not parse resume."));
    } finally {
      setUploading(false);
    }
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
    <div className="w-full animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gear className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold font-display">{t.settings.title}</h1>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
            saved
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "btn-editorial-primary"
          )}
        >
          <FloppyDisk className="w-4 h-4" />
          {saved ? (isZh ? "已保存！" : "Saved!") : t.settings.saveBtn}
        </button>
      </div>

      {/* Profile Section */}
      <section className="card-editorial rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-semibold">{t.settings.profileTitle}</h2>
        </div>

        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 overflow-hidden flex items-center justify-center text-2xl font-bold text-white">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile.fullName || profile.email || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-surface-400">{t.settings.photoLabel}</p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith("image/")) {
                  toast.error(isZh ? "请选择图片文件。" : "Choose an image file.");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => updateProfile({ avatarUrl: String(reader.result) });
                reader.readAsDataURL(file);
              }}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="text-xs text-ember-700 hover:text-ember-800 mt-1 transition-colors underline font-medium"
            >
              {t.settings.uploadPhotoBtn}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-full-name" className="block text-xs font-medium text-surface-300 mb-1.5">
              {t.settings.fullNameLabel}
            </label>
            <input
              id="settings-full-name"
              type="text"
              value={profile.fullName}
              onChange={(e) => updateProfile({ fullName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
            />
          </div>
          <div>
            <label htmlFor="settings-email" className="block text-xs font-medium text-surface-300 mb-1.5">
              {t.settings.emailLabel}
            </label>
            <input
              id="settings-email"
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile({ email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
            />
          </div>
        </div>

        <form
          className="mt-6 pt-6 border-t border-surface-200 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (newPassword.length < 8) {
              toast.error(isZh ? "密码长度必须至少为 8 个字符。" : "Password must be at least 8 characters.");
              return;
            }
            if (newPassword !== confirmPassword) {
              toast.error(isZh ? "两次输入的密码不一致。" : "Passwords do not match.");
              return;
            }
            setSavingPassword(true);
            try {
              const { createClient } = await import("@/lib/supabase");
              const sb = createClient();
              if (!sb) {
                toast.error("Supabase not configured.");
                return;
              }
              const { error } = await sb.auth.updateUser({ password: newPassword });
              if (error) toast.error(error.message);
              else {
                toast.success(isZh ? "密码修改成功！" : "Password updated.");
                setNewPassword("");
                setConfirmPassword("");
              }
            } catch (err) {
              toast.error(err instanceof Error ? err.message : (isZh ? "修改密码失败。" : "Failed to update password."));
            } finally {
              setSavingPassword(false);
            }
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold">{t.settings.changePassword}</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-new-password" className="block text-xs font-medium text-surface-300 mb-1.5">{t.settings.newPassword}</label>
              <input id="settings-new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans" autoComplete="new-password" />
            </div>
            <div>
              <label htmlFor="settings-confirm-password" className="block text-xs font-medium text-surface-300 mb-1.5">{t.settings.confirmPassword}</label>
              <input id="settings-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans" autoComplete="new-password" />
            </div>
          </div>
          <button type="submit" disabled={savingPassword} className="btn-editorial-primary !px-4 !py-2 text-xs">
            {savingPassword ? (isZh ? "正在更新..." : "Updating…") : t.settings.updatePasswordBtn}
          </button>
        </form>
      </section>

      {/* Professional Background Section */}
      <section className="card-editorial rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-semibold">
            {t.settings.backgroundTitle}
          </h2>
        </div>
        <p className="text-xs text-surface-300 mb-5">
          {t.settings.backgroundDesc}
        </p>

        {/* Resume Upload Dropzone */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-surface-300 mb-2">
            {t.settings.resumeUploadLabel}
          </label>

          {uploadedResume ? (
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-400">
                      {uploadedResume.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-surface-300">
                        {(uploadedResume.fileSize / 1024).toFixed(1)} KB
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> {isZh ? "解析成功" : "Parsed successfully"}
                      </span>
                      <span className="text-[10px] text-surface-400">
                        {new Date(uploadedResume.uploadedAt).toLocaleDateString(isZh ? "zh-CN" : "en-US", {
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
                    {isZh ? "替换" : "Replace"}
                  </button>
                  <button
                    onClick={clearResume}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Parsed preview */}
              <details className="mt-3 group">
                <summary className="text-[10px] text-surface-300 cursor-pointer hover:text-surface-400 transition-colors">
                  {isZh ? "查看解析文本内容 →" : "View parsed content →"}
                </summary>
                <div className="mt-2 p-3 rounded-lg bg-surface-200/30 text-xs text-surface-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                  {uploadedResume.parsedText}
                </div>
              </details>
            </div>
          ) : (
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
                  : "border-surface-200 hover:border-surface-300 hover:bg-surface-100/50"
              )}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-surface-300">{isZh ? "正在智能解析简历..." : "Parsing resume..."}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center">
                    <UploadSimple className="w-6 h-6 text-surface-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-400">
                      {isZh ? "拖拽简历到此处，或" : "Drop your resume here or"}{" "}
                      <span className="text-ember-700 underline">{isZh ? "点击浏览" : "browse"}</span>
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      {isZh ? "支持 PDF, DOCX 或 TXT · 最大 10 MB" : "PDF, DOCX, or TXT · Max 10 MB"}
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
            <label className="block text-xs font-medium text-surface-300 mb-1.5">
              {t.settings.headlineLabel}
            </label>
            <input
              type="text"
              value={profile.headline}
              onChange={(e) =>
                updateProfile({ headline: e.target.value })
              }
              placeholder="e.g. Senior Product Manager | AI & Growth"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">
                {t.settings.currentTitleLabel}
              </label>
              <input
                type="text"
                value={profile.currentTitle}
                onChange={(e) =>
                  updateProfile({ currentTitle: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">
                {t.settings.currentCompanyLabel}
              </label>
              <input
                type="text"
                value={profile.currentCompany}
                onChange={(e) =>
                  updateProfile({ currentCompany: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">
                {t.settings.yearsOfExpLabel}
              </label>
              <input
                type="text"
                value={profile.yearsOfExperience}
                onChange={(e) =>
                  updateProfile({ yearsOfExperience: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">
                {t.settings.workAuthLabel}
              </label>
              <input
                type="text"
                value={profile.workAuthorization}
                onChange={(e) =>
                  updateProfile({ workAuthorization: e.target.value })
                }
                placeholder="e.g. US Citizen, H-1B, Singapore PR"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">
              {t.settings.targetRoleSummaryLabel}
            </label>
            <textarea
              value={profile.targetRoleSummary}
              onChange={(e) =>
                updateProfile({ targetRoleSummary: e.target.value })
              }
              rows={3}
              placeholder={isZh ? "简述你正在关注和寻找的岗位方向与业务领域..." : "Describe the type of roles you're targeting..."}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none font-sans"
            />
          </div>

          {/* Key Skills */}
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">
              {t.settings.keySkillsLabel}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(profile.keySkills || []).map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-surface-100 text-surface-400 border border-surface-200 font-medium group"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-surface-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
                placeholder={isZh ? "输入技能名称并按回车添加" : "Add skill and press Enter"}
                className="flex-1 px-3 py-2 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">
              {t.settings.careerGoalsLabel}
            </label>
            <textarea
              value={profile.careerGoals}
              onChange={(e) =>
                updateProfile({ careerGoals: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none font-sans"
            />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="card-editorial rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-semibold">{t.settings.notificationsTitle}</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              label: t.settings.pushNotifications,
              description: t.settings.pushDesc,
              checked: notificationsEnabled,
              setter: setNotificationsEnabled,
            },
            {
              label: t.settings.weeklyDigest,
              description: t.settings.weeklyDigestDesc,
              checked: weeklyDigest,
              setter: setWeeklyDigest,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 transition-all"
            >
              <div>
                <p className="text-sm font-medium text-surface-400">{item.label}</p>
                <p className="text-xs text-surface-300 mt-0.5">
                  {item.description}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={item.checked}
                aria-label={item.label}
                onClick={() => item.setter(!item.checked)}
                className={cn(
                  "w-10 h-6 rounded-full transition-all relative",
                  item.checked ? "bg-ember-600" : "bg-surface-300"
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

      {/* Preferences & Language */}
      <section className="card-editorial rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-semibold">{t.settings.preferencesTitle}</h2>
        </div>

        <div className="space-y-5">
          {/* Language Switcher in settings */}
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-surface-400" />
              {t.settings.languageLabel}
            </label>
            <div className="max-w-xs">
              <LanguageSwitcher variant="select" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">
              {t.settings.defaultTemplateLabel}
            </label>
            <select
              value={defaultTemplate}
              onChange={(e) => setDefaultTemplate(e.target.value)}
              className="w-full max-w-xs px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="modern">{isZh ? "现代标准 (Modern)" : "Modern"}</option>
              <option value="professional">{isZh ? "职业经理 (Professional)" : "Professional"}</option>
              <option value="minimal">{isZh ? "极简清爽 (Minimal)" : "Minimal"}</option>
              <option value="creative">{isZh ? "创意先锋 (Creative)" : "Creative"}</option>
              <option value="executive">{isZh ? "高管领袖 (Executive)" : "Executive"}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="card-editorial rounded-2xl p-6 border-red-500/10">
        <h2 className="text-base font-semibold text-red-600 mb-3 font-display">
          {t.settings.dangerZoneTitle}
        </h2>
        <p className="text-sm text-surface-300 mb-4 font-sans">
          {t.settings.dangerZoneDesc}
        </p>
        <button onClick={() => toast.warning(isZh ? "演示环境中不可直接注销账户。" : "Account deletion not available in demo build.")} className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium hover:bg-red-500/20 transition-all">
          {t.settings.deleteAccountBtn}
        </button>
      </section>
    </div>
  );
}
