"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { ArrowClockwise, ArrowCounterClockwise, Minus, TextUnderline as UnderlineIcon, ListNumbers, ListDashes, PaintBucket, Palette, Quotes, TextB, TextHOne, TextHTwo, TextHThree, TextItalic, TextStrikethrough } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { useEffect } from "react";

/* ═══════════════════════════════════════════════════
   RichTextEditor — TipTap WYSIWYG editor
   Dark-themed, integrated with OfferPath design system
   ═══════════════════════════════════════════════════ */

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-all",
        active
          ? "bg-brand-500/20 text-brand-700 dark:text-brand-300"
          : "text-zinc-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-zinc-700 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/[0.04]",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-black/10 dark:bg-white/[0.06] mx-1" />;
}

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Pink", value: "#fecdd3" },
];

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Brand", value: "#818cf8" },
  { label: "Green", value: "#10b981" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Red", value: "#ef4444" },
  { label: "Gray", value: "#9ca3af" },
];

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm max-w-none min-h-[400px] px-5 py-4 focus:outline-none text-zinc-800 dark:text-gray-200 leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-gray-900 dark:[&_h1]:text-white [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 dark:[&_h3]:text-zinc-100 [&_p]:mb-2 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-brand-500/40 [&_blockquote]:pl-4 [&_blockquote]:text-zinc-400 dark:[&_blockquote]:text-zinc-400 [&_hr]:border-black/10 dark:[&_hr]:border-white/[0.06] [&_mark]:bg-yellow-200 dark:[&_mark]:bg-yellow-500/30 [&_mark]:rounded [&_mark]:px-0.5",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes only when content actually differs
  useEffect(() => {
    if (editor && content) {
      const currentHtml = editor.getHTML();
      // Only update if the content is meaningfully different (avoid normalize-triggered loops)
      if (currentHtml.replace(/\s+/g, ' ').trim() !== content.replace(/\s+/g, ' ').trim()) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl bg-surface-100 border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-surface-200/30 flex-wrap">
        {/* BsArrowCounterclockwise / BsArrowArrowClockwise */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <ArrowCounterClockwise className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <ArrowClockwise className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <TextHOne className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <TextHTwo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <TextHThree className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <TextB className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <TextItalic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <TextStrikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <ListDashes className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListNumbers className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Block elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quotes className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Highlight dropdown */}
        <div className="relative group">
          <ToolbarButton
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: "#fef08a" })
                .run()
            }
            active={editor.isActive("highlight")}
            title="Highlight"
          >
            <PaintBucket className="w-4 h-4" />
          </ToolbarButton>
          <div className="absolute top-full left-0 mt-1 p-2 rounded-lg bg-surface-200 border border-border shadow-xl hidden group-hover:flex gap-1 z-10">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({ color: c.value })
                    .run()
                }
                className="w-5 h-5 rounded-full border border-zinc-200 dark:border-white/10 hover:scale-110 transition-transform"
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Text color dropdown */}
        <div className="relative group">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-zinc-500 dark:text-gray-500"
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </span>
          <div className="absolute top-full left-0 mt-1 p-2 rounded-lg bg-surface-200 border border-border shadow-xl hidden group-hover:flex gap-1 z-10">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.label}
                onClick={() =>
                  c.value
                    ? editor.chain().focus().setColor(c.value).run()
                    : editor.chain().focus().unsetColor().run()
                }
                className="w-5 h-5 rounded-full border border-zinc-200 dark:border-white/10 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: c.value || "#e5e7eb",
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bubble menu for text selection */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150 }}
          className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-surface-200 border border-border shadow-xl"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <TextB className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <TextItalic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: "#fef08a" })
                .run()
            }
            active={editor.isActive("highlight")}
          >
            <PaintBucket className="w-3.5 h-3.5" />
          </ToolbarButton>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Word count footer */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-zinc-500 dark:text-gray-500 dark:text-gray-600">
        <span>
          {editor.storage.characterCount?.characters?.() ??
            editor.getText().length}{" "}
          characters
        </span>
        <span>
          {editor.storage.characterCount?.words?.() ??
            editor
              .getText()
              .split(/\s+/)
              .filter((w) => w).length}{" "}
          words
        </span>
      </div>
    </div>
  );
}
