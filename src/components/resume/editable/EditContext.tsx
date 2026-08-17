"use client";

import { createContext, useContext, useCallback, useState, type ReactNode } from "react";
import type { ResumeData, SectionKey } from "@/types";
import { applyFieldEdit, addEntry, removeEntry, reorderEntries, addBullet, removeBullet } from "./fieldPath";

export interface EditContextValue {
  editable: boolean;
  onEdit: (fieldPath: string, value: string) => void;
  onAdd: (section: string, index?: number) => void;
  onRemove: (section: string, index: number) => void;
  onReorder: (section: string, fromIndex: number, toIndex: number) => void;
  onAddBullet: (expIndex: number) => void;
  onRemoveBullet: (expIndex: number, bulletIndex: number) => void;
  onToggleSection: (sectionKey: SectionKey) => void;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  saveToHistory: () => void;
}

const EditCtx = createContext<EditContextValue | null>(null);

export function useEditContext(): EditContextValue | null {
  return useContext(EditCtx);
}

export function useEditable(): boolean {
  const ctx = useContext(EditCtx);
  return ctx?.editable ?? false;
}

interface EditProviderProps {
  editable: boolean;
  data: ResumeData;
  resumeId: string;
  updateResume: (id: string, updates: { data: ResumeData }) => void;
  saveToHistory: (id: string) => void;
  toggleVisibility: (id: string, template: string, sectionKey: SectionKey) => void;
  template: string;
  children: ReactNode;
}

export function EditProvider({
  editable,
  data,
  resumeId,
  updateResume,
  saveToHistory,
  toggleVisibility,
  template,
  children,
}: EditProviderProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const onEdit = useCallback(
    (fieldPath: string, value: string) => {
      const newData = applyFieldEdit(data, fieldPath, value);
      updateResume(resumeId, { data: newData });
    },
    [data, resumeId, updateResume],
  );

  const saveToHistoryCb = useCallback(() => {
    saveToHistory(resumeId);
  }, [resumeId, saveToHistory]);

  const onAdd = useCallback(
    (section: string) => {
      saveToHistory(resumeId);
      const newData = addEntry(data, section);
      updateResume(resumeId, { data: newData });
    },
    [data, resumeId, updateResume, saveToHistory],
  );

  const onRemove = useCallback(
    (section: string, index: number) => {
      saveToHistory(resumeId);
      const newData = removeEntry(data, section, index);
      updateResume(resumeId, { data: newData });
    },
    [data, resumeId, updateResume, saveToHistory],
  );

  const onReorder = useCallback(
    (section: string, fromIndex: number, toIndex: number) => {
      saveToHistory(resumeId);
      const newData = reorderEntries(data, section, fromIndex, toIndex);
      updateResume(resumeId, { data: newData });
    },
    [data, resumeId, updateResume, saveToHistory],
  );

  const onAddBullet = useCallback(
    (expIndex: number) => {
      saveToHistory(resumeId);
      const newData = addBullet(data, expIndex);
      updateResume(resumeId, { data: newData });
    },
    [data, resumeId, updateResume, saveToHistory],
  );

  const onRemoveBullet = useCallback(
    (expIndex: number, bulletIndex: number) => {
      saveToHistory(resumeId);
      const newData = removeBullet(data, expIndex, bulletIndex);
      updateResume(resumeId, { data: newData });
    },
    [data, resumeId, updateResume, saveToHistory],
  );

  const onToggleSection = useCallback(
    (sectionKey: SectionKey) => {
      toggleVisibility(resumeId, template, sectionKey);
    },
    [resumeId, template, toggleVisibility],
  );

  const value: EditContextValue = {
    editable,
    onEdit,
    onAdd,
    onRemove,
    onReorder,
    onAddBullet,
    onRemoveBullet,
    onToggleSection,
    focusedField,
    setFocusedField,
    saveToHistory: saveToHistoryCb,
  };

  return <EditCtx.Provider value={value}>{children}</EditCtx.Provider>;
}
