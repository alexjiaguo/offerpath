"use client";

import Image from "next/image";
import { CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { TEMPLATE_CONFIGS } from "./templates/config";

interface TemplateThumbnailPickerProps {
  selectedTemplate: string;
  onSelect: (id: string) => void;
}

export default function TemplateThumbnailPicker({
  selectedTemplate,
  onSelect,
}: TemplateThumbnailPickerProps) {
  return (
    <div className="flex-1 min-w-0 w-full overflow-hidden">
      <div className="flex overflow-x-auto gap-3 pb-2 pt-1 px-1 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {TEMPLATE_CONFIGS.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => onSelect(tmpl.id)}
              className={cn(
                "relative group flex-shrink-0 w-[84px] rounded-lg overflow-hidden border-2 transition-all snap-start text-left focus:outline-none",
                isSelected
                  ? "border-ember-500 shadow-sm"
                  : "border-surface-200 hover:border-surface-300 shadow-sm"
              )}
              title={tmpl.name}
            >
              <div className="aspect-[1/1.414] bg-surface-100 relative w-full overflow-hidden border-b border-surface-200/50">
                <Image
                  src={`/images/templates/${tmpl.thumbnail}.png`}
                  alt={tmpl.name}
                  fill
                  sizes="84px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  priority={tmpl.thumbnail === "1" || tmpl.thumbnail === "2"}
                />
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-ember-500 rounded-full shadow-sm animate-fade-in flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-white" weight="fill" />
                  </div>
                )}
              </div>
              <div className={cn(
                "w-full px-1 py-1.5 text-[9px] font-bold uppercase tracking-wider text-center truncate transition-colors",
                isSelected ? "text-ember-600 bg-ember-50" : "text-surface-400 bg-surface-0 group-hover:bg-surface-50"
              )}>
                {tmpl.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
