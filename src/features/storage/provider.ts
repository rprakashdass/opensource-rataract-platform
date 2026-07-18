export interface UploadResult {
  id: string;
  url: string;
}

export interface StorageProvider {
  /**
   * Uploads a file buffer to the storage provider.
   * @param buffer The file content
   * @param mimeType The file MIME type
   * @param name The file name
   * @param folderId Optional destination folder ID
   */
  uploadFile(
    buffer: Buffer,
    mimeType: string,
    name: string,
    folderId?: string
  ): Promise<UploadResult>;

  /**
   * Deletes a file from the storage provider.
   * @param fileId The ID of the file to delete
   */
  deleteFile(fileId: string): Promise<void>;

  /**
   * Optional method to create a folder if the provider supports hierarchical structures.
   * @param name The name of the folder
   * @param parentId Optional parent folder ID
   */
  createFolder?(name: string, parentId?: string): Promise<string>;

  /**
   * Optional method to find a folder by name.
   */
  findFolder?(name: string, parentId?: string): Promise<string | null>;
}
