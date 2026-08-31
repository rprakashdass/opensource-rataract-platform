import { NextResponse } from "next/server";

/**
 * Standardized handler to log internal API errors on the server and return a normalized,
 * secure, user-friendly error message to the client.
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again later."
) {
  if (error instanceof Error) {
    console.error("API Error occurred:", error.message, error.stack);
  } else {
    console.error("API Error occurred:", error);
  }

  const isDev = process.env.NODE_ENV === "development";
  const responsePayload: { error: string; devDetails?: any } = { error: fallbackMessage };

  if (isDev && error) {
    responsePayload.devDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
  }

  // Normalize all unexpected internal errors to status 500 and hide technical details.
  return NextResponse.json(
    responsePayload,
    { status: 500 }
  );
}
