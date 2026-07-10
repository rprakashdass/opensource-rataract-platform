import React from 'react';

export default function TermsOfUsePage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-slate max-w-none">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Terms of Use</h1>
          <p className="text-sm text-slate-500 font-medium mb-8">Last Updated: {currentDate}</p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Purpose</h3>
          <p className="text-slate-600 mb-6">
            This platform exists to support Rotaract club operations.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Member Responsibilities</h3>
          <p className="text-slate-600 mb-4">Members agree to:</p>
          <ul className="list-disc pl-5 text-slate-600 mb-6 space-y-1">
            <li>Provide accurate information</li>
            <li>Respect other members</li>
            <li>Upload appropriate content only</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Event Registration</h3>
          <p className="text-slate-600 mb-2">
            Event participation is managed by the club.
          </p>
          <p className="text-slate-600 mb-6">
            Registration does not guarantee availability unless confirmed.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Media Uploads</h3>
          <p className="text-slate-600 mb-2">
            Members should only upload relevant club/event photos.
          </p>
          <p className="text-slate-600 mb-6">
            Admins may remove inappropriate content.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Account Access</h3>
          <p className="text-slate-600 mb-6">
            Members are responsible for their account security.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Platform Changes</h3>
          <p className="text-slate-600 mb-6">
            Features may change as the platform improves.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Contact</h3>
          <p className="text-slate-600 mb-6">
            Reach club administrators for any concerns.
          </p>
        </div>
      </div>
    </div>
  );
}
