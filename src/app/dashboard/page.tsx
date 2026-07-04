export default function DashboardPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Events Attended</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Projects Participated</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Member Since</p>
          <p className="text-lg font-semibold text-gray-900">Just joined</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-blue-900">
        <h2 className="font-semibold mb-2">👋 Welcome to the Rotaract Platform!</h2>
        <p>The member dashboard is coming soon in Sprint 2.</p>
      </div>
    </div>
  );
}
