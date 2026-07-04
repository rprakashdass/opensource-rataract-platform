"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh(); // Force refresh to clear server component state
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      disabled={loading}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
