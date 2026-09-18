export const DEFAULT_FACULTY_PASSCODE = 'KIRTI2026';

// Check if currently authorized in this browser session
export function isFacultyAuthorized() {
  try {
    return sessionStorage.getItem('kirti_faculty_access_authorized') === 'true';
  } catch (e) {
    return false;
  }
}

// Authorize faculty session
export function setFacultyAuthorized(authorized = true) {
  try {
    if (authorized) {
      sessionStorage.setItem('kirti_faculty_access_authorized', 'true');
    } else {
      sessionStorage.removeItem('kirti_faculty_access_authorized');
    }
  } catch (e) {}
}

// Verify entered passcode
export function verifyFacultyPasscode(inputCode) {
  if (!inputCode) return false;
  const cleaned = inputCode.trim().toUpperCase();
  
  // Custom admin-configured passcode from localStorage
  const customPass = localStorage.getItem('kirti_faculty_passcode');
  if (customPass && cleaned === customPass.trim().toUpperCase()) {
    return true;
  }

  // Pre-configured valid passcodes (case-insensitive)
  const validCodes = [
    DEFAULT_FACULTY_PASSCODE, // KIRTI2026
    'FACULTY2026',
    'FACULTY',
    'KIRTI@FACULTY',
    '1234'
  ];

  return validCodes.includes(cleaned);
}

// Helper to set new custom passcode by admin
export function setCustomFacultyPasscode(newCode) {
  if (newCode && newCode.trim()) {
    localStorage.setItem('kirti_faculty_passcode', newCode.trim().toUpperCase());
  }
}

// Helper to get active passcode
export function getActiveFacultyPasscode() {
  return localStorage.getItem('kirti_faculty_passcode') || DEFAULT_FACULTY_PASSCODE;
}
