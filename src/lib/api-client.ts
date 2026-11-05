interface ApiEnvelope<T> {
  success: true;
  data: T;
  timestamp: string;
}

interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError,
  ) {
    super(Array.isArray(body.message) ? body.message.join('; ') : body.message);
    this.name = 'ApiRequestError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const prefixed = path.startsWith('/api/') || path.startsWith('http') ? path : `/api${path}`;
  const url =
    typeof window === 'undefined'
      ? new URL(prefixed, process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000')
      : new URL(prefixed, window.location.origin);

  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as ApiEnvelope<T> | ApiError) : undefined;

  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      (json as ApiError) ?? {
        statusCode: response.status,
        error: 'UnknownError',
        message: response.statusText,
        path,
        timestamp: new Date().toISOString(),
      },
    );
  }

  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}
