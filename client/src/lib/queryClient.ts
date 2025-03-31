import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 30 * 1000, // 30 seconds
      queryFn: getQueryFn(),
    },
  },
});

// Options for handling unauthorized access
type GetQueryFnOptions = {
  on401?: "throw" | "returnNull";
};

// Default fetch function for React Query
export function getQueryFn({ on401 = "throw" }: GetQueryFnOptions = {}) {
  return async function queryFn({ queryKey }: { queryKey: unknown }) {
    if (!Array.isArray(queryKey) || typeof queryKey[0] !== "string") {
      throw new Error(
        "Invalid queryKey. Expected first element to be a string URL."
      );
    }

    const url = queryKey[0];
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });

    // Handle unauthorized access
    if (response.status === 401) {
      if (on401 === "returnNull") return null;
      throw new Error("Unauthorized");
    }

    // Handle other errors
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  };
}

// Function for making API requests
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }

  return response;
}