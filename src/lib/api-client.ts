export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const xato =
      (body && typeof body === "object" && "xato" in body && (body as { xato?: string }).xato) ||
      "Noma'lum xatolik yuz berdi.";
    throw new ApiError(res.status, xato as string);
  }

  return body as T;
}
