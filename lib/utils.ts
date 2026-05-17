import { customAlphabet } from "nanoid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import UAParser from "ua-parser-js";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(): string {
  return nanoid();
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getFileIcon(extension: string): string {
  const ext = extension.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
  if (["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"].includes(ext)) return "video";
  if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(ext)) return "audio";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";
  if (["ppt", "pptx"].includes(ext)) return "powerpoint";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (["js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "go", "rs"].includes(ext)) return "code";
  return "file";
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "bin";
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

export function parseUserAgent(ua: string) {
  const parser = new UAParser(ua);
  const result = parser.getResult();
  return {
    browser: result.browser.name ?? "Unknown",
    os: result.os.name ?? "Unknown",
    device: result.device.type ?? "desktop",
  };
}

export function randomCountdown(min = 10, max = 30): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMissionToken(resourceId: string, ip: string): string {
  const data = `${resourceId}:${ip}:${Date.now()}`;
  return Buffer.from(data).toString("base64url");
}

export function validateMissionToken(token: string, resourceId: string, maxAgeMs = 30 * 60 * 1000): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [id, , timestamp] = decoded.split(":");
    if (id !== resourceId) return false;
    const age = Date.now() - parseInt(timestamp);
    return age <= maxAgeMs;
  } catch {
    return false;
  }
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export const ALLOWED_FILE_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "video/mp4", "video/webm", "video/quicktime",
  "audio/mpeg", "audio/wav", "audio/ogg",
  "application/pdf",
  "application/zip", "application/x-rar-compressed", "application/x-7z-compressed",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/csv",
  "application/octet-stream",
];

export const MAX_FILE_SIZE_FREE = 100 * 1024 * 1024;
export const MAX_FILE_SIZE_PREMIUM = 2 * 1024 * 1024 * 1024;
