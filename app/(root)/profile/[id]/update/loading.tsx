export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="backdrop-blur-sm bg-white/80 rounded-2xl p-8 max-w-3xl w-full border border-gray-100 shadow-lg">
        <div className="space-y-6 animate-pulse">
          {/* Header */}
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mx-auto" />
          
          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-10 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Button */}
          <div className="flex justify-center">
            <div className="h-10 bg-gray-200 rounded-lg w-32" />
          </div>
        </div>
      </div>
    </main>
  );
} 