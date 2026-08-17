"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export function SortableSectionTab({
  tabId,
  label,
  Icon,
  isActive,
  isVisible,
  canToggle,
  onClick,
  onToggleVisibility,
  disabled,
  compact,
  count,
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
  compact?: boolean;
  count?: number;
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
      title={label}
      className={cn(
        "group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-grab active:cursor-grabbing select-none shrink-0",
        isActive
          ? "bg-surface-400 text-white shadow-sm"
          : "text-surface-300 hover:bg-surface-100 hover:text-surface-400",
        !isVisible && "opacity-45"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {!compact && <span>{label}</span>}
      {count !== undefined && count > 0 && !compact && (
        <span
          className={cn(
            "text-[9px] px-1 py-0.2 rounded-full font-bold tabular-nums",
            isActive ? "bg-white/20 text-white" : "bg-surface-200 text-surface-400"
          )}
        >
          {count}
        </span>
      )}
      {canToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title={isVisible ? "Hide section" : "Show section"}
          className={cn(
            "p-0.5 rounded transition-opacity ml-0.5",
            isActive
              ? "text-white/60 hover:text-white"
              : "text-surface-300 hover:text-surface-400"
          )}
        >
          {isVisible ? <Eye className="w-3 h-3" /> : <EyeSlash className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}
