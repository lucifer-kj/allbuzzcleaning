import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ApiErrorBody = { success: false; error: string; details?: unknown };
export type ApiSuccessBody<T> = { success: true } & T;

export function apiError(error: string, details?: unknown): ApiErrorBody {
  return { success: false, error, details };
}