"use client";

import { useState, useEffect, useRef } from "react";
import type { ResumeData } from "@/types";
import { resumeToMarkdown, markdownToResume } from "./markdownConverter";

interface MarkdownEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  saveToHistory: () => void;
}

export default function MarkdownEditor({ data, onChange, saveToHistory }: MarkdownEditorProps) {
  const [text, setText] = useState("");
  const lastExternalData = useRef<string>("");
  const isEditing = useRef(false);

  // Sync from external data when not actively editing
  useEffect(() => {
    const md = resumeToMarkdown(data);
    if (!isEditing.current && md !== lastExternalData.current) {
      setText(md);
      lastExternalData.current = md;
    }
  }, [data]);

  const handleChange = (value: string) => {
    isEditing.current = true;
    setText(value);
  };

  const handleBlur = () => {
    isEditing.current = false;
    const parsed = markdownToResume(text, data);
    saveToHistory();
    onChange(parsed);
    // Re-sync in case parsing normalized anything
    const regenerated = resumeToMarkdown(parsed);
    lastExternalData.current = regenerated;
    setText(regenerated);
  };

  return (
    <div className="card-editorial rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-200 bg-surface-50">
        <span className="text-[10px] font-bold uppercase tracking-widest text-surface-300">
          Markdown Editor
        </span>
        <span className="text-[9px] text-surface-300 font-medium">
          Edits apply on blur - Ctrl+S to save
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "s") {
            e.preventDefault();
            handleBlur();
          }
        }}
        spellCheck={false}
        className="w-full h-[600px] px-5 py-4 bg-white text-surface-400 text-[13px] font-mono leading-relaxed resize-none focus:outline-none border-none"
        placeholder="# Your Name&#10;email@example.com | (555) 123-4567 | City&#10;&#10;## Summary&#10;Write your summary...&#10;&#10;## Experience&#10;### Title | Company | Start - End&#10;- Achievement bullet"
      />
    </div>
  );
}
