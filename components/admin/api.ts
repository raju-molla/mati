"use client";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload: Record<string, unknown> = {}
  ) {
    super(message);
  }
}

/** JSON fetch for admin endpoints. Redirects to login when the session has expired. */
export async function api<T = unknown>(
  url: string,
  opts: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });
  let json: Record<string, unknown> = {};
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }
  if (res.status === 401) {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new ApiError("Session expired", 401);
  }
  if (!res.ok || json.ok === false) {
    throw new ApiError(String(json.error ?? `Request failed (${res.status})`), res.status, json);
  }
  return json.data as T;
}
