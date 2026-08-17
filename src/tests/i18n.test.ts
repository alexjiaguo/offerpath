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
});
