/**
 * importBackup.ts
 *
 * Reads a .json backup file, validates it, writes progress keys
 * back to localStorage, and reloads the app.
 *
 * Device preferences (bauhaus, sound) are intentionally left untouched.
 */

const RESTORABLE_KEYS = [
  'absolutist_archive_v1',
  'absolutist_current_session_v2',
  'absolutist_level_index_v2',
  'absolutist_analogous_hint_seen',
  'absolutist_onboarding_complete',
] as const;

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();

  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid backup file: could not parse JSON.');
  }

  if (!parsed.version) {
    throw new Error('Invalid backup file: missing version field.');
  }

  // Restore only known keys
  let restored = 0;
  RESTORABLE_KEYS.forEach((key) => {
    if (parsed[key] !== undefined) {
      localStorage.setItem(key, parsed[key]);
      restored++;
    }
  });

  if (restored === 0) {
    throw new Error('Backup file contains no recognisable data.');
  }

  // Reload app to reinitialise from restored state
  window.location.reload();
}