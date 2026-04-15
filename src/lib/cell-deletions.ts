const STORAGE_KEY = "homecell-deleted-cell-ids";

const listeners = new Set<() => void>();

export function subscribeToCellDeletions(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function notifyCellDeletions() {
  listeners.forEach((l) => l());
}

export function recordDeletedCellId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const prev = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || "[]",
    ) as string[];
    if (!prev.includes(id)) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, id]));
      notifyCellDeletions();
    }
  } catch {}
}

export function getDeletedCellIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}
