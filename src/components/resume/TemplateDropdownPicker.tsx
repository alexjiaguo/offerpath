"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CaretDown, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { TEMPLATE_CONFIGS } from "./templates/config";
import { useTranslation } from "@/i18n";

interface TemplateDropdownPickerProps {
  selectedTemplate: string;
  onSelect: (id: string) => void;
  className?: string;
}

export default function TemplateDropdownPicker({
  selectedTemplate,
  onSelect,
  className,
}: TemplateDropdownPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const current = TEMPLATE_CONFIGS.find(t => t.id === selectedTemplate) || TEMPLATE_CONFIGS[0];

  const getTemplateName = (id: string, fallback: string) => {
    return (t.resumeStudio?.templatesMap as Record<string, string>)?.[id] || fallback;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative min-w-[130px]", className)} ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-surface-50 border border-surface-200 text-surface-400 px-2 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer focus:outline-none hover:bg-surface-100 transition-all truncate shadow-2xs"
      >
        <div className="flex items-center gap-2 truncate">
          <div className="w-6 h-6 relative rounded-[4px] overflow-hidden flex-shrink-0 border border-surface-200/60 shadow-sm">
            <Image
              src={`/images/templates/${current.thumbnail}.png`}
              alt={getTemplateName(current.id, current.name)}
              fill
              sizes="24px"
              className="object-cover object-top"
            />
          </div>
          <span className="truncate">{getTemplateName(current.id, current.name)}</span>
        </div>
        <CaretDown className={cn("w-3.5 h-3.5 flex-shrink-0 ml-2 text-surface-300 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-surface-200 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3 animate-reveal-up max-h-[450px] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATE_CONFIGS.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id;
              const tmplName = getTemplateName(tmpl.id, tmpl.name);
              return (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    onSelect(tmpl.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative group flex flex-col items-center rounded-lg overflow-hidden border-2 transition-all text-left focus:outline-none",
                    isSelected
                      ? "border-ember-500 shadow-sm"
                      : "border-transparent hover:border-surface-200"
                  )}
                  title={tmplName}
                >
                  <div className="aspect-[1/1.414] bg-surface-100 relative w-full overflow-hidden border border-surface-200/50 rounded flex-shrink-0">
                    <Image
                      src={`/images/templates/${tmpl.thumbnail}.png`}
                      alt={tmplName}
                      fill
                      sizes="100px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-ember-500 rounded-full shadow-sm animate-fade-in flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-white" weight="fill" />
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "w-full px-1 py-1.5 text-[9px] font-bold uppercase tracking-wider text-center truncate transition-colors mt-1 rounded",
                    isSelected ? "text-ember-600 bg-ember-50" : "text-surface-400 group-hover:bg-surface-50"
                  )}>
                    {tmplName}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
