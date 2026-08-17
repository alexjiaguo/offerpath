import type { ResumeData, ExperienceEntry, EducationEntry, ProjectEntry, TechnicalSkillCategory, SkillItem } from "@/types";

/** Parse a dot-notation path with array indices into a list of keys. */
export function parsePath(path: string): (string | number)[] {
  const tokens = path.split(/[\.\[\]]/).filter(Boolean);
  return tokens.map((t) => (/^\d+$/.test(t) ? parseInt(t, 10) : t));
}

/** Get a value at a path inside ResumeData. */
export function getPath(data: ResumeData, path: string): unknown {
  const keys = parsePath(path);
  let current: unknown = data;
  for (const key of keys) {
    if (current == null) return undefined;
    current = (current as Record<string | number, unknown>)[key];
  }
  return current;
}

/** Immutably set a value at a path inside an object, returning a new object. */
function setDeep(obj: unknown, keys: (string | number)[], value: unknown): unknown {
  if (keys.length === 0) return value;
  const [key, ...rest] = keys;
  if (Array.isArray(obj)) {
    const idx = typeof key === "number" ? key : parseInt(String(key), 10);
    const newArr = [...obj];
    newArr[idx] = setDeep(obj[idx], rest, value);
    return newArr;
  }
  if (obj && typeof obj === "object") {
    return { ...obj, [key]: setDeep((obj as Record<string | number, unknown>)[key], rest, value) };
  }
  return obj;
}

/** Apply a field edit to ResumeData immutably. */
export function applyFieldEdit(data: ResumeData, path: string, value: string): ResumeData {
  const keys = parsePath(path);
  return setDeep(data, keys, value) as ResumeData;
}

/** Create a new empty entry for the given section. */
export function createNewEntry(section: string): unknown {
  switch (section) {
    case "experience":
      return {
        company: "",
        title: "",
        location: "",
        start_date: "",
        end_date: "",
        current: false,
        bullets: [""],
      } as ExperienceEntry;
    case "education":
      return { institution: "", degree: "", field: "", start_date: "", end_date: "" } as EducationEntry;
    case "projects":
      return { name: "", description: "", url: "", tech: [] } as ProjectEntry;
    case "skills":
      return { id: `s-${Date.now()}`, name: "", isHighlighted: false } as SkillItem;
    case "technicalSkills":
      return { id: `ts-${Date.now()}`, category: "", skills: "" } as TechnicalSkillCategory;
    case "languages":
      return "";
    case "certifications":
      return "";
    default:
      return "";
  }
}

/** Add a new entry to a section array. */
export function addEntry(data: ResumeData, section: string): ResumeData {
  const current = (data as unknown as Record<string, unknown[]>)[section];
  const arr = Array.isArray(current) ? current : [];
  return { ...data, [section]: [...arr, createNewEntry(section)] } as ResumeData;
}

/** Add a new bullet to a specific experience entry. */
export function addBullet(data: ResumeData, expIndex: number): ResumeData {
  const exps = [...(data.experience || [])];
  if (exps[expIndex]) {
    exps[expIndex] = { ...exps[expIndex], bullets: [...(exps[expIndex].bullets || []), ""] };
  }
  return { ...data, experience: exps };
}

/** Remove a bullet from a specific experience entry. */
export function removeBullet(data: ResumeData, expIndex: number, bulletIndex: number): ResumeData {
  const exps = [...(data.experience || [])];
  if (exps[expIndex]) {
    const bullets = [...(exps[expIndex].bullets || [])];
    bullets.splice(bulletIndex, 1);
    exps[expIndex] = { ...exps[expIndex], bullets };
  }
  return { ...data, experience: exps };
}

/** Remove an entry from a section array by index. */
export function removeEntry(data: ResumeData, section: string, index: number): ResumeData {
  const current = (data as unknown as Record<string, unknown[]>)[section];
  if (!Array.isArray(current)) return data;
  const newArr = [...current];
  newArr.splice(index, 1);
  return { ...data, [section]: newArr } as ResumeData;
}

/** Reorder entries in a section array. */
export function reorderEntries(data: ResumeData, section: string, fromIndex: number, toIndex: number): ResumeData {
  const current = (data as unknown as Record<string, unknown[]>)[section];
  if (!Array.isArray(current)) return data;
  if (fromIndex < 0 || fromIndex >= current.length || toIndex < 0 || toIndex >= current.length) return data;
  const newArr = [...current];
  const [moved] = newArr.splice(fromIndex, 1);
  newArr.splice(toIndex, 0, moved);
  return { ...data, [section]: newArr } as ResumeData;
}
