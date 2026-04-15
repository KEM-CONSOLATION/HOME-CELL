export type PaginatedList<T> = {
  items: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

export function normalizePaginatedList<T>(payload: unknown): PaginatedList<T> {
  if (Array.isArray(payload)) {
    return {
      items: payload as T[],
      count: payload.length,
      next: null,
      previous: null,
    };
  }

  if (payload && typeof payload === "object") {
    const obj = payload as {
      count?: unknown;
      next?: unknown;
      previous?: unknown;
      results?: unknown;
      data?: unknown;
      items?: unknown;
    };

    const rows = Array.isArray(obj.results)
      ? (obj.results as T[])
      : Array.isArray(obj.data)
        ? (obj.data as T[])
        : Array.isArray(obj.items)
          ? (obj.items as T[])
          : [];

    return {
      items: rows,
      count: typeof obj.count === "number" ? obj.count : rows.length,
      next: typeof obj.next === "string" ? obj.next : null,
      previous: typeof obj.previous === "string" ? obj.previous : null,
    };
  }

  return {
    items: [],
    count: 0,
    next: null,
    previous: null,
  };
}
