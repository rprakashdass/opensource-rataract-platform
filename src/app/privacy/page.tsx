import React from 'react';

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-slate max-w-none">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500 font-medium mb-8">Last Updated: {currentDate}</p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. About This Platform</h3>
          <p className="text-slate-600 mb-6">
            This platform is used by Rotaract Clubs to manage members,
            events, projects, communication, and club activities.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Information We Collect</h3>
          <p className="text-slate-600 mb-4">We may collect:</p>
          <ul className="list-disc pl-5 text-slate-600 mb-6 space-y-1">
            <li>Name</li>
            <li>Email</li>
            <li>Phone number</li>
            <li>Profile information</li>
            <li>Event participation data</li>
            <li>Uploaded photos/media</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. How Information Is Used</h3>
          <p className="text-slate-600 mb-4">Information is used for:</p>
          <ul className="list-disc pl-5 text-slate-600 mb-6 space-y-1">
            <li>Club administration</li>
            <li>Event communication</li>
            <li>Attendance tracking</li>
            <li>Membership management</li>
            <li>Sharing club memories</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Photos & Media</h3>
          <p className="text-slate-600 mb-2">
            Photos uploaded during events may be reviewed by club admins
            before appearing publicly.
          </p>
          <p className="text-slate-600 mb-6">
            Members can request removal of their photos.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Data Access</h3>
          <p className="text-slate-600 mb-6">
            Only authorized club administrators can access internal member data.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Third Party Services</h3>
          <p className="text-slate-600 mb-4">We may use trusted services including:</p>
          <ul className="list-disc pl-5 text-slate-600 mb-6 space-y-1">
            <li>Google Drive for media storage</li>
            <li>Email providers for communication</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Contact</h3>
          <p className="text-slate-600 mb-6">
            For privacy concerns, contact the club administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
