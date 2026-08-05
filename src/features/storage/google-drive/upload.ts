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
 * Grants "anyone with the link" read access to a Drive file. Needed for files
 * whose link is shared outside the club's Drive (e.g. receipts emailed to a
 * payer) — otherwise the webViewLink resolves to a Google login / no-access page.
 */
export async function makeFilePublic(refreshToken: string, fileId: string): Promise<void> {
  const drive = getAuthenticatedDriveClient(refreshToken);
  try {
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });
  } catch (error: any) {
    console.error(`Failed to make Drive file ${fileId} public:`, error.message);
    // Non-fatal — the link just may not be publicly accessible.
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
