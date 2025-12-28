import { getSession } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type FetchOptions = RequestInit & {
    headers?: Record<string, string>;
};

/**
 * Helper function to make authenticated API calls to the backend.
 * Automatically adds the Authorization header with the access token from the session.
 */
export async function apiClient(endpoint: string, options: FetchOptions = {}) {
    const session = await getSession();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> ?? {}),
    };

    if (session?.user?.accessToken) {
        headers["Authorization"] = `Bearer ${session.user.accessToken}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    // Ensure endpoint starts with / or url join handling
    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, config);

    // You might want to handle 401 (token expired) refresh logic here in a more advanced implementation.
    // For now, if 401, the user likely needs to re-login unless we implement silent refresh.

    return response;
}
