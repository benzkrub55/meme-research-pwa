const PREFIX = "meme-research-notes:";

export function notesKey(address: string): string {
  return `${PREFIX}${address.toLowerCase()}`;
}

export function loadNote(address: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(notesKey(address)) ?? "";
  } catch {
    return "";
  }
}

export function saveNote(address: string, note: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = notesKey(address);
    if (!note.trim()) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, note);
    }
  } catch {
    // ignore quota / private mode
  }
}
