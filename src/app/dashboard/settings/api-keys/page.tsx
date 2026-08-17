"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle, WarningCircle, Eye, EyeSlash, Key, Lightning, Plus, Trash } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { useProfileStore, type ApiKeyEntry } from "@/store/profileStore";
import { useState } from "react";
import { toast } from "sonner";
import { validateApiKey } from "@/lib/validateApiKey";
import { useTranslation } from "@/i18n";

/* ═══════════════════════════════════════════════════
   API Keys Page — BYO API key management
   /dashboard/settings/api-keys
   ═══════════════════════════════════════════════════ */

const PROVIDER_INFO: Record<string, { name: string; color: string; icon: string }> = {
  openai: { name: "OpenAI", color: "text-emerald-700 bg-emerald-500/10", icon: "🤖" },
  anthropic: { name: "Anthropic", color: "text-amber-700 bg-amber-500/10", icon: "🧠" },
  gemini: { name: "Google Gemini", color: "text-blue-700 bg-blue-500/10", icon: "✨" },
  deepseek: { name: "DeepSeek", color: "text-purple-700 bg-purple-500/10", icon: "🔮" },
};

export default function ApiKeysPage() {
  const { t, isZh } = useTranslation();
  const { apiKeys, addApiKey, removeApiKey, updateApiKeyStatus } = useProfileStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState<ApiKeyEntry["provider"]>("openai");
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [testingKeys, setTestingKeys] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    if (!newKey.trim()) return;
    const entry: ApiKeyEntry = {
      id: crypto.randomUUID(),
      provider: newProvider,
      label: newLabel.trim() || `${PROVIDER_INFO[newProvider].name} Key`,
      key: newKey.trim(),
      status: "untested",
      addedAt: new Date().toISOString().split("T")[0],
    };
    addApiKey(entry);
    setNewLabel("");
    setNewKey("");
    setShowAddForm(false);
    toast.success(isZh ? `已添加 ${PROVIDER_INFO[newProvider].name} 密钥` : `${PROVIDER_INFO[newProvider].name} key added`);
  };

  const handleDelete = (id: string) => {
    removeApiKey(id);
    toast.info(isZh ? "API 密钥已移除" : "API key removed");
  };

  const handleTest = async (id: string) => {
    const entry = apiKeys.find((k) => k.id === id);
    if (!entry) return;

    setTestingKeys((prev) => new Set(prev).add(id));
    try {
      const result = await validateApiKey(entry.provider, entry.key);
      if (result.valid) {
        updateApiKeyStatus(id, "active");
        toast.success(isZh ? "API 密钥连接验证成功！" : "API key validated successfully");
      } else {
        updateApiKeyStatus(id, "invalid");
        toast.error(result.error ?? (isZh ? "无效的 API 密钥" : "Invalid API key"));
      }
    } finally {
      setTestingKeys((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 10) return "••••••••";
    return key.slice(0, 7) + "••••" + key.slice(-4);
  };

  return (
    <div className="w-full animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold font-display">{t.apiKeys.title}</h1>
        </div>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-1.5 text-sm text-surface-300 hover:text-surface-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.apiKeys.backToSettings}
        </Link>
      </div>

      {/* Info Banner */}
      <div className="card-editorial rounded-xl p-4 mb-6 flex items-start gap-3">
        <Lightning className="w-5 h-5 text-ember-600 flex-shrink-0 mt-0.5" weight="fill" />
        <div>
          <p className="text-sm font-medium mb-1">{t.apiKeys.byoTitle}</p>
          <p className="text-xs text-surface-300 leading-relaxed">
            {t.apiKeys.byoDesc}
          </p>
        </div>
      </div>

      {/* Existing Keys */}
      <div className="space-y-3 mb-6">
        {apiKeys.map((entry) => {
          const provider = PROVIDER_INFO[entry.provider] || PROVIDER_INFO.openai;
          const isRevealed = revealedKeys.has(entry.id);

          return (
            <div key={entry.id} className="card-editorial rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                      provider.color
                    )}
                  >
                    {provider.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-surface-400">{entry.label}</p>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium font-mono",
                          provider.color
                        )}
                      >
                        {provider.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-surface-300 font-mono">
                        {isRevealed ? entry.key : maskKey(entry.key)}
                      </code>
                      <button
                        onClick={() => toggleReveal(entry.id)}
                        className="p-1 text-surface-400 hover:text-surface-300 transition-colors"
                        aria-label="Toggle key visibility"
                      >
                        {isRevealed ? (
                          <EyeSlash className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={cn(
                          "flex items-center gap-1 text-[10px] font-medium",
                          entry.status === "active"
                            ? "text-emerald-700"
                            : entry.status === "invalid"
                            ? "text-red-600"
                            : "text-surface-300"
                        )}
                      >
                        {entry.status === "active" ? (
                          <CheckCircle className="w-3 h-3" weight="fill" />
                        ) : (
                          <WarningCircle className="w-3 h-3" />
                        )}
                        {entry.status === "active"
                          ? t.apiKeys.statusConnected
                          : entry.status === "invalid"
                          ? t.apiKeys.statusInvalid
                          : t.apiKeys.statusUntested}
                      </span>
                      <span className="text-[10px] text-surface-300 font-mono">
                        {isZh ? `添加于 ${entry.addedAt}` : `Added ${entry.addedAt}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {entry.status !== "active" && (
                    <button
                      onClick={() => void handleTest(entry.id)}
                      disabled={testingKeys.has(entry.id)}
                      className="px-3 py-1.5 rounded-lg bg-surface-100 text-surface-400 hover:text-black text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[52px] flex items-center justify-center border border-surface-200"
                    >
                      {testingKeys.has(entry.id) ? (
                        <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                      ) : (
                        t.apiKeys.testBtn
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-500/10 transition-all"
                    aria-label="Delete key"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Key Form */}
      {showAddForm ? (
        <div className="card-editorial rounded-2xl p-6 animate-fade-in">
          <h3 className="text-base font-semibold mb-4 font-display">{t.apiKeys.addNewKey}</h3>

          <div className="space-y-4">
            {/* Provider */}
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">
                {t.apiKeys.providerLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {(["openai", "anthropic", "gemini", "deepseek"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewProvider(p)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      newProvider === p
                        ? "bg-surface-400 text-surface-0 border border-surface-400 font-bold"
                        : "bg-surface-50 text-surface-300 hover:text-surface-400 border border-surface-200"
                    )}
                  >
                    <span>{PROVIDER_INFO[p].icon}</span>
                    {PROVIDER_INFO[p].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">
                {t.apiKeys.labelPlaceholder}
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., Personal Key"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
              />
            </div>

            {/* Key */}
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">
                {t.apiKeys.keyLabel}
              </label>
              <input
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-mono"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="btn-editorial-secondary"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleAdd}
                disabled={!newKey.trim()}
                className="btn-editorial-primary disabled:opacity-40"
              >
                {t.apiKeys.addKeyBtn}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-surface-200 text-surface-300 hover:text-surface-400 hover:border-surface-300 transition-all flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {t.apiKeys.addKeyBtn}
        </button>
      )}
    </div>
  );
}
