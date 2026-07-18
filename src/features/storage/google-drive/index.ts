import { StorageProvider, UploadResult } from "../provider";
import { uploadFile, deleteFile } from "./upload";
import { createFolder, findFolder, setupRootFolder, resolveDriveFolder } from "./folders";

export class GoogleDriveProvider implements StorageProvider {
  private refreshToken: string;

  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

  async uploadFile(
    buffer: Buffer,
    mimeType: string,
    name: string,
    folderId?: string
  ): Promise<UploadResult> {
    if (!folderId) {
      throw new Error("folderId is required for Google Drive upload");
    }
    
    return uploadFile(this.refreshToken, buffer, mimeType, name, folderId);
  }

  async deleteFile(fileId: string): Promise<void> {
    return deleteFile(this.refreshToken, fileId);
  }

  async createFolder(name: string, parentId?: string): Promise<string> {
    return createFolder(this.refreshToken, name, parentId);
  }

  async findFolder(name: string, parentId?: string): Promise<string | null> {
    return findFolder(this.refreshToken, name, parentId);
  }
  
  async setupRootFolder(): Promise<string> {
    return setupRootFolder(this.refreshToken);
  }

  async resolveDriveFolder(rootFolderId: string | null, context: any): Promise<string | undefined> {
    return resolveDriveFolder(this.refreshToken, rootFolderId, context);
  }
}
