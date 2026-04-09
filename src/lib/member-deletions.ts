const STORAGE_KEY = "homecell-deleted-member-ids";

const listeners = new Set<() => void>();

export function subscribeToMemberDeletions(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function notifyMemberDeletions() {
  listeners.forEach((l) => l());
}

export function recordDeletedMemberId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const prev = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || "[]",
    ) as string[];
    if (!prev.includes(id)) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, id]));
      notifyMemberDeletions();
    }
  } catch {
    /* ignore */
  }
}

export function getDeletedMemberIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}
