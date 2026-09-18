export const DEFAULT_ADMIN_PASSCODE = 'ADMIN2026';

// Check if currently authorized as admin in this browser session
export function isAdminAuthorized() {
  try {
    return sessionStorage.getItem('kirti_admin_access_authorized') === 'true';
  } catch (e) {
    return false;
  }
}

// Authorize admin session
export function setAdminAuthorized(authorized = true) {
  try {
    if (authorized) {
      sessionStorage.setItem('kirti_admin_access_authorized', 'true');
    } else {
      sessionStorage.removeItem('kirti_admin_access_authorized');
    }
  } catch (e) {}
}

// Verify entered admin passcode
export function verifyAdminPasscode(inputCode) {
  if (!inputCode) return false;
  const cleaned = inputCode.trim().toUpperCase();

  // Custom admin passcode from localStorage if set
  const customPass = localStorage.getItem('kirti_admin_passcode');
  if (customPass && cleaned === customPass.trim().toUpperCase()) {
    return true;
  }

  // Pre-configured valid passcodes (case-insensitive)
  const validCodes = [
    DEFAULT_ADMIN_PASSCODE, // ADMIN2026
    'ADMIN123',
    'ADMIN',
    'DEV',
    '123',
    'KIRTI@ADMIN'
  ];

  return validCodes.includes(cleaned);
}

// Helper to set new custom admin passcode
export function setCustomAdminPasscode(newCode) {
  if (newCode && newCode.trim()) {
    localStorage.setItem('kirti_admin_passcode', newCode.trim().toUpperCase());
  }
}

// Helper to get active passcode display
export function getActiveAdminPasscode() {
  return localStorage.getItem('kirti_admin_passcode') || DEFAULT_ADMIN_PASSCODE;
}
