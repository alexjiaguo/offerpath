"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

/* ═══════════════════════════════════════════════════
   API Keys Page — BYO API key management
   /dashboard/settings/api-keys
   ═══════════════════════════════════════════════════ */

interface ApiKeyEntry {
  id: string;
  provider: "openai" | "gemini" | "deepseek";
  label: string;
  key: string;
  status: "active" | "invalid" | "untested";
  addedAt: string;
}

const PROVIDER_INFO: Record<string, { name: string; color: string; icon: string }> = {
  openai: { name: "OpenAI", color: "text-emerald-400 bg-emerald-500/10", icon: "🤖" },
  gemini: { name: "Google Gemini", color: "text-blue-400 bg-blue-500/10", icon: "✨" },
  deepseek: { name: "DeepSeek", color: "text-purple-400 bg-purple-500/10", icon: "🔮" },
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([
    {
      id: "k1",
      provider: "openai",
      label: "Primary OpenAI Key",
      key: "sk-proj-xxxx...xxxx",
      status: "active",
      addedAt: "2026-03-15",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState<"openai" | "gemini" | "deepseek">("openai");
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

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
    setKeys((prev) => [...prev, entry]);
    setNewLabel("");
    setNewKey("");
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this API key?")) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const handleTest = (id: string) => {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, status: "active" as const } : k
      )
    );
  };

  const maskKey = (key: string) => {
    if (key.length <= 10) return "••••••••";
    return key.slice(0, 7) + "••••" + key.slice(-4);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold">API Keys</h1>
        </div>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </Link>
      </div>

      {/* Info Banner */}
      <div className="glass rounded-xl p-4 mb-6 flex items-start gap-3">
        <Zap className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium mb-1">Bring Your Own Key (BYO)</p>
          <p className="text-xs text-zinc-500 dark:text-gray-500 leading-relaxed">
            Add your own API keys to use AI features. Your keys are encrypted
            and never shared. Free-tier users need BYO keys; Pro users get
            managed access included.
          </p>
        </div>
      </div>

      {/* Existing Keys */}
      <div className="space-y-3 mb-6">
        {keys.map((entry) => {
          const provider = PROVIDER_INFO[entry.provider];
          const isRevealed = revealedKeys.has(entry.id);

          return (
            <div key={entry.id} className="glass rounded-xl p-5">
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
                      <p className="text-sm font-semibold">{entry.label}</p>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium",
                          provider.color
                        )}
                      >
                        {provider.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-zinc-500 dark:text-gray-500 font-mono">
                        {isRevealed ? entry.key : maskKey(entry.key)}
                      </code>
                      <button
                        onClick={() => toggleReveal(entry.id)}
                        className="p-1 text-zinc-700 dark:text-zinc-400 dark:text-gray-600 hover:text-zinc-600 dark:hover:text-gray-400 transition-colors"
                      >
                        {isRevealed ? (
                          <EyeOff className="w-3 h-3" />
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
                            ? "text-emerald-400"
                            : entry.status === "invalid"
                            ? "text-red-400"
                            : "text-zinc-500 dark:text-gray-500"
                        )}
                      >
                        {entry.status === "active" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {entry.status === "active"
                          ? "Connected"
                          : entry.status === "invalid"
                          ? "Invalid"
                          : "Untested"}
                      </span>
                      <span className="text-[10px] text-zinc-700 dark:text-zinc-400 dark:text-gray-600">
                        Added {entry.addedAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {entry.status !== "active" && (
                    <button
                      onClick={() => handleTest(entry.id)}
                      className="px-3 py-1.5 rounded-lg bg-surface-200/50 text-zinc-600 dark:text-gray-400 hover:text-emerald-400 text-xs font-medium transition-all"
                    >
                      Test
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-400 dark:text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Key Form */}
      {showAddForm ? (
        <div className="glass rounded-2xl p-6 animate-fade-in">
          <h3 className="text-base font-semibold mb-4">Add New API Key</h3>

          <div className="space-y-4">
            {/* Provider */}
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
                Provider
              </label>
              <div className="flex gap-2">
                {(["openai", "gemini", "deepseek"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewProvider(p)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      newProvider === p
                        ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                        : "bg-surface-200 text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 border border-transparent"
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
              <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
                Label (optional)
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., Personal Key"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
              />
            </div>

            {/* Key */}
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
                API Key
              </label>
              <input
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-mono"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-surface-200 text-zinc-700 dark:text-gray-300 text-sm font-medium hover:text-zinc-900 dark:hover:text-white hover:bg-surface-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newKey.trim()}
                className="px-5 py-2 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Add Key
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-white/[0.08] text-zinc-500 dark:text-gray-500 hover:text-brand-400 hover:border-brand-500/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add API Key
        </button>
      )}
    </div>
  );
}
