"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import ProfileForm from "./ProfileForm";
import { AnimatedDialog } from "@/components/ui/motion/AnimatedLayouts";

interface ProfileEditDialogProps {
  member: any;
  triggerType?: "button" | "link";
}

export default function ProfileEditDialog({ member, triggerType = "button" }: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {triggerType === "link" ? (
        <button 
          onClick={() => setOpen(true)} 
          className="text-xs font-bold text-[#F7A800] hover:text-[#003DA5] flex items-center gap-1 motion-link py-1 select-none"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit details
        </button>
      ) : (
        <Button variant="outline" className="w-full motion-button" onClick={() => setOpen(true)}>
          Edit Profile
        </Button>
      )}
      <AnimatedDialog isOpen={open} onClose={() => setOpen(false)}>
        <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto bg-white">
          <h2 className="text-2xl font-bold text-[#0B132B] mb-6 border-b pb-2">Edit Profile</h2>
          <ProfileForm member={member} onSuccess={() => { setOpen(false); window.location.reload(); }} />
        </div>
      </AnimatedDialog>
    </>
  );
}
