export const EDITOR_MIN_WIDTH = 280;
export const PREVIEW_MIN_WIDTH = 320;
export const HANDLE_WIDTH = 20;
export const DEFAULT_EDITOR_WIDTH = 450;
export const EDITOR_WIDTH_STORAGE_KEY = "offerpath.editorWidth";
export const PAPER_WIDTH_PX = 794;
export const PAPER_HEIGHT_PX = 1123;

export function clampEditorWidth(width: number, containerWidth: number): number {
  const max = Math.max(EDITOR_MIN_WIDTH, Math.floor(containerWidth - PREVIEW_MIN_WIDTH - HANDLE_WIDTH));
  return Math.min(max, Math.max(EDITOR_MIN_WIDTH, Math.round(width)));
}

export function computePreviewScale(
  containerWidth: number,
  containerHeight?: number,
  contentHeight: number = PAPER_HEIGHT_PX,
): number {
  const availableW = Math.max(containerWidth - 16, 1);
  const widthScale = availableW / PAPER_WIDTH_PX;
  if (containerHeight == null || containerHeight <= 0) {
    return Math.max(0.2, Math.min(widthScale, 1.5));
  }
  const paperH = Math.max(contentHeight, 1);
  const availableH = Math.max(containerHeight - 16, 1);
  const heightScale = availableH / paperH;
  return Math.max(0.2, Math.min(Math.min(widthScale, heightScale), 1.5));
}
