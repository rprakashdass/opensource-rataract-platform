"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitInquiry } from "@/features/public/actions/submitInquiry";
import { CheckCircle2, Heart } from "lucide-react";

export default function JoinUsForm({ clubId }: { clubId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setLoading(true);
    const res = await submitInquiry({
      clubId,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      interestMessage: formData.get("interestMessage") as string,
    });
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      setSuccess(true);
      toast.success("Inquiry submitted successfully!");
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Thank you for your interest!</h2>
        <p className="text-slate-500 text-lg">
          We have received your details. A member of our board will reach out to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
          <Input name="name" required placeholder="John Doe" className="h-12 bg-slate-50" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
            <Input name="email" type="email" required placeholder="john@example.com" className="h-12 bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
            <Input name="phone" placeholder="+91 98765 43210" className="h-12 bg-slate-50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Why do you want to join? (Optional)</label>
          <Textarea 
            name="interestMessage" 
            placeholder="Tell us a little bit about yourself and why you're interested in joining..." 
            rows={4} 
            className="bg-slate-50"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full rounded-xl h-14 text-lg font-bold">
        {loading ? "Submitting..." : <><Heart className="w-5 h-5 mr-2" /> Submit Application</>}
      </Button>
    </form>
  );
}
