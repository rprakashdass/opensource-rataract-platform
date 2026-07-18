import { getAuthenticatedDriveClient } from "./auth";

/**
 * Searches for a folder by name and parentId.
 */
export async function findFolder(refreshToken: string, name: string, parentId?: string): Promise<string | null> {
  const drive = getAuthenticatedDriveClient(refreshToken);
  
  let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  } else {
    query += ` and 'root' in parents`;
  }

  try {
    const res = await drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive",
    });
    
    const files = res.data.files;
    if (files && files.length > 0 && files[0].id) {
      return files[0].id;
    }
    return null;
  } catch (err: any) {
    console.error(`Failed to find Google Drive folder '${name}':`, err.message);
    return null;
  }
}

/**
 * Creates a folder in Google Drive.
 */
export async function createFolder(refreshToken: string, name: string, parentId?: string): Promise<string> {
  const drive = getAuthenticatedDriveClient(refreshToken);
  
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

    // Create public read permissions for root folder so assets can be viewed
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
  } catch (error: any) {
    console.error(`Failed to create Google Drive folder '${name}':`, error.message);
    throw error;
  }
}

/**
 * Sets up the base "Rotaract Platform" root folder.
 * Returns the folder ID.
 */
export async function setupRootFolder(refreshToken: string): Promise<string> {
  const rootName = "Rotaract Platform";
  
  let rootId = await findFolder(refreshToken, rootName);
  if (!rootId) {
    rootId = await createFolder(refreshToken, rootName);
    
    // Create base subdirectories
    await createFolder(refreshToken, "Events", rootId);
    await createFolder(refreshToken, "Gallery", rootId);
    await createFolder(refreshToken, "Projects", rootId);
    await createFolder(refreshToken, "Certificates", rootId);
  }
  
  return rootId;
}

export async function resolveDriveFolder(
  refreshToken: string,
  rootFolderId: string | null,
  context: any // MediaContext
): Promise<string | undefined> {
  if (!rootFolderId) return undefined;
  
  if (context.kind === "finance" || context.kind === "general") {
    return undefined; // Do not mirror these to drive
  }

  try {
    let parentId = rootFolderId;

    // 2. High-level category folder
    let categoryName = "";
    if (context.kind === "event") categoryName = "Events";
    else if (context.kind === "project" || context.kind === "projectUpdate") categoryName = "Projects";
    else if (context.kind === "members") categoryName = "Members Data";
    else if (context.kind === "announcements") categoryName = "Announcements";
    else if (context.kind === "website") categoryName = "Website";
    else if (context.kind === "sponsors") categoryName = "Sponsors";

    if (categoryName) {
      let catFolderId = await findFolder(refreshToken, categoryName, rootFolderId);
      if (!catFolderId) {
        catFolderId = await createFolder(refreshToken, categoryName, rootFolderId);
      }
      parentId = catFolderId;
    }

    // 3. Specific Entity folder
    let entityFolderName = "";
    if (context.kind === "event" || context.kind === "project" || context.kind === "projectUpdate") {
       entityFolderName = (context.title || "Untitled").replace(/[/\\?%*:|"<>]/g, '-');
    }

    if (entityFolderName) {
      let entityFolderId = await findFolder(refreshToken, entityFolderName, parentId);
      if (!entityFolderId) {
        entityFolderId = await createFolder(refreshToken, entityFolderName, parentId);
        await createFolder(refreshToken, "Photos", entityFolderId);
        await createFolder(refreshToken, "Posters", entityFolderId);
        await createFolder(refreshToken, "Documents", entityFolderId);
      }
      
      let photosFolderId = await findFolder(refreshToken, "Photos", entityFolderId);
      return photosFolderId || entityFolderId;
    }

    return parentId;
  } catch (error) {
    console.error("Error setting up drive folder:", error);
    return undefined;
  }
}

