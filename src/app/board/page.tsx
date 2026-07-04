export default function BoardPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Board Members</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Board Member {i}</h3>
              <p className="text-gray-600 mt-2">Position</p>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12">
          <p>Board member profiles coming soon in Sprint 1.</p>
        </div>
      </section>
    </main>
  );
}
