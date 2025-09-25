
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-blue-600">MyStartup</h1>
        <div className="space-x-6">
          <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
          <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
          <a href="#contact" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 py-20">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Build Your Idea <span className="text-blue-600">Faster</span>
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          A modern landing page template built with Next.js & Tailwind. Launch your project quickly.
        </p>
        <div className="flex gap-4">
          <a href="#contact" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Start Now</a>
          <a href="#features" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">Learn More</a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 py-16 bg-white">
        <h3 className="text-3xl font-bold text-center mb-12">Features</h3>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg">
            <h4 className="font-semibold text-xl mb-2">🚀 Fast Setup</h4>
            <p className="text-gray-600">Get your project running in minutes with clean code structure.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg">
            <h4 className="font-semibold text-xl mb-2">📱 Responsive</h4>
            <p className="text-gray-600">Looks great on any device, mobile to desktop.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg">
            <h4 className="font-semibold text-xl mb-2">⚡ Modern Stack</h4>
            <p className="text-gray-600">Built with Next.js 13+ and Tailwind CSS for speed and flexibility.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center bg-gray-200 text-gray-700">
        © {new Date().getFullYear()} MyStartup. All rights reserved.
      </footer>
    </div>
  );
}
