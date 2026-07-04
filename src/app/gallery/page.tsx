export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Gallery</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-300 rounded-lg hover:opacity-75 transition cursor-pointer" />
          ))}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12">
          <p>Gallery with image management coming soon in Sprint 2.</p>
        </div>
      </section>
    </main>
  );
}
