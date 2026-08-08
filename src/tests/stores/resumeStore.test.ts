import { describe, it, expect, beforeEach } from "vitest";
import { useResumeStore } from "@/store/resumeStore";
import { DEFAULT_SECTION_VISIBILITY } from "@/types";

const DEFAULT_ORDER = [
 "summary", "experience", "education", "technicalSkills", "skills", "languages", "certifications", "projects",
] as const;

describe("resumeStore - section management", () => {
 beforeEach(() => {
 useResumeStore.setState((s) => ({
 history: { resumeId: null, past: [], future: [] },
 canUndo: false,
 canRedo: false,
 resumes: s.resumes.map((r) =>
 r.id === "r1"
 ? { ...r, section_order: [...DEFAULT_ORDER], section_visibility: { [r.template]: { ...DEFAULT_SECTION_VISIBILITY } } }
 : r
 ),
 }));
 });

 it("moveSection does not push history on a no-op (invalid key)", () => {
 const { moveSection } = useResumeStore.getState();
 expect(useResumeStore.getState().canUndo).toBe(false);
 // "personal" is not a reorderable section_order entry -> no-op.
 moveSection("r1", "personal" as never, "up");
 expect(useResumeStore.getState().canUndo).toBe(false);
 });

 it("moveSection does not push history at boundaries", () => {
 const { moveSection } = useResumeStore.getState();
 // summary is first -> "up" is a boundary no-op.
 moveSection("r1", "summary", "up");
 expect(useResumeStore.getState().canUndo).toBe(false);
 });

 it("moveSection pushes history and reorders on a valid move", () => {
 const { moveSection } = useResumeStore.getState();
 const before = useResumeStore.getState().resumes.find((r) => r.id === "r1")!.section_order;
 // skills (index 4) down -> swaps with languages.
 moveSection("r1", "skills", "down");
 const after = useResumeStore.getState().resumes.find((r) => r.id === "r1")!.section_order;
 expect(useResumeStore.getState().canUndo).toBe(true);
 expect(after[4]).toBe("languages");
 expect(after[5]).toBe("skills");
 expect(before).not.toEqual(after);
 });

 it("toggleVisibility flips a section's visibility for the active template", () => {
 const r1 = useResumeStore.getState().resumes.find((r) => r.id === "r1")!;
 const tpl = r1.template;
 const before = r1.section_visibility[tpl]?.skills ?? true;
 useResumeStore.getState().toggleVisibility("r1", tpl, "skills");
 const after = useResumeStore.getState().resumes.find((r) => r.id === "r1")!.section_visibility[tpl].skills;
 expect(after).toBe(!before);
 });
});
