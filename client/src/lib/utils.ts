import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

// Combine Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(date: Date | string | number, formatString: string = "PPP") {
  return format(new Date(date), formatString);
}

// Format time for display
export function formatTime(date: Date | string | number, formatString: string = "p") {
  return format(new Date(date), formatString);
}

// Generate a random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Truncate text to a specific length
export function truncateText(text: string, maxLength: number = 100) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Convert minutes to hours and minutes format
export function minutesToHoursMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return {
    hours,
    minutes: mins,
    formatted: `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : hours === 0 ? "0m" : ""}`
  };
}

// Format duration in milliseconds to readable string
export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
}

// Determine if an element is fully in viewport
export function isElementInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Get initials from a name
export function getInitials(name: string) {
  if (!name) return "";
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Group array items by a key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, currentValue) => {
    const groupKey = String(currentValue[key]);
    (result[groupKey] = result[groupKey] || []).push(currentValue);
    return result;
  }, {} as Record<string, T[]>);
}

// Safely parse JSON with error handling
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    return fallback;
  }
}

// Convert a date object to YYYY-MM-DD string for inputs
export function dateToInputValue(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

// Check if an object is empty
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}