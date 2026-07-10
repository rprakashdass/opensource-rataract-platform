import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-rose-600" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Denied</h1>
        <p className="text-slate-500 pb-4">
          You do not have the required permissions to access this module. If you believe this is a mistake, please contact your club president or a system administrator.
        </p>
        <Link href="/">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to Member Portal
          </Button>
        </Link>
      </div>
    </div>
  );
}
