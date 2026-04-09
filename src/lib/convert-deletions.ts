const STORAGE_KEY = "homecell-deleted-convert-ids";

const listeners = new Set<() => void>();

export function subscribeToConvertDeletions(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function notifyConvertDeletions() {
  listeners.forEach((l) => l());
}

export function recordDeletedConvertId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const prev = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || "[]",
    ) as string[];
    if (!prev.includes(id)) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, id]));
      notifyConvertDeletions();
    }
  } catch {
    /* ignore */
  }
}

export function getDeletedConvertIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}
