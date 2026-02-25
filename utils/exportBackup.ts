/**
 * exportBackup.ts
 *
 * Exports all user progress as a single JSON backup file.
 *
 * On Capacitor (iOS / Android):
 *   1. Bundle localStorage keys into JSON string
 *   2. Filesystem.writeFile → real file:// URI in Cache dir
 *   3. Share.share({ files: [uri] }) → native share sheet
 *
 * On web (dev / browser):
 *   Falls back to <a download> trigger.
 *
 * Device preferences (bauhaus, sound) are intentionally excluded.
 */

const isCapacitor = (): boolean =>
  typeof (window as any).Capacitor !== 'undefined' &&
  (window as any).Capacitor.isNativePlatform?.();

const BACKUP_KEYS = [
  'absolutist_archive_v1',
  'absolutist_current_session_v2',
  'absolutist_level_index_v2',
  'absolutist_analogous_hint_seen',
  'absolutist_onboarding_complete',
] as const;

export async function exportBackup(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const fileName = `absolutist-backup-${today}.json`;

  // Bundle all keys that exist
  const payload: Record<string, string> = {
    version: '1',
    exportedAt: new Date().toISOString(),
  };

  BACKUP_KEYS.forEach((key) => {
    const val = localStorage.getItem(key);
    if (val !== null) payload[key] = val;
  });

  const jsonString = JSON.stringify(payload, null, 2);

  // ── Native path (Capacitor) ────────────────────────────────────────
  if (isCapacitor()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');

    const writeResult = await Filesystem.writeFile({
      path: fileName,
      data: jsonString,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    await Share.share({
      title: 'The Absolutist — Backup',
      text: `Progress backup exported on ${today}`,
      files: [writeResult.uri],
      dialogTitle: 'Save Backup',
    });

    return;
  }

  // ── Web fallback ───────────────────────────────────────────────────
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}