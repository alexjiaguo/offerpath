"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  WarningCircle,
  Eye,
  EyeSlash,
  Key,
  Lightning,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { SiOpenai } from "react-icons/si";
import {
  siAnthropic,
  siDeepseek,
  siGooglegemini,
  siLmstudio,
  siMistralai,
  siOllama,
  siOpenrouter,
  siPerplexity,
} from "simple-icons";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { useState } from "react";
import { toast } from "sonner";
import { validateApiKey } from "@/lib/validateApiKey";
import { useTranslation } from "@/i18n";
import {
  LLM_PROVIDERS,
  LLM_PROVIDER_CONFIG,
  normalizeLLMBaseUrl,
  type LLMProvider,
} from "@/lib/llmProviders";

const PROVIDER_STYLES: Record<LLMProvider, string> = {
  openai: "text-emerald-700 bg-emerald-500/10",
  anthropic: "text-amber-700 bg-amber-500/10",
  gemini: "text-blue-700 bg-blue-500/10",
  deepseek: "text-indigo-700 bg-indigo-500/10",
  mistral: "text-orange-700 bg-orange-500/10",
  openrouter: "text-sky-700 bg-sky-500/10",
  perplexity: "text-teal-700 bg-teal-500/10",
  ollama: "text-slate-700 bg-slate-500/10",
  lmstudio: "text-violet-700 bg-violet-500/10",
  "openai-compatible": "text-teal-700 bg-teal-500/10",
  "anthropic-compatible": "text-rose-700 bg-rose-500/10",
};

const SIMPLE_ICONS = {
  anthropic: siAnthropic,
  gemini: siGooglegemini,
  deepseek: siDeepseek,
  mistral: siMistralai,
  openrouter: siOpenrouter,
  perplexity: siPerplexity,
  ollama: siOllama,
  lmstudio: siLmstudio,
} as const;

function ProviderLogo({ provider }: { provider: LLMProvider }) {
  if (provider === "openai" || provider === "openai-compatible") {
    return <SiOpenai className="h-5 w-5 text-surface-900" aria-hidden="true" />;
  }

  if (provider === "anthropic-compatible") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" role="img" aria-hidden="true">
        <path d={siAnthropic.path} fill={`#${siAnthropic.hex}`} />
      </svg>
    );
  }

  const icon = SIMPLE_ICONS[provider as keyof typeof SIMPLE_ICONS];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" role="img" aria-hidden="true">
      <path d={icon.path} fill={`#${icon.hex}`} />
    </svg>
  );
}

export default function ApiKeysPage() {
  const { t, isZh } = useTranslation();
  const {
    apiKeys,
    addApiKey,
    removeApiKey,
    updateApiKeyConfig,
    updateApiKeyStatus,
  } = useProfileStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState<LLMProvider>("openai");
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newBaseUrl, setNewBaseUrl] = useState(LLM_PROVIDER_CONFIG.openai.defaultBaseUrl);
  const [newModel, setNewModel] = useState(LLM_PROVIDER_CONFIG.openai.defaultModel);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [testingKeys, setTestingKeys] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBaseUrl, setEditBaseUrl] = useState("");
  const [editModel, setEditModel] = useState("");

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectProvider = (provider: LLMProvider) => {
    const config = LLM_PROVIDER_CONFIG[provider];
    setNewProvider(provider);
    setNewBaseUrl(config.defaultBaseUrl);
    setNewModel(config.defaultModel);
  };

  const handleAdd = () => {
    const config = LLM_PROVIDER_CONFIG[newProvider];
    const normalized = normalizeLLMBaseUrl(newProvider, newBaseUrl);
    if (normalized.error) {
      toast.error(normalized.error);
      return;
    }
    if (config.apiKeyRequired && !newKey.trim()) return;

    addApiKey({
      id: crypto.randomUUID(),
      provider: newProvider,
      label: newLabel.trim() || `${config.name} Key`,
      key: newKey.trim(),
      baseUrl: normalized.baseUrl,
      model: newModel.trim() || config.defaultModel,
      status: "untested",
      addedAt: new Date().toISOString().split("T")[0],
    });

    setNewLabel("");
    setNewKey("");
    setShowAddForm(false);
    toast.success(isZh ? `已添加 ${config.name} 配置` : `${config.name} configuration added`);
  };

  const handleDelete = (id: string) => {
    removeApiKey(id);
    toast.info(isZh ? "AI 配置已移除" : "AI configuration removed");
  };

  const handleTest = async (id: string) => {
    const entry = apiKeys.find((k) => k.id === id);
    if (!entry) return;
    const config = LLM_PROVIDER_CONFIG[entry.provider];
    const baseUrl = entry.baseUrl || config.defaultBaseUrl;
    const model = entry.model || config.defaultModel;

    setTestingKeys((prev) => new Set(prev).add(id));
    try {
      const result = await validateApiKey(entry.provider, entry.key, { baseUrl, model });
      if (result.valid) {
        updateApiKeyStatus(id, "active");
        toast.success(isZh ? "AI 配置连接验证成功！" : "AI configuration validated successfully");
      } else {
        updateApiKeyStatus(id, "invalid");
        toast.error(result.error ?? (isZh ? "无效的 AI 配置" : "Invalid AI configuration"));
      }
    } finally {
      setTestingKeys((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const startEdit = (id: string) => {
    const entry = apiKeys.find((k) => k.id === id);
    if (!entry) return;
    const config = LLM_PROVIDER_CONFIG[entry.provider];
    setEditingId(id);
    setEditBaseUrl(entry.baseUrl || config.defaultBaseUrl);
    setEditModel(entry.model || config.defaultModel);
  };

  const saveEdit = (id: string) => {
    const entry = apiKeys.find((k) => k.id === id);
    if (!entry) return;
    const normalized = normalizeLLMBaseUrl(entry.provider, editBaseUrl);
    if (normalized.error) {
      toast.error(normalized.error);
      return;
    }

    updateApiKeyConfig(id, {
      baseUrl: normalized.baseUrl,
      model: editModel.trim() || LLM_PROVIDER_CONFIG[entry.provider].defaultModel,
    });
    updateApiKeyStatus(id, "untested");
    setEditingId(null);
    toast.success(isZh ? "配置已保存，请重新测试连接" : "Configuration saved. Test the connection again.");
  };

  const maskKey = (key: string) => {
    if (!key) return t.apiKeys.noKeyRequired;
    if (key.length <= 10) return "••••••••";
    return key.slice(0, 7) + "••••" + key.slice(-4);
  };

  return (
    <div className="w-full animate-fade-in space-y-6 pb-12">
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

      <div className="card-editorial rounded-xl p-4 mb-6 flex items-start gap-3">
        <Lightning className="w-5 h-5 text-ember-600 flex-shrink-0 mt-0.5" weight="fill" />
        <div>
          <p className="text-sm font-medium mb-1">{t.apiKeys.byoTitle}</p>
          <p className="text-xs text-surface-300 leading-relaxed">{t.apiKeys.byoDesc}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {apiKeys.map((entry) => {
          const config = LLM_PROVIDER_CONFIG[entry.provider];
          const isRevealed = revealedKeys.has(entry.id);
          const isEditing = editingId === entry.id;
          const displayBaseUrl = entry.baseUrl || config.defaultBaseUrl;
          const displayModel = entry.model || config.defaultModel;

          return (
            <div key={entry.id} className="card-editorial rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", PROVIDER_STYLES[entry.provider])}>
                    <ProviderLogo provider={entry.provider} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-surface-400">{entry.label}</p>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium font-mono", PROVIDER_STYLES[entry.provider])}>
                        {config.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs text-surface-300 font-mono">
                        {isRevealed ? entry.key || t.apiKeys.noKeyRequired : maskKey(entry.key)}
                      </code>
                      {entry.key && (
                        <button
                          onClick={() => toggleReveal(entry.id)}
                          className="p-1 text-surface-400 hover:text-surface-300 transition-colors"
                          aria-label="Toggle key visibility"
                        >
                          {isRevealed ? <EyeSlash className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="grid gap-3 mt-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="block text-xs font-medium text-surface-300 mb-1.5">{t.apiKeys.baseUrlLabel}</span>
                          <input
                            type="text"
                            value={editBaseUrl}
                            onChange={(e) => setEditBaseUrl(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-surface-200 text-sm text-surface-400 font-mono focus:outline-none focus:border-brand-500/40"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-xs font-medium text-surface-300 mb-1.5">{t.apiKeys.modelLabel}</span>
                          <input
                            type="text"
                            value={editModel}
                            onChange={(e) => setEditModel(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-surface-200 text-sm text-surface-400 font-mono focus:outline-none focus:border-brand-500/40"
                          />
                        </label>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <button onClick={() => saveEdit(entry.id)} className="btn-editorial-primary px-3 py-1.5 text-xs">
                            {t.apiKeys.saveConfig}
                          </button>
                          <button onClick={() => setEditingId(null)} className="btn-editorial-secondary px-3 py-1.5 text-xs">
                            {t.apiKeys.cancelEdit}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                        <span className="text-[10px] text-surface-300 font-mono max-w-full truncate">{displayBaseUrl}</span>
                        <span className="text-[10px] text-surface-300 font-mono">{displayModel}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn("flex items-center gap-1 text-[10px] font-medium", entry.status === "active" ? "text-emerald-700" : entry.status === "invalid" ? "text-red-600" : "text-surface-300")}>
                        {entry.status === "active" ? (
                          <CheckCircle className="w-3 h-3" weight="fill" />
                        ) : (
                          <WarningCircle className="w-3 h-3" />
                        )}
                        {entry.status === "active" ? t.apiKeys.statusConnected : entry.status === "invalid" ? t.apiKeys.statusInvalid : t.apiKeys.statusUntested}
                      </span>
                      <span className="text-[10px] text-surface-300 font-mono">
                        {isZh ? `添加于 ${entry.addedAt}` : `Added ${entry.addedAt}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
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
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(entry.id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-surface-300 hover:bg-surface-100 transition-all"
                      aria-label={t.apiKeys.editConfig}
                    >
                      <PencilSimple className="w-4 h-4" />
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

      {showAddForm ? (
        <div className="card-editorial rounded-2xl p-6 animate-fade-in">
          <h3 className="text-base font-semibold mb-4 font-display">{t.apiKeys.addNewKey}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.apiKeys.providerLabel}</label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {LLM_PROVIDERS.map((provider) => {
                  const config = LLM_PROVIDER_CONFIG[provider];
                  return (
                    <button
                      key={provider}
                      onClick={() => selectProvider(provider)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                        newProvider === provider
                          ? "bg-surface-400 text-surface-0 border border-surface-400 font-bold"
                          : "bg-surface-50 text-surface-300 hover:text-surface-400 border border-surface-200"
                      )}
                    >
                      <ProviderLogo provider={provider} />
                      <span className="truncate">{config.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.apiKeys.labelPlaceholder}</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., Personal Key"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">
                  {LLM_PROVIDER_CONFIG[newProvider].apiKeyRequired ? t.apiKeys.keyLabel : t.apiKeys.keyOptional}
                </label>
                <input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder={LLM_PROVIDER_CONFIG[newProvider].keyPlaceholder}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-mono"
                />
                {!LLM_PROVIDER_CONFIG[newProvider].apiKeyRequired && (
                  <p className="text-[10px] text-surface-300 mt-1.5">{t.apiKeys.localProviderNote}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.apiKeys.baseUrlLabel}</label>
                <input
                  type="text"
                  value={newBaseUrl}
                  onChange={(e) => setNewBaseUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-mono"
                />
                <p className="text-[10px] text-surface-300 mt-1.5">{t.apiKeys.baseUrlHelp}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.apiKeys.modelLabel}</label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder={t.apiKeys.modelPlaceholder}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowAddForm(false)} className="btn-editorial-secondary">
                {t.common.cancel}
              </button>
              <button
                onClick={handleAdd}
                disabled={LLM_PROVIDER_CONFIG[newProvider].apiKeyRequired && !newKey.trim()}
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
