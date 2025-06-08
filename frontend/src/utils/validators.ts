// Validation utility functions for form fields in the wedding insurance application

/**
 * Checks if a string is empty or contains only whitespace.
 * @param value - The string to check.
 * @returns True if the string is empty, false otherwise.
 */
export const isEmpty = (value: string): boolean => {
  return value.trim() === "";
};

/**
 * Validates email format using a standard regex.
 * @param email - The email string to validate.
 * @returns True if the email is valid, false otherwise.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if two emails match (case-insensitive).
 * @param email1 - First email.
 * @param email2 - Second email.
 * @returns True if emails match, false otherwise.
 */
export const doEmailsMatch = (email1: string, email2: string): boolean => {
  return email1.toLowerCase() === email2.toLowerCase();
};

/**
 * Validates US phone number format.
 * Accepts (123) 456-7890, 123-456-7890, 1234567890, and similar.
 * @param phone - The phone number string.
 * @returns True if valid, false otherwise.
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates US ZIP code format (5 digits or ZIP+4).
 * @param zip - The ZIP code string.
 * @returns True if valid, false otherwise.
 */
export const isValidZip = (zip: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
};

/**
 * Checks if a date is today or in the future.
 * @param date - The date to check.
 * @returns True if date is today or later, false otherwise.
 */
export const isDateInFuture = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

/**
 * Checks if a date is at least 48 hours ahead from now.
 * @param date - The date to check.
 * @returns True if at least 48 hours ahead, false otherwise.
 */
export const isDateAtLeast48HoursAhead = (date: Date): boolean => {
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 48);
  return date >= minDate;
};

/**
 * Checks if a date is within two years from now.
 * @param date - The date to check.
 * @returns True if within two years, false otherwise.
 */
export const isDateWithinTwoYears = (date: Date): boolean => {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  return date <= maxDate;
};

/**
 * Formats a number as USD currency.
 * @param amount - The amount to format.
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a phone number to (XXX) XXX-XXXX if possible.
 * @param phoneNumberString - The phone number string.
 * @returns The formatted phone number or original string if invalid.
 */
export const formatPhoneNumber = (phoneNumberString: string): string => {
  const cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  if (cleaned.length < 10) return phoneNumberString;
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }
  return phoneNumberString;
};
