"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { publishContent, PublishActionInput } from "../actions/publishContent";
import { PublishStatus } from "@prisma/client";
import { toast } from "sonner";

interface PublishContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "EVENT" | "PROJECT" | "ANNOUNCEMENT";
  entityId: string;
  defaultSubjectTemplate?: string;
  defaultBodyTemplate?: string;
  // pre-rendered with variables
  renderedSubject?: string; 
  renderedBody?: string;
  onSuccess?: () => void;
}

export function PublishContentModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  renderedSubject = "",
  renderedBody = "",
  onSuccess
}: PublishContentModalProps) {
  const [loading, setLoading] = useState(false);
  const [schedulePublish, setSchedulePublish] = useState(false);
  const [publishAt, setPublishAt] = useState<string>("");
  
  const [exposePublicly, setExposePublicly] = useState(true);
  const [generateAnnouncement, setGenerateAnnouncement] = useState(false);
  
  const [notifyMembers, setNotifyMembers] = useState(false);
  const [subject, setSubject] = useState(renderedSubject);
  const [body, setBody] = useState(renderedBody);
  const [recipientType, setRecipientType] = useState<"ALL" | "BOARD">("ALL");

  useEffect(() => {
    if (isOpen) {
      setSubject(renderedSubject);
      setBody(renderedBody);
    }
  }, [isOpen, renderedSubject, renderedBody]);

  async function handlePublish() {
    setLoading(true);
    
    let publishStatus: PublishStatus = schedulePublish && publishAt ? "SCHEDULED" : "PUBLISHED";
    
    const input: PublishActionInput = {
      entityType,
      entityId,
      publishStatus: exposePublicly ? publishStatus : "DRAFT",
      publishAt: schedulePublish && publishAt ? new Date(publishAt) : null,
      generateAnnouncement,
      
      notifyMembers,
      subject: notifyMembers ? subject : undefined,
      body: notifyMembers ? body : undefined,
      recipientRules: notifyMembers ? { type: recipientType } : undefined,
    };
    
    const res = await publishContent(input);
    setLoading(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(publishStatus === "SCHEDULED" ? "Content scheduled successfully" : "Content published successfully");
      if (onSuccess) onSuccess();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish {entityType.toLowerCase()}</DialogTitle>
          <DialogDescription>
            Configure how and when this content should be shared with your club.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Main Toggles */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="flex items-center space-x-2">
                <Checkbox 
                  id="expose" 
                  checked={exposePublicly} 
                  onCheckedChange={(c) => setExposePublicly(c as boolean)} 
                />
                <Label htmlFor="expose" className="font-semibold cursor-pointer">
                  Show on public website
                </Label>
             </div>
             
             {entityType !== "ANNOUNCEMENT" && (
                 <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="announcement" 
                      checked={generateAnnouncement} 
                      onCheckedChange={(c) => setGenerateAnnouncement(c as boolean)} 
                    />
                    <Label htmlFor="announcement" className="cursor-pointer">
                      Generate an announcement post for this
                    </Label>
                 </div>
             )}
          </div>

          {/* Timing */}
          {exposePublicly && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="schedule" 
                    checked={schedulePublish} 
                    onCheckedChange={(c) => setSchedulePublish(c as boolean)} 
                  />
                  <Label htmlFor="schedule" className="cursor-pointer font-semibold">
                    Schedule for later
                  </Label>
              </div>
              
              {schedulePublish && (
                 <div className="pl-6">
                    <Input 
                      type="datetime-local" 
                      value={publishAt} 
                      onChange={e => setPublishAt(e.target.value)} 
                      className="w-full sm:w-1/2"
                    />
                 </div>
              )}
            </div>
          )}

          <hr className="border-slate-100" />

          {/* Notification */}
          <div className="space-y-4">
             <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notify" 
                  checked={notifyMembers} 
                  onCheckedChange={(c) => setNotifyMembers(c as boolean)} 
                />
                <Label htmlFor="notify" className="font-semibold cursor-pointer">
                  Notify Members (Email Broadcast)
                </Label>
             </div>

             {notifyMembers && (
                <div className="space-y-4 pl-6 border-l-2 border-purple-100">
                    <div className="space-y-1.5">
                       <Label>Recipients</Label>
                       <select 
                         className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                         value={recipientType}
                         onChange={(e) => setRecipientType(e.target.value as any)}
                       >
                         <option value="ALL">All Club Members</option>
                         <option value="BOARD">Board Members Only</option>
                       </select>
                    </div>
                    
                    <div className="space-y-1.5">
                       <Label>Email Subject</Label>
                       <Input value={subject} onChange={e => setSubject(e.target.value)} />
                    </div>

                    <div className="space-y-1.5">
                       <Label>Email Body (HTML)</Label>
                       <Textarea 
                         rows={8} 
                         value={body} 
                         onChange={e => setBody(e.target.value)} 
                         className="font-mono text-sm"
                       />
                       <p className="text-xs text-slate-500">Variables have already been replaced based on your template settings.</p>
                    </div>
                </div>
             )}
          </div>
          
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePublish} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? "Processing..." : (schedulePublish ? "Schedule Publish" : "Publish Now")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
