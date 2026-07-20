"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCommunication } from "@/features/communications/actions/communicationActions";
import { useRouter } from "next/navigation";
import { MailboxPriority, MailboxType } from "@prisma/client";

export default function NewMessageModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MailboxPriority>("MEDIUM");
  const [type, setType] = useState<MailboxType>("COMPLAINT");
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Subject and description are required.");
      return;
    }

    setIsSubmitting(true);
    const res = await createCommunication({
      subject: subject.trim(),
      description: description.trim(),
      priority,
      type,
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Message sent successfully.");
      setIsModalOpen(false);
      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
      setType("COMPLAINT");
      router.refresh();
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="bg-brand hover:bg-brand-deep text-white">
        <Plus className="w-4 h-4 mr-2" />
        New Message
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Send a Message</DialogTitle>
              <DialogDescription>
                Send a secure message directly to the club administration board.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 mt-2">
              <div className="grid gap-2">
                <Label htmlFor="type">Message Type</Label>
                <Select value={type} onValueChange={(v: MailboxType) => setType(v)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCUSE">Absence Excuse</SelectItem>
                    <SelectItem value="COMPLAINT">Complaint / Grievance</SelectItem>
                    <SelectItem value="INQUIRY">General Inquiry</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E.g., Excuse for the upcoming General Meeting"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v: MailboxPriority) => setPriority(v)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High (Urgent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Details</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide as much detail as possible..."
                  rows={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-brand hover:bg-brand-deep text-white">
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
