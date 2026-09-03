import { describe, it, expect } from "vitest";
import { en } from "@/i18n/locales/en";
import { zh } from "@/i18n/locales/zh";

type DictNode = Record<string, unknown>;

describe("i18n Locales and Types", () => {
  it("en and zh should have matching top-level keys", () => {
    const enKeys = Object.keys(en).sort();
    const zhKeys = Object.keys(zh).sort();
    expect(enKeys).toEqual(zhKeys);
  });

  it("all nested keys across en and zh dictionaries should match", () => {
    function checkKeys(obj1: DictNode, obj2: DictNode, path = "") {
      const keys1 = Object.keys(obj1).sort();
      const keys2 = Object.keys(obj2).sort();
      expect(keys1, `Mismatch at path: ${path}`).toEqual(keys2);

      for (const k of keys1) {
        const val1 = obj1[k];
        const val2 = obj2[k];
        if (typeof val1 === "object" && val1 !== null && !Array.isArray(val1)) {
          expect(typeof val2, `Expected object at path: ${path}.${k}`).toBe("object");
          checkKeys(val1 as DictNode, val2 as DictNode, path ? `${path}.${k}` : k);
        }
      }
    }

    checkKeys(en as unknown as DictNode, zh as unknown as DictNode);
  });

  it("Chinese dictionary should not have empty string values", () => {
    function checkNonEmpty(obj: DictNode, path = "") {
      for (const [k, v] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${k}` : k;
        if (typeof v === "string") {
          expect(v.trim().length, `Empty translation at ${currentPath}`).toBeGreaterThan(0);
        } else if (Array.isArray(v)) {
          expect(v.length, `Empty array at ${currentPath}`).toBeGreaterThan(0);
        } else if (typeof v === "object" && v !== null) {
          checkNonEmpty(v as DictNode, currentPath);
        }
      }
    }

    checkNonEmpty(zh as unknown as DictNode);
  });

  it("Chinese translations should differ from English (no copy-paste untranslated entries)", () => {
    // Proper nouns, numbers, and template IDs are legitimately identical —
    // allow short values and values without CJK/Latin-distinctive content.
    // A few entries are intentionally identical in both locales (URL/email
    // examples, intentionally bilingual labels).
    const ALLOWLIST = new Set([
      "landing.pasteDemoPlaceholderUrl",
      "auth.emailPlaceholder",
      "topbar.languageToggle",
    ]);
    const identical: string[] = [];
    function collect(enObj: DictNode, zhObj: DictNode, path = "") {
      for (const k of Object.keys(enObj)) {
        const currentPath = path ? `${path}.${k}` : k;
        const v1 = enObj[k];
        const v2 = (zhObj as DictNode)[k];
        if (typeof v1 === "string" && typeof v2 === "string") {
          if (v1 === v2 && v1.length > 12 && /[a-zA-Z\u4e00-\u9fff]/.test(v1) && !ALLOWLIST.has(currentPath)) {
            identical.push(currentPath);
          }
        } else if (typeof v1 === "object" && v1 !== null && typeof v2 === "object" && v2 !== null) {
          collect(v1 as DictNode, v2 as DictNode, currentPath);
        }
      }
    }
    collect(en as unknown as DictNode, zh as unknown as DictNode);
    expect(identical, `Untranslated (identical) entries: ${identical.join(", ")}`).toEqual([]);
  });
});
