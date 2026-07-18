import { Readable } from "stream";
import { getAuthenticatedDriveClient } from "./auth";

/**
 * Uploads a file buffer to Google Drive.
 */
export async function uploadFile(
  refreshToken: string,
  buffer: Buffer,
  mimeType: string,
  name: string,
  parentId: string
): Promise<{ id: string; url: string }> {
  const drive = getAuthenticatedDriveClient(refreshToken);

  const fileMetadata: any = {
    name,
    parents: [parentId],
  };

  const media = {
    mimeType,
    body: Readable.from(buffer),
  };

  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    if (!file.data.id || !file.data.webViewLink) {
      throw new Error("File ID or View Link was not returned from Drive API.");
    }

    return {
      id: file.data.id,
      url: file.data.webViewLink,
    };
  } catch (error: any) {
    console.error(`Failed to upload file '${name}' to Drive:`, error.message);
    throw error;
  }
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteFile(refreshToken: string, fileId: string): Promise<void> {
  const drive = getAuthenticatedDriveClient(refreshToken);
  
  try {
    await drive.files.delete({
      fileId,
    });
  } catch (error: any) {
    console.error(`Failed to delete file ${fileId} from Drive:`, error.message);
    // Don't throw to prevent blocking main deletion flows if file already gone
  }
}
