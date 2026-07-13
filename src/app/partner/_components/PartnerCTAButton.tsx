"use client";

import React, { useState } from "react";
import { Copy, Check, X, Send, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { submitPartnerInquiry } from "../actions";

interface PartnerCTAButtonProps {
  contactEmail: string;
  clubName: string;
  subject: string;
  className?: string;
  children: React.ReactNode;
}

export default function PartnerCTAButton({
  contactEmail,
  clubName,
  subject,
  className,
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
      : "Hi! We are interested in partnering with your club. Please send us your campaign briefs and active pitch decks."
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
        clubName
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
          : "Hi! We are interested in partnering with your club. Please send us your campaign briefs and active pitch decks."
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
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 text-slate-900 my-8">
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              // Success View
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                  <HeartHandshake className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#0B132B]">Inquiry Received!</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                    Thank you for reaching out! Our relations team has been notified and we will follow up with our sponsorship deck within 24 hours.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full bg-[#0B132B] hover:bg-[#1a2645] text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-colors shadow-lg"
                >
                  Back to website
                </button>
              </div>
            ) : (
              // Form View
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#F7A800]">Sponsorship & Partner Form</span>
                  <h3 className="text-2xl font-black text-[#0B132B] mt-1">Start a Partnership</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                    Fill in this quick form to send an inquiry directly to the club's relations deck.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Name *</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7A800]/50"
                        placeholder="Prakash"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7A800]/50"
                        placeholder="prakash@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone (Optional)</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7A800]/50"
                        placeholder="9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Company / Brand (Optional)</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7A800]/50"
                        placeholder="Nexus Corp"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Message / Details *</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7A800]/50"
                    />
                  </div>

                  <button
                    disabled={submitting}
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#0B132B] hover:bg-[#1a2645] disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all shadow-md shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? "Sending Inquiry..." : "Submit Inquiry"}
                  </button>
                </form>

                {/* Direct copy footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Or copy official email:</span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-[#0B132B] hover:text-[#F7A800] transition-colors font-bold uppercase tracking-wider"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
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
