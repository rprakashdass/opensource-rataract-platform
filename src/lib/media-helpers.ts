import { MediaType } from "@prisma/client";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "heic", "heif"];
const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "odt", "ods", "odp", "pages", "numbers", "key"];

/**
 * Detect media type from filename extension.
 */
export function getMediaTypeFromExtension(filename: string): MediaType {
  const cleanName = filename.split("?")[0];
  const ext = cleanName.split(".").pop()?.toLowerCase();
  if (!ext) return "DOCUMENT";
  if (IMAGE_EXTENSIONS.includes(ext)) {
    return "IMAGE";
  }
  return "DOCUMENT";
}

/**
 * Detect media type from MIME type.
 */
export function getMediaTypeFromMimeType(mimeType: string): MediaType {
  if (!mimeType) return "DOCUMENT";
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO_LINK"; // Or map appropriately
  return "DOCUMENT";
}

/**
 * Check if the url represents a common video provider (YouTube, Vimeo, etc.).
 */
export function isVideoLink(url: string): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

/**
 * Returns allowed mime types / extensions for file inputs context.
 */
export const ALLOWED_MEDIA_TYPES = {
  image: "image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml",
  document: ".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt",
  video: "video/*",
  any: "image/*, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, video/*",
};
