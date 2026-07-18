"use client";

import React, { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { submitPartnerInquiry } from "../actions";

interface PartnerCTAButtonProps {
  contactEmail: string;
  clubName: string;
  subject: string;
  className?: string;
  causeType?: "PROJECT" | "EVENT";
  causeId?: string;
  causeName?: string;
  children: React.ReactNode;
}

const INPUT_CLASSES =
  "w-full bg-wash border border-hairline rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand motion-input";

const LABEL_CLASSES = "block text-sm font-medium text-ink-soft mb-1.5";

export default function PartnerCTAButton({
  contactEmail,
  clubName,
  subject,
  className,
  causeType,
  causeId,
  causeName,
  children
}: PartnerCTAButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: subject.startsWith("Sponsoring:")
      ? `Hi! We are interested in pledging the support tier: "${subject.replace("Sponsoring: ", "")}". Please get in touch with us.`
      : "Hi! We are interested in partnering with your club. Please send us your campaign briefs and active pitch decks.",
    _honey: ""
  });

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      toast.success("Email copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy email.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await submitPartnerInquiry({
        ...formData,
        subject,
        contactEmail,
        clubName,
        causeType,
        causeId
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Inquiry sent successfully!");
        setSubmitted(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after close transitions
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: subject.startsWith("Sponsoring:")
          ? `Hi! We are interested in pledging the support tier: "${subject.replace("Sponsoring: ", "")}". Please get in touch with us.`
          : "Hi! We are interested in partnering with your club. Please send us your campaign briefs and active pitch decks.",
        _honey: ""
      });
    }, 200);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {children}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-paper rounded-xl p-6 md:p-8 max-w-lg w-full border border-hairline relative animate-in zoom-in-95 duration-200 text-ink my-8">
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-6 right-6 text-ink-faint hover:text-ink transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              // Success View
              <div className="text-center py-8 space-y-6">
                <div className="space-y-3 max-w-sm mx-auto">
                  <h3 className="font-display font-medium italic text-2xl text-ink text-balance">
                    Your note is on its way.
                  </h3>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {causeName 
                      ? `Thanks for your interest in supporting ${causeName}. Our relations team has been notified and we will follow up with our sponsorship deck within 24 hours.`
                      : "Thank you for reaching out. Our relations team has been notified and we will follow up with our sponsorship deck within 24 hours."
                    }
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="motion-button w-full rounded-full bg-brand text-white hover:bg-brand-deep text-[15px] font-semibold py-3.5 transition-colors"
                >
                  Back to the site
                </button>
              </div>
            ) : (
              // Form View
              <div className="space-y-6">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-brand-deep">
                    Sponsorship
                  </span>
                  <h3 className="font-display font-medium text-2xl text-ink tracking-[-0.01em] mt-2">
                    Start a partnership
                  </h3>
                  <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                    Fill in this quick form to send an inquiry directly to the club's relations
                    team.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLASSES}>Your name *</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={INPUT_CLASSES}
                        placeholder="Prakash"
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASSES}>Email address *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={INPUT_CLASSES}
                        placeholder="prakash@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLASSES}>Phone (optional)</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={INPUT_CLASSES}
                        placeholder="9876543210"
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASSES}>Company / brand (optional)</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className={INPUT_CLASSES}
                        placeholder="Nexus Corp"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASSES}>Message / details *</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={INPUT_CLASSES}
                    />
                  </div>

                  <input
                    type="text"
                    name="website_url"
                    value={formData._honey}
                    onChange={(e) => setFormData({ ...formData, _honey: e.target.value })}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <button
                    disabled={submitting}
                    type="submit"
                    className="motion-button w-full rounded-full bg-brand text-white hover:bg-brand-deep disabled:opacity-60 text-[15px] font-semibold py-3.5 transition-colors"
                  >
                    {submitting ? "Sending inquiry..." : "Submit inquiry"}
                  </button>
                </form>

                {/* Direct copy footer */}
                <div className="pt-4 border-t border-hairline flex items-center justify-between gap-3 text-xs text-ink-faint">
                  <span>Or copy our email:</span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-ink hover:text-brand-deep transition-colors font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-trail" /> : <Copy className="w-3.5 h-3.5" />}
                    {contactEmail}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
