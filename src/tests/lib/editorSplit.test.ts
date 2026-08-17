import { describe, it, expect } from "vitest";
import { clampEditorWidth, computePreviewScale, EDITOR_MIN_WIDTH } from "@/lib/editorSplit";

describe("clampEditorWidth", () => {
  it("clamps against the split container, not the window", () => {
    // 1136px content column (1440 window minus 240 sidebar minus padding)
    expect(clampEditorWidth(936, 1136)).toBe(1136 - 320 - 20);
  });

  it("does not go below the editor minimum", () => {
    expect(clampEditorWidth(100, 900)).toBe(EDITOR_MIN_WIDTH);
  });

  it("leaves room for the preview when the container shrinks", () => {
    expect(clampEditorWidth(800, 700)).toBe(700 - 320 - 20);
  });
});

describe("computePreviewScale", () => {
  it("scales to container width without a 240px floor", () => {
    expect(computePreviewScale(180)).toBeCloseTo((180 - 16) / 794);
  });

  it("caps scale at 1.5", () => {
    expect(computePreviewScale(2000)).toBe(1.5);
  });

  it("floors scale at 0.2", () => {
    expect(computePreviewScale(20)).toBe(0.2);
  });

  it("contains to height when the pane is shorter than the paper", () => {
    expect(computePreviewScale(2000, 400, 1123)).toBeCloseTo((400 - 16) / 1123);
  });

  it("uses the tighter of width and height fit", () => {
    const widthLimited = computePreviewScale(400, 2000, 1123);
    expect(widthLimited).toBeCloseTo((400 - 16) / 794);
    const heightLimited = computePreviewScale(2000, 300, 1123);
    expect(heightLimited).toBeCloseTo((300 - 16) / 1123);
  });

  it("falls back to width-only when height is missing or zero", () => {
    const widthOnly = (400 - 16) / 794;
    expect(computePreviewScale(400)).toBeCloseTo(widthOnly);
    expect(computePreviewScale(400, 0, 1123)).toBeCloseTo(widthOnly);
  });
});
