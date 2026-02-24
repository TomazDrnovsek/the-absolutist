/**
 * exportArtifact.ts
 *
 * Shared export utility for The Absolutist.
 *
 * On Capacitor (iOS / Android):
 *   1. toPng → base64 dataUrl
 *   2. Filesystem.writeFile → real file:// URI in Cache dir
 *   3. Share.share({ files: [uri] }) → native share sheet
 *
 * On web (dev / browser):
 *   Falls back to URL.createObjectURL + <a download> trigger.
 *
 * WHY NOT navigator.share with File objects:
 *   navigator.canShare({ files }) returns false in Capacitor WebView for
 *   in-memory blob-backed File objects. The WebView has no access to a
 *   file:// URI for the blob, so the OS share intent never fires.
 *   The @capacitor/share plugin bypasses this by invoking the native
 *   Android/iOS share API directly with a real cache-directory URI.
 */

import { toPng } from 'html-to-image';

// Detect Capacitor runtime — avoids importing native plugins in browser/dev
const isCapacitor = (): boolean =>
  typeof (window as any).Capacitor !== 'undefined' &&
  (window as any).Capacitor.isNativePlatform?.();

export interface ExportOptions {
  element: HTMLElement;
  sessionId: number;
  resonance: number;
  pixelRatio?: number;
}

export async function exportArtifact({
  element,
  sessionId,
  resonance,
  pixelRatio = 2,
}: ExportOptions): Promise<void> {
  const fileName = `absolutist-session-${sessionId.toString().padStart(2, '0')}.png`;

  // ── 1. Render to PNG ────────────────────────────────────────────────
  // First call primes the canvas context in Android WebView (known blank-frame bug).
  try {
    await toPng(element, { pixelRatio, skipFonts: true });
  } catch (_) {
    // ignore warm-up failure
  }
  const dataUrl = await toPng(element, { pixelRatio, skipFonts: true });

  // Strip prefix to get raw base64 data for Filesystem plugin
  const base64Data = dataUrl.split(',')[1];

  // ── 2. Native path (Capacitor) ─────────────────────────────────────
  if (isCapacitor()) {
    // Dynamic imports — these modules only exist at runtime in the native bundle.
    // Using dynamic import prevents crashes during web/dev builds.
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');

    // Write PNG to cache directory — returns a file:// URI the OS can read
    const writeResult = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    const fileUri = writeResult.uri;

    await Share.share({
      title: 'The Absolutist',
      text: `Session ${sessionId.toString().padStart(2, '0')} · ${resonance}% Resonance`,
      files: [fileUri],
      dialogTitle: 'Export Artifact',
    });

    return;
  }

  // ── 3. Web fallback (browser / dev server) ─────────────────────────
  // Convert base64 to Blob without fetch() — fetch(data:) is unreliable.
  const binary = atob(base64Data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  const blob = new Blob([arr], { type: 'image/png' });

  // Try Web Share API with files (works in Chrome desktop and some mobile browsers)
  const file = new File([blob], fileName, { type: 'image/png' });
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: 'The Absolutist',
      text: `Session ${sessionId.toString().padStart(2, '0')} · ${resonance}% Resonance`,
      files: [file],
    });
    return;
  }

  // Last resort: <a download> trigger
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
