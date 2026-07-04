"use client";

import React from "react";
import { Image as ImageIcon } from "lucide-react";

export default function GalleryAdmin() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
          <ImageIcon className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Gallery Manager</h1>
        <p className="text-gray-500 max-w-md">
          The Gallery item uploader is linked to individual Events and Projects. You can upload media photos directly within each Event or Project dashboard entry.
        </p>
      </div>
    </div>
  );
}
