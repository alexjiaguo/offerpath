"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export function SortableSectionTab({
  tabId, label, Icon, isActive, isVisible, canToggle, onClick, onToggleVisibility, disabled,
}: {
  tabId: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isVisible: boolean;
  canToggle: boolean;
  onClick: () => void;
  onToggleVisibility: () => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tabId, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      className={cn(
        "group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-grab active:cursor-grabbing select-none",
        isActive
          ? "bg-surface-400 text-white shadow-sm"
          : "text-surface-300 hover:bg-surface-100 hover:text-surface-400",
        !isVisible && "opacity-45"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {canToggle && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          onPointerDown={(e) => e.stopPropagation()}
          title={isVisible ? "Hide section" : "Show section"}
          className={cn(
            "p-0.5 rounded transition-opacity",
            isActive
              ? "text-white/60 hover:text-white"
              : "text-surface-300 hover:text-surface-400",
            isVisible ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          )}
        >
          {isVisible ? <Eye className="w-3 h-3" /> : <EyeSlash className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}
