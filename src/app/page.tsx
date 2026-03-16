import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-indigo-700 mb-4">Success Point</h1>
          <p className="text-xl text-gray-600 mb-2">Coaching Classes</p>
          <p className="text-gray-500">Excellence in 9th & 10th Class Mathematics & Science</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">📐</div>
            <h3 className="text-xl font-semibold mb-2">Mathematics</h3>
            <p className="text-gray-500">
              Strong foundation in algebra, geometry, trigonometry and more for classes 9 & 10.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-xl font-semibold mb-2">Science</h3>
            <p className="text-gray-500">
              Physics, Chemistry & Biology with practical understanding and board exam preparation.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Results</h3>
            <p className="text-gray-500">
              Proven track record of excellent results with personalized attention to every student.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition shadow-lg"
          >
            Login to Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
