"use client";

import { X, Plus, DotsSixVertical, EyeSlash } from "@phosphor-icons/react";
import { useEditContext } from "./EditContext";
import React, { useState, type CSSProperties } from "react";
import { useTranslation } from "@/i18n";

const ctrlStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: "none",
  background: "transparent",
  padding: "2px",
  opacity: 0.25,
  transition: "opacity 0.15s",
  verticalAlign: "middle",
};

const groupStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "2px",
  marginLeft: "4px",
  verticalAlign: "middle",
};

/** Delete button for an entry. */
export function EntryActions({
  section,
  index,
}: {
  section: string;
  index: number;
}) {
  const { t } = useTranslation();
  const ctx = useEditContext();
  if (!ctx?.editable) return null;
  return (
    <span style={groupStyle} contentEditable={false}>
      <button
        type="button"
        style={ctrlStyle}
        title={t("resumeStudio.removeEntry") || "Delete entry"}
        onPointerDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          ctx.onRemove(section, index);
        }}
      >
        <X size={11} weight="bold" color="#ef4444" />
      </button>
    </span>
  );
}

/** Drag handle for reordering entries. */
export function DragHandle({
  section,
  index,
}: {
  section: string;
  index: number;
}) {
  const { t } = useTranslation();
  const ctx = useEditContext();
  if (!ctx?.editable) return null;
  return (
    <span
      style={{ ...ctrlStyle, cursor: "grab", opacity: 0.2 }}
      contentEditable={false}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ section, index }));
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = "0.2";
      }}
      title={t("resumeStudio.inlineControls.dragToReorder") || "Drag to reorder"}
    >
      <DotsSixVertical size={11} color="#9ca3af" />
    </span>
  );
}

/** Drop target wrapper for reordering. */
export function DropZone({
  section,
  index,
  children,
}: {
  section: string;
  index: number;
  children: React.ReactNode;
}) {
  const ctx = useEditContext();
  if (!ctx?.editable) return <>{children}</>;
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        (e.currentTarget as HTMLElement).style.outline = "1.5px dashed rgba(129, 140, 248, 0.5)";
      }}
      onDragLeave={(e) => {
        (e.currentTarget as HTMLElement).style.outline = "";
      }}
      onDrop={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).style.outline = "";
        try {
          const data = JSON.parse(e.dataTransfer.getData("text/plain"));
          if (data.section === section && data.index !== index) {
            ctx.onReorder(section, data.index, index);
          }
        } catch {
          // ignore invalid drag data
        }
      }}
    >
      {children}
    </div>
  );
}

/** + Add button at the end of a section. */
export function AddEntryButton({
  section,
  label,
}: {
  section: string;
  label?: string;
}) {
  const { t } = useTranslation();
  const ctx = useEditContext();
  if (!ctx?.editable) return null;
  return (
    <button
      type="button"
      contentEditable={false}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        cursor: "pointer",
        border: "1px dashed #c4b5fd",
        background: "rgba(129, 140, 248, 0.05)",
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "9px",
        fontWeight: 600,
        color: "#818cf8",
        marginTop: "4px",
        opacity: 0.6,
        transition: "opacity 0.15s",
      }}
      onPointerDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        ctx.onAdd(section);
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
    >
      <Plus size={9} weight="bold" />
      {label || `${t("resumeStudio.addSection")} ${section}`}
    </button>
  );
}

/** Delete button for a bullet point. */
export function BulletDelete({
  expIndex,
  bulletIndex,
}: {
  expIndex: number;
  bulletIndex: number;
}) {
  const { t } = useTranslation();
  const ctx = useEditContext();
  if (!ctx?.editable) return null;
  return (
    <button
      type="button"
      contentEditable={false}
      style={{
        ...ctrlStyle,
        marginLeft: "4px",
        display: "inline-flex",
      }}
      title={t("resumeStudio.removeEntry") || "Delete bullet"}
      onPointerDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        ctx.onRemoveBullet(expIndex, bulletIndex);
      }}
    >
      <X size={9} weight="bold" color="#ef4444" />
    </button>
  );
}

/** + Add Bullet button at the end of a bullet list. */
export function AddBulletButton({ expIndex }: { expIndex: number }) {
  const { t } = useTranslation();
  const ctx = useEditContext();
  if (!ctx?.editable) return null;
  return (
    <li
      contentEditable={false}
      style={{
        listStyleType: "none",
        cursor: "pointer",
        border: "1px dashed #c4b5fd",
        background: "rgba(129, 140, 248, 0.05)",
        borderRadius: "3px",
        padding: "1px 6px",
        fontSize: "9px",
        fontWeight: 600,
        color: "#818cf8",
        marginTop: "3px",
        display: "inline-block",
        opacity: 0.6,
        width: "fit-content",
      }}
      onPointerDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        ctx.onAddBullet(expIndex);
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
    >
      <Plus size={8} weight="bold" style={{ display: "inline", verticalAlign: "middle", marginRight: "2px" }} />
      {t("resumeStudio.inlineControls.addBullet")}
    </li>
  );
}

/** Section visibility toggle (eye icon). */
export function SectionVisibilityToggle({
  sectionKey,
}: {
  sectionKey: string;
}) {
  const { t } = useTranslation();
  const ctx = useEditContext();
  if (!ctx?.editable) return null;
  return (
    <span style={{ ...groupStyle, marginLeft: "auto" }} contentEditable={false}>
      <button
        type="button"
        style={ctrlStyle}
        title={t("resumeStudio.inlineControls.hideSection") || "Toggle section visibility"}
        onPointerDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          ctx.onToggleSection(sectionKey as never);
        }}
      >
        <EyeSlash size={10} color="#9ca3af" />
      </button>
    </span>
  );
}

/** Wrapper for editable skill chips with delete button. */
export function EditableSkillChip({
  field,
  value,
  style,
  section,
  index,
}: {
  field: string;
  value: string;
  style: CSSProperties;
  section: string;
  index: number;
}) {
  const { t } = useTranslation();
  const ctx = useEditContext();
  if (!ctx?.editable) {
    return <span style={style}>{value}</span>;
  }
  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", gap: "2px" }}>
      <span
        contentEditable
        suppressContentEditableWarning
        data-field={field}
        style={{ outline: "none", cursor: "text" }}
        onFocus={(e) => {
          ctx?.setFocusedField(field);
          e.currentTarget.style.boxShadow = "0 0 0 1px rgba(129, 140, 248, 0.4)";
        }}
        onBlur={(e) => {
          ctx?.setFocusedField(null);
          e.currentTarget.style.boxShadow = "";
          const content = e.currentTarget.textContent || "";
          if (content !== value) {
            ctx?.saveToHistory();
            ctx?.onEdit(field, content);
          }
        }}
      >
        {value}
      </span>
      <button
        type="button"
        contentEditable={false}
        style={{ ...ctrlStyle, opacity: 0.4, padding: "0" }}
        title={t("resumeStudio.removeEntry") || "Remove skill"}
        onPointerDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          ctx.onRemove(section, index);
        }}
      >
        <X size={8} weight="bold" color="#ef4444" />
      </button>
    </span>
  );
}

/** Click-to-upload headshot. Renders a file input + label overlaid on the photo area when editable. */
export function HeadshotUpload({
  size,
  radius,
  photoUrl,
  themeAccent,
  circular,
  alt = "Profile",
}: {
  size: number;
  radius: number;
  photoUrl?: string;
  themeAccent?: string;
  circular?: boolean;
  alt?: string;
}) {
  const { t, isZh } = useTranslation();
  const ctx = useEditContext();
  const [hovered, setHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputId = React.useId();
  const borderRadius = circular ? "50%" : `${radius}px`;
  const ringColor = themeAccent || "#fff";
  const frameStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    boxShadow: themeAccent ? `0 0 0 2px ${ringColor}` : undefined,
    overflow: "hidden",
  };

  // Non-editable mode: render the photo with no upload UI
  if (!ctx?.editable) {
    return photoUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={alt}
        style={{
          ...frameStyle,
          objectFit: "cover",
          display: "block",
        }}
      />
    ) : (
      <div
        style={{
          ...frameStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ccc",
          fontSize: "10px",
        }}
      >
        {isZh ? "照片" : "Photo"}
      </div>
    );
  }

  // Editable mode: wrap photo in a label with file input
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB cap
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      ctx.saveToHistory();
      ctx.onEdit("personal.photo_url", dataUrl);
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
    // allow re-selecting the same file later
    e.target.value = "";
  };

  return (
    <label
      htmlFor={inputId}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...frameStyle,
        position: "relative",
        display: "block",
        cursor: "pointer",
      }}
      title={t("resumeStudio.inlineControls.uploadPhoto")}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ccc",
            fontSize: "10px",
            background: "#eee",
          }}
        >
          {isZh ? "照片" : "Photo"}
        </div>
      )}
      {(hovered || uploading) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            borderRadius,
          }}
        >
          {uploading ? t("resumeStudio.inlineControls.uploading") : photoUrl ? t("resumeStudio.inlineControls.changePhoto") : t("resumeStudio.inlineControls.uploadPhoto")}
        </div>
      )}
    </label>
  );
}
