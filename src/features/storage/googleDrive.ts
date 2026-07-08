import { google } from "googleapis";
import { Readable } from "stream";

// Helper to get authenticated Drive client
function getDriveClient() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentialsJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set.");
  }

  try {
    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    return google.drive({ version: "v3", auth });
  } catch (error) {
    console.error("Failed to parse Google Service Account credentials:", error);
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON.");
  }
}

/**
 * Creates a folder in Google Drive.
 * @param name The name of the folder
 * @param parentId Optional ID of the parent folder
 * @returns The created folder's ID
 */
export async function createFolder(name: string, parentId?: string): Promise<string> {
  const drive = getDriveClient();
  
  const fileMetadata: any = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  
  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  try {
    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id",
    });

    if (!folder.data.id) throw new Error("Folder ID was not returned.");

    // If it's a root/primary folder (or any folder we want public),
    // set permissions so anyone with the link can view.
    if (!parentId) {
      await drive.permissions.create({
        fileId: folder.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
    }

    return folder.data.id;
  } catch (error) {
    console.error(`Failed to create Google Drive folder '${name}':`, error);
    throw error;
  }
}

/**
 * Searches for a folder by name and parentId.
 */
async function findFolder(name: string, parentId?: string): Promise<string | null> {
  const drive = getDriveClient();
  let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  } else {
    query += ` and 'root' in parents`;
  }

  try {
    const res = await drive.files.list({
      q: query,
      spaces: "drive",
      fields: "files(id, name)",
    });
    const files = res.data.files;
    if (files && files.length > 0 && files[0].id) {
      return files[0].id;
    }
    return null;
  } catch (err) {
    console.error(`Failed to find folder ${name}:`, err);
    return null;
  }
}

/**
 * Sets up the full Drive structure for an Event.
 * Returns the event folder ID.
 */
export async function setupEventDriveFolder(clubName: string, eventName: string, dateStr: string): Promise<string | undefined> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.log("Skipping Drive folder creation: GOOGLE_SERVICE_ACCOUNT_JSON not configured.");
    return undefined;
  }

  try {
    // 1. Root: [Club Name] Drive
    const rootName = `${clubName} Drive`;
    let rootId = await findFolder(rootName);
    if (!rootId) {
      rootId = await createFolder(rootName);
    }

    // 2. Events folder
    let eventsId = await findFolder("Events", rootId);
    if (!eventsId) {
      eventsId = await createFolder("Events", rootId);
    }

    // 3. Event specific folder
    const eventFolderName = `${eventName} - ${dateStr}`;
    const eventFolderId = await createFolder(eventFolderName, eventsId);

    // 4. Subfolders
    await createFolder("Photos", eventFolderId);
    await createFolder("Posters", eventFolderId);
    await createFolder("Documents", eventFolderId);

    return eventFolderId;
  } catch (error) {
    console.error("Error setting up event drive folder:", error);
    return undefined;
  }
}

/**
 * Uploads a file buffer directly to Google Drive.
 * @param buffer The file buffer
 * @param mimeType The file's mime type (e.g., 'image/jpeg')
 * @param name The file name
 * @param parentId The destination folder ID
 * @returns The driveFileId and public webViewLink
 */
export async function uploadFile(
  buffer: Buffer,
  mimeType: string,
  name: string,
  parentId: string
): Promise<{ driveFileId: string; driveUrl: string }> {
  const drive = getDriveClient();

  const fileMetadata = {
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
      driveFileId: file.data.id,
      driveUrl: file.data.webViewLink,
    };
  } catch (error) {
    console.error(`Failed to upload file '${name}' to Drive:`, error);
    throw error;
  }
}

/**
 * Deletes a file from Google Drive.
 * @param driveFileId The ID of the file to delete
 */
export async function deleteFile(driveFileId: string): Promise<void> {
  const drive = getDriveClient();
  try {
    await drive.files.delete({ fileId: driveFileId });
  } catch (error) {
    console.error(`Failed to delete file ${driveFileId} from Drive:`, error);
    throw error;
  }
}

/**
 * Gets a standard public Google Drive folder link.
 */
export function getFolderLink(driveFolderId: string): string {
  return `https://drive.google.com/drive/folders/${driveFolderId}`;
}
