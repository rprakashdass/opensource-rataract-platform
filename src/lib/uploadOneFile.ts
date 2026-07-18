import { uploadMedia } from "@/features/media/actions/uploadMedia";
import { MediaType, MediaUsage } from "@prisma/client";
import { getMediaTypeFromExtension } from "@/lib/media-helpers";
import { MediaContext } from "@/features/media/lib/resolveAlbum";
import imageCompression from "browser-image-compression";

/**
 * Compresses (images only) and uploads a single file through the shared
 * uploadMedia action. Used by both the single-slot FileUpload component and
 * any bulk/multi uploader so the compression + FormData logic lives once.
 */
export async function uploadOneFile(
  file: File,
  context: MediaContext,
  opts: { type?: MediaType; usage?: MediaUsage; title?: string; isCover?: boolean } = {}
) {
  const detectedType = opts.type || getMediaTypeFromExtension(file.name);
  let finalFile = file;

  if (detectedType === "IMAGE") {
    try {
      finalFile = await imageCompression(file, { maxSizeMB: 10, maxWidthOrHeight: 2000, useWebWorker: true, fileType: "image/webp" });
      finalFile = new File([finalFile], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
    } catch {
      /* use original */
    }
  }

  const title = opts.title ?? (file.name.replace(/\.[^.]+$/, "") || file.name);

  let finalUsage = opts.usage || "GALLERY";
  if (!opts.usage) {
    if (context.kind === "website") finalUsage = "WEBSITE";
    if (context.kind === "members") finalUsage = "GALLERY";
  }

  const formData = new FormData();
  formData.append("file", finalFile);
  formData.append("title", title.trim());
  formData.append("type", detectedType);
  formData.append("usage", finalUsage);
  formData.append("isCover", (opts.isCover ?? false).toString());
  formData.append("mediaContext", JSON.stringify(context));

  return uploadMedia(formData);
}
