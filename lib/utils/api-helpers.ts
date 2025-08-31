import { NextResponse } from "next/server";
import { decodeId } from "./sqids";

/**
 * Decode ID from route params with error handling
 * @param params - The route params object
 * @param paramName - The name of the param containing the encoded ID (default: "id")
 * @returns The decoded numeric ID or null if invalid
 */
export function decodeRouteParam(
  params: Record<string, string>,
  paramName: string = "id"
): number | null {
  const encodedId = params[paramName];
  if (!encodedId) return null;

  return decodeId(encodedId);
}

/**
 * Create an API response with proper error handling
 * @param data - The data to return
 * @param status - HTTP status code
 * @returns NextResponse object
 */
export function apiResponse(data: unknown, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Create an error API response
 * @param message - Error message
 * @param status - HTTP status code
 * @param details - Optional error details
 * @returns NextResponse object
 */
export function apiError(message: string, status: number = 400, details?: unknown): NextResponse {
  const response: Record<string, unknown> = { error: message };
  if (details) {
    response.details = details;
  }
  return NextResponse.json(response, { status });
}

/**
 * Validate decoded ID and return error response if invalid
 * @param id - The decoded ID to validate
 * @param entityName - Name of the entity for error message
 * @returns The valid ID or throws NextResponse error
 */
export function requireValidId(id: number | null, entityName: string = "resource"): number {
  if (!id || id <= 0) {
    throw apiError(`Invalid ${entityName} ID`, 400);
  }
  return id;
}
