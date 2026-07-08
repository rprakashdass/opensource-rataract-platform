"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin portal error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-rose-600" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        We encountered an error while loading this page. Please try refreshing or contact support if the issue persists.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
          <RefreshCcw className="w-4 h-4 mr-2" /> Try again
        </Button>
      </div>
    </div>
  );
}
