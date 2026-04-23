// Utility functions for JWT token handling

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Extracts firstName from JWT token stored in localStorage
 * @returns firstName with "Dr" prefix, or fallback to "Doctor"
 */
export const getDoctorName = (): string => {
  const token = localStorage.getItem("smart_admin_token");
  if (!token) return "Dr. Doctor";

  const decoded = decodeTokenPayload(token);
  const firstName = typeof decoded?.firstName === "string" ? decoded.firstName : "";
  return firstName ? `Dr. ${firstName}` : "Dr. Doctor";
};

/**
 * Extracts just the firstName from JWT token (without "Dr" prefix)
 * @returns firstName only, or fallback to "Doctor"
 */
export const getFirstName = (): string => {
  const token = localStorage.getItem("smart_admin_token");
  if (!token) return "Doctor";

  const decoded = decodeTokenPayload(token);
  return typeof decoded?.firstName === "string" ? decoded.firstName : "Doctor";
};
