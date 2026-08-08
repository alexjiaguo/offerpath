"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { TextB, TextItalic, TextUnderline as UnderlineIcon, TextStrikethrough, ListDashes, ListNumbers, PaintBucket } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface RichTextFieldProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function MiniBtn({ onClick, active, disabled, children, title }: {
  onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode; title?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={cn("p-1 rounded transition-all",
        active ? "bg-brand-500/20 text-brand-700" : "text-surface-300 hover:text-surface-400 hover:bg-black/5",
        disabled && "opacity-30 cursor-not-allowed")}>
      {children}
    </button>
  );
}

export function stripPTags(html: string): string {
  return html.replace(/<\/?p>/g, '');
}

export function ensureHtml(content: string): string {
  if (!content) return '<p></p>';
  if (content.startsWith('<')) return content;
  return `<p>${content}</p>`;
}

export default function RichTextField({ content, onChange, placeholder, minHeight = 80 }: RichTextFieldProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
    ],
    content: ensureHtml(content),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none px-3 py-2 focus:outline-none text-surface-400 leading-relaxed [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-0.5",
        'data-placeholder': placeholder || '',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content) {
      const current = editor.getHTML();
      if (current.replace(/\s+/g, ' ').trim() !== content.replace(/\s+/g, ' ').trim()) {
        editor.commands.setContent(ensureHtml(content), false);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl bg-white border border-surface-200 overflow-hidden focus-within:border-brand-500/40 transition-colors">
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-surface-200 bg-surface-50/50">
        <MiniBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <TextB className="w-3.5 h-3.5" />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <TextItalic className="w-3.5 h-3.5" />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <TextStrikethrough className="w-3.5 h-3.5" />
        </MiniBtn>
        <div className="w-px h-4 bg-surface-200 mx-0.5" />
        <MiniBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <ListDashes className="w-3.5 h-3.5" />
        </MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <ListNumbers className="w-3.5 h-3.5" />
        </MiniBtn>
        <div className="w-px h-4 bg-surface-200 mx-0.5" />
        <MiniBtn onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()} active={editor.isActive("highlight")} title="Highlight">
          <PaintBucket className="w-3.5 h-3.5" />
        </MiniBtn>
      </div>
      <EditorContent editor={editor} style={{ minHeight }} />
    </div>
  );
}
