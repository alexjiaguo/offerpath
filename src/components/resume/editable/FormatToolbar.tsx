"use client";

import {
  TextB,
  TextItalic,
  TextUnderline as UnderlineIcon,
  TextStrikethrough,
  PaintBucket,
  ArrowClockwise,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useEditContext } from "./EditContext";
import { useTranslation } from "@/i18n";

interface FormatToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
];

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Brand", value: "#818cf8" },
  { label: "Green", value: "#10b981" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Red", value: "#ef4444" },
  { label: "Gray", value: "#9ca3af" },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-all",
        active
          ? "bg-brand-500/20 text-brand-700"
          : "text-surface-300 hover:text-surface-400 hover:bg-black/5",
        disabled && "opacity-30 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-black/10 mx-1" />;
}

export function FormatToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: FormatToolbarProps) {
  const { t } = useTranslation();
  const ctx = useEditContext();

  if (!ctx?.editable) return null;

  const hasFocus = ctx.focusedField !== null;
  const isRichField =
    hasFocus &&
    typeof document !== "undefined" &&
    document.activeElement?.getAttribute("data-rich") === "true";

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl mb-2 flex-wrap">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => onUndo?.()}
        disabled={!canUndo}
        title={t("resumeStudio.actions.undo") || "Undo"}
      >
        <ArrowCounterClockwise className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => onRedo?.()}
        disabled={!canRedo}
        title={t("resumeStudio.actions.redo") || "Redo"}
      >
        <ArrowClockwise className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => exec("bold")}
        disabled={!isRichField}
        title={t("resumeStudio.formatToolbar.bold") || "Bold"}
      >
        <TextB className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => exec("italic")}
        disabled={!isRichField}
        title={t("resumeStudio.formatToolbar.italic") || "Italic"}
      >
        <TextItalic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => exec("underline")}
        disabled={!isRichField}
        title={t("resumeStudio.formatToolbar.underline") || "Underline"}
      >
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => exec("strikeThrough")}
        disabled={!isRichField}
        title={t("resumeStudio.formatToolbar.strikethrough") || "Strikethrough"}
      >
        <TextStrikethrough className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Highlight */}
      <div className="relative group">
        <ToolbarButton
          onClick={() => exec("hiliteColor", "#fef08a")}
          disabled={!isRichField}
          title={t("resumeStudio.formatToolbar.highlight") || "Highlight"}
        >
          <PaintBucket className="w-4 h-4" />
        </ToolbarButton>
        <div className="absolute top-full left-0 mt-1 p-2 rounded-lg bg-surface-200 border border-border shadow-xl hidden group-hover:flex gap-1 z-20">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("hiliteColor", c.value)}
              className="w-5 h-5 rounded-full border border-surface-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Text Color */}
      <div className="relative group">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("foreColor", TEXT_COLORS[1].value)}
          disabled={!isRichField}
          title={t("resumeStudio.formatToolbar.textColor") || "Text Color"}
          className={cn(
            "p-1.5 rounded-md transition-all text-surface-300 hover:text-surface-400 hover:bg-black/5",
            !isRichField && "opacity-30 cursor-not-allowed",
          )}
        >
          <span className="inline-flex items-center justify-center w-4 h-4 border-b-2 border-surface-300 text-[8px] font-bold">
            A
          </span>
        </button>
        <div className="absolute top-full left-0 mt-1 p-2 rounded-lg bg-surface-200 border border-border shadow-xl hidden group-hover:flex gap-1 z-20">
          {TEXT_COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (c.value) {
                  exec("foreColor", c.value);
                } else {
                  exec("removeFormat");
                }
              }}
              className="w-5 h-5 rounded-full border border-surface-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: c.value || "#e5e7eb" }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">
          {hasFocus
            ? isRichField
              ? (t("resumeStudio.formatToolbar.formatting") || "Formatting")
              : (t("resumeStudio.formatToolbar.editing") || "Editing")
            : (t("resumeStudio.formatToolbar.clickToEdit") || "Click text to edit")}
        </span>
      </div>
    </div>
  );
}
