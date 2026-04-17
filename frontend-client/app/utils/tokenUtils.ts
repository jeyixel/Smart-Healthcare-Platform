// Utility functions for JWT token handling

/**
 * Extracts firstName from JWT token stored in localStorage
 * @returns firstName with "Dr" prefix, or fallback to "Doctor"
 */
export const getDoctorName = (): string => {
  try {
    const token = localStorage.getItem('smart_admin_token');
    if (!token) return "Dr. Doctor";
    
    // Parse JWT token (base64 decoded payload)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    const firstName = decoded.firstName;
    return firstName ? `Dr. ${firstName}` : "Dr. Doctor";
  } catch (error) {
    console.error("Error parsing token:", error);
    return "Dr. Doctor";
  }
};

/**
 * Extracts just the firstName from JWT token (without "Dr" prefix)
 * @returns firstName only, or fallback to "Doctor"
 */
export const getFirstName = (): string => {
  try {
    const token = localStorage.getItem('smart_admin_token');
    if (!token) return "Doctor";
    
    // Parse JWT token (base64 decoded payload)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    return decoded.firstName || "Doctor";
  } catch (error) {
    console.error("Error parsing token:", error);
    return "Doctor";
  }
};
