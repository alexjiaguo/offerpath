"use client";

import { useRef, useEffect, createElement, type CSSProperties, type ElementType, type Ref } from "react";
import { useEditContext } from "./EditContext";
import { sanitizeHtml } from "../templates/shared";
import { markdownInlineToHtml, unwrapMarkdownBold } from "@/lib/markdownInline";
import { DragHandle, EntryActions } from "./InlineControls";
import { EditableDateRange } from "./EditableDateRange";
import type { ProjectEntry, EducationEntry, ResumeTheme } from "@/types";

interface EditableTextProps {
  field: string;
  value: string | undefined;
  html?: boolean;
  style?: CSSProperties;
  className?: string;
  tag?: ElementType;
}

/**
 * Uncontrolled contentEditable wrapper.
 *
 * When editable=false: renders plain text or dangerouslySetInnerHTML identically
 * to the original template rendering.
 *
 * When editable=true: renders a contentEditable element whose content is set
 * imperatively via ref. React never manages the children, so the browser's
 * caret position is never disrupted. On blur, the content is read and dispatched
 * to the store via onEdit.
 */
export function EditableText({
  field,
  value,
  html = false,
  style,
  className,
  tag = "span",
}: EditableTextProps) {
  const ctx = useEditContext();
  const editable = ctx?.editable ?? false;
  const ref = useRef<HTMLElement>(null);
  const focusedRef = useRef(false);
  const Tag = tag as ElementType;
  const display = html ? markdownInlineToHtml(value || "") : unwrapMarkdownBold(value || "");

  // Sync content from props when not focused (handles external updates like undo/redo)
  useEffect(() => {
    if (!ref.current || focusedRef.current) return;
    if (html) {
      ref.current.innerHTML = display;
    } else {
      ref.current.textContent = display;
    }
  }, [display, html]);

  if (!editable) {
    if (html) {
      return createElement(Tag, {
        style,
        className,
        dangerouslySetInnerHTML: { __html: sanitizeHtml(display) },
      });
    }
    return createElement(Tag, { style, className }, display);
  }

  // Editable mode: uncontrolled contentEditable
  return createElement(
    Tag,
    {
      ref: ref as Ref<HTMLElement>,
      contentEditable: true,
      suppressContentEditableWarning: true,
      "data-field": field,
      "data-rich": html ? "true" : undefined,
      style: {
        ...style,
        outline: "none",
        borderRadius: "2px",
        transition: "box-shadow 0.15s",
        cursor: "text",
      },
      className,
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        focusedRef.current = true;
        ctx?.setFocusedField(field);
        e.currentTarget.style.boxShadow = "0 0 0 1.5px rgba(129, 140, 248, 0.4)";
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        focusedRef.current = false;
        ctx?.setFocusedField(null);
        e.currentTarget.style.boxShadow = "";
        const content = html
          ? markdownInlineToHtml(e.currentTarget.innerHTML)
          : unwrapMarkdownBold(e.currentTarget.textContent || "");
        if (content !== display) {
          ctx?.saveToHistory();
          ctx?.onEdit(field, content);
        }
      },
    },
  );
}

export function ProjectEntryContent({
  item,
  index,
  theme,
}: {
  item: ProjectEntry;
  index: number;
  theme: ResumeTheme;
}) {
  const projectNameStyle: CSSProperties = {
    color: theme.primaryColor || "#0f172a",
    fontWeight: 700,
  };
  const projectDescriptionStyle: CSSProperties = {
    color: theme.textColor || "#333333",
    fontWeight: 400,
    whiteSpace: "pre-line",
  };

  const rawName = item.name ?? "";
  const rawDescription = item.description ?? "";
  let displayName = rawName;
  let displayDescription = rawDescription;
  let derivedFromName = false;
  let extractedUrl = item.url;

  // 1. If rawName contains markdown link: [Name](url) or **[Name](url)**
  const mdLinkMatch = rawName.match(
    /^(?:\*\*)?\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)(?:\*\*)?(.*)/
  );
  if (mdLinkMatch) {
    displayName = mdLinkMatch[1].trim();
    if (!extractedUrl) extractedUrl = mdLinkMatch[2].trim();
    const rest = mdLinkMatch[3]?.trim();
    if (rest && !displayDescription) {
      displayDescription = rest.replace(/^[：:\s–—-]+/, "").trim();
      derivedFromName = true;
    }
  }

  // 2. If description was stored inside name (e.g. "OfferPath: AI job-search..." or "OfferPath：AI求职...")
  if (!displayDescription) {
    const splitAt =
      displayName.indexOf("：") >= 0
        ? displayName.indexOf("：")
        : displayName.indexOf(":");
    if (splitAt > 0) {
      displayDescription = displayName.slice(splitAt + 1).trim();
      displayName = displayName.slice(0, splitAt).trim();
      derivedFromName = true;
    }
  }

  // 3. Clean up displayName: strip wrapping bold and any trailing colon
  displayName = unwrapMarkdownBold(displayName).replace(/[：:\s–—-]+$/, "").trim();

  // 4. Clean up displayDescription: remove any redundant leading delimiter
  if (displayDescription) {
    displayDescription = displayDescription.replace(/^[：:\s–—-]+/, "").trim();
  }

  const projectUrl = extractedUrl
    ? extractedUrl.startsWith("http://") || extractedUrl.startsWith("https://")
      ? extractedUrl
      : `https://${extractedUrl}`
    : undefined;
  const badgeText = projectUrl?.includes("github.com")
    ? "(github)"
    : "(website)";

  return (
    <div
      style={{
        position: "relative",
        paddingLeft: "14px",
        fontSize: `${theme.baseFontSize ?? 10}px`,
        lineHeight: theme.lineHeight ?? 1.35,
        marginBottom: `${theme.itemSpacing ?? 8}px`,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "2px",
          top: "0px",
          color: theme.textColor || "#2d3748",
          lineHeight: theme.lineHeight ?? 1.35,
          userSelect: "none",
        }}
        aria-hidden="true"
      >
        •
      </span>
      <DragHandle section="projects" index={index} />
      {projectUrl ? (
        <a
          href={projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: theme.primaryColor || "#0f172a",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <EditableText
            field={`projects[${index}].name`}
            value={displayName}
            style={projectNameStyle}
          />
        </a>
      ) : (
        <EditableText
          field={`projects[${index}].name`}
          value={displayName}
          style={projectNameStyle}
        />
      )}
      {projectUrl && (
        <a
          href={projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: theme.primaryColor || "#0f172a",
            opacity: 0.65,
            fontWeight: 400,
            fontSize: "0.88em",
            marginLeft: "4px",
            textDecoration: "none",
          }}
        >
          {badgeText}
        </a>
      )}
      {displayDescription && (
        <span style={projectDescriptionStyle}>
          {derivedFromName ? "： " : (/[\u4e00-\u9fa5]/.test(displayName + displayDescription) ? "： " : " — ")}
          <EditableText
            field={`projects[${index}].description`}
            value={displayDescription}
            html
            style={projectDescriptionStyle}
          />
        </span>
      )}
      <EntryActions section="projects" index={index} />
      {(item.tech || []).length > 0 && (
        <div
          style={{
            color: theme.accentColor,
            fontSize: "0.95em",
            fontWeight: 400,
            marginTop: "2px",
          }}
        >
          {item.tech!.join(" · ")}
        </div>
      )}
    </div>
  );
}

export function SingleLineEduEntry({
  item,
  index,
  theme,
}: {
  item: EducationEntry;
  index: number;
  theme: ResumeTheme;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: `${theme.itemSpacing ?? 6}px`,
        fontSize: `${theme.baseFontSize ?? 10}px`,
        lineHeight: theme.lineHeight ?? 1.3,
        position: "relative",
      }}
    >
      <DragHandle section="education" index={index} />
      <div
        style={{
          display: "flex",
          gap: "4px",
          alignItems: "baseline",
          flexWrap: "wrap",
          minWidth: 0,
          marginRight: "12px",
        }}
      >
        <strong
          style={{
            fontWeight: 700,
            fontSize: `${theme.companyFontSize ?? 11}px`,
            color: theme.primaryColor,
          }}
        >
          <EditableText
            field={`education[${index}].institution`}
            value={item.institution}
            style={{ fontWeight: 700, color: theme.primaryColor }}
          />
          {item.location ? (
            <span style={{ fontWeight: 400, color: theme.textColor || "#2d3748", fontSize: "0.95em" }}>
              {` — `}
              <EditableText
                field={`education[${index}].location`}
                value={item.location}
                style={{ fontWeight: 400, color: theme.textColor || "#2d3748" }}
              />
            </span>
          ) : null}
        </strong>
        <span
          style={{
            fontStyle: "italic",
            fontWeight: 400,
            color: theme.textColor || "#2d3748",
          }}
        >
          {item.degree ? (
            <>
              {", "}
              <EditableText
                field={`education[${index}].degree`}
                value={item.degree}
                style={{ fontStyle: "italic", fontWeight: 400 }}
              />
            </>
          ) : null}
          {item.field ? (
            <>
              {item.degree ? " in " : ", "}
              <EditableText
                field={`education[${index}].field`}
                value={item.field}
                style={{ fontStyle: "italic", fontWeight: 400 }}
              />
            </>
          ) : null}
          {item.gpa ? (
            <span
              style={{
                fontStyle: "normal",
                color: theme.accentColor,
                marginLeft: "6px",
              }}
            >
              · GPA: <EditableText field={`education[${index}].gpa`} value={item.gpa} />
            </span>
          ) : null}
        </span>
        <EntryActions section="education" index={index} />
      </div>
      {(item.start_date || item.end_date) && (
        <div
          style={{
            color: theme.accentColor,
            fontWeight: 600,
            whiteSpace: "nowrap",
            fontSize: "9.5px",
            flexShrink: 0,
          }}
        >
          <EditableDateRange
            pathPrefix={`education[${index}]`}
            start={item.start_date}
            end={item.end_date}
            style={{
              color: theme.accentColor,
              fontWeight: 600,
              fontSize: "9.5px",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function TwoLineEduEntry({
  item,
  index,
  theme,
  isDarkSidebar = false,
}: {
  item: EducationEntry;
  index: number;
  theme: ResumeTheme;
  isDarkSidebar?: boolean;
}) {
  const schoolColor = isDarkSidebar
    ? "#ffffff"
    : theme.primaryColor || "#0f172a";
  const degreeColor = isDarkSidebar
    ? "#d0d0e0"
    : theme.textColor || "#2d3748";
  const accentColor = isDarkSidebar
    ? theme.sidebarAccent || "#7ec8e3"
    : theme.accentColor || "#0066cc";

  return (
    <div
      style={{
        marginBottom: `${theme.itemSpacing ?? 6}px`,
        fontSize: `${theme.baseFontSize ?? 10}px`,
        lineHeight: theme.lineHeight ?? 1.3,
        position: "relative",
      }}
    >
      <DragHandle section="education" index={index} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "6px",
        }}
      >
        <strong
          style={{
            fontWeight: 700,
            fontSize: `${theme.companyFontSize ?? 11}px`,
            color: schoolColor,
          }}
        >
          <EditableText
            field={`education[${index}].institution`}
            value={item.institution}
            style={{ fontWeight: 700, color: schoolColor }}
          />
          {item.location ? (
            <span style={{ fontWeight: 400, color: degreeColor, fontSize: "0.95em" }}>
              {` — `}
              <EditableText
                field={`education[${index}].location`}
                value={item.location}
                style={{ fontWeight: 400, color: degreeColor }}
              />
            </span>
          ) : null}
        </strong>
        {(item.start_date || item.end_date) && (
          <div
            style={{
              color: accentColor,
              fontWeight: 600,
              whiteSpace: "nowrap",
              fontSize: "9.5px",
              flexShrink: 0,
            }}
          >
            <EditableDateRange
              pathPrefix={`education[${index}]`}
              start={item.start_date}
              end={item.end_date}
              style={{
                color: accentColor,
                fontWeight: 600,
                fontSize: "9.5px",
              }}
            />
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "4px",
          marginTop: "1px",
        }}
      >
        <span style={{ fontWeight: 400, color: degreeColor }}>
          {item.degree ? (
            <EditableText
              field={`education[${index}].degree`}
              value={item.degree}
              style={{ fontWeight: 400, color: degreeColor }}
            />
          ) : null}
          {item.field ? (
            <>
              {item.degree ? " in " : ""}
              <EditableText
                field={`education[${index}].field`}
                value={item.field}
                style={{ fontWeight: 400, color: degreeColor }}
              />
            </>
          ) : null}
          {item.gpa ? (
            <span style={{ color: accentColor, marginLeft: "6px" }}>
              · GPA: <EditableText field={`education[${index}].gpa`} value={item.gpa} />
            </span>
          ) : null}
        </span>
        <EntryActions section="education" index={index} />
      </div>
    </div>
  );
}

