import { TEMPLATE_CONFIGS } from "@/components/resume/templates/config";
import ResumePreview from "@/components/resume/ResumePreview";
import { mockResume } from "@/lib/mockResumeData";
import { DEFAULT_SECTION_VISIBILITY, SectionKey } from "@/types";

export default function PreviewTemplatesPage() {
  return (
    <div className="bg-neutral-100 p-8 flex flex-col items-center gap-16 min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Resume Template Rendering Engine</h1>
        <p className="text-neutral-500">
          This hidden route is used by automation scripts to snap high-res screenshots of templates.
        </p>
      </div>

      <div className="flex flex-col gap-12 w-[816px]">
        {TEMPLATE_CONFIGS.map((config) => {
          // Compute visibility for this specific template
          const sectionVisibility = Object.keys(DEFAULT_SECTION_VISIBILITY).reduce(
            (acc, key) => {
              acc[key as SectionKey] = true;
              return acc;
            },
            {} as Record<SectionKey, boolean>
          );

          return (
            <div key={config.id} className="template-snapshot-wrapper flex flex-col gap-2">
              <h2 className="text-xl font-semibold px-2">{config.name} ({config.id})</h2>
              {/* strict 8.5x11 aspect ratio constraint for letter size page at 96 DPI: 816x1056 */}
              <div 
                id={`template-${config.id}`}
                className="w-[816px] h-[1056px] shadow-2xl shrink-0 overflow-hidden"
              >
                <ResumePreview
                  data={mockResume.data}
                  template={config.id}
                  theme={mockResume.theme}
                  fullScale={true}
                  sectionVisibility={sectionVisibility}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
