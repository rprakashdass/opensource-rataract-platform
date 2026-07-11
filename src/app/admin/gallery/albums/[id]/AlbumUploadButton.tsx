"use client";

import { GalleryUpload } from "../../GalleryUpload";

interface AlbumUploadButtonProps {
  albumId: string;
  albumTitle: string;
}

/**
 * Thin wrapper that opens GalleryUpload pre-locked to the current album.
 */
export function AlbumUploadButton({ albumId, albumTitle }: AlbumUploadButtonProps) {
  return (
    <GalleryUpload
      albums={[{ id: albumId, title: albumTitle }]}
      defaultAlbumId={albumId}
    />
  );
}
