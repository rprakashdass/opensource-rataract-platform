"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitInquiry } from "@/features/public/actions/submitInquiry";
import { QuietLink } from "@/components/ui/public/v2";

const INPUT_CLASSES =
  "w-full bg-paper border border-hairline rounded-xl px-4 py-3 text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand motion-input";

const LABEL_CLASSES = "block text-sm font-medium text-ink-soft mb-1.5";

export default function JoinUsForm({
  clubId,
  successTitle = "Your first footprint is down. We'll be in touch.",
  successDesc = "We have received your details. A member of our board will reach out to you shortly.",
}: {
  clubId: string;
  successTitle?: string;
  successDesc?: string;
}) {
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
      <div className="py-8 text-center">
        <p className="font-display font-medium italic text-2xl md:text-3xl text-ink text-balance">
          {successTitle}
        </p>
        <p className="mt-4 text-ink-soft leading-relaxed">{successDesc}</p>
        <div className="mt-8">
          <QuietLink href="/events">See what's coming up</QuietLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLASSES}>Full name *</label>
          <input name="name" required placeholder="John Doe" className={INPUT_CLASSES} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASSES}>Email address *</label>
            <input
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label className={LABEL_CLASSES}>Phone number (optional)</label>
            <input name="phone" placeholder="+91 98765 43210" className={INPUT_CLASSES} />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASSES}>Why do you want to join? (optional)</label>
          <textarea
            name="interestMessage"
            placeholder="Tell us a little bit about yourself and why you're interested in joining..."
            rows={4}
            className={INPUT_CLASSES}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="motion-button w-full rounded-full bg-brand text-white hover:bg-brand-deep disabled:opacity-60 text-[15px] font-semibold py-3.5 transition-colors"
      >
        {loading ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
