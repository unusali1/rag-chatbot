'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Upload, HomeIcon, Globe, Bot, Menu } from 'lucide-react';

export default function HomePage() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Header */}
      <header className="bg-blue-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  AbroadBot
                </h1>
                <p className="text-xs text-blue-100 opacity-90">Your Global Education Assistant</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/')
                    ? 'bg-white/20 text-white font-semibold shadow-md'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
              </Link>

              <Link
                href="/chat"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/chat')
                    ? 'bg-white/20 text-white font-semibold shadow-md'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat with Bot</span>
              </Link>

              {/* <Link
                href="/upload"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/upload')
                    ? 'bg-white/20 text-white font-semibold shadow-md'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span>Upload Documents</span>
              </Link> */}
            </nav>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-white">
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-indigo-800 border-t border-indigo-600">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                isActive('/') ? 'bg-white/20 text-white font-medium' : 'text-blue-100'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link
              href="/chat"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                isActive('/chat') ? 'bg-white/20 text-white font-medium' : 'text-blue-100'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat with Bot</span>
            </Link>
            <Link
              href="/upload"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg  ${
                isActive('/upload') ? 'bg-white/20 text-white font-medium' : 'text-blue-100'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>Upload Documents</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white from-indigo-50 to-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-blue-600 from-blue-500 to-indigo-600 rounded-3xl shadow-2xl animate-pulse">
              <Bot className="w-24 h-24 text-white" />
            </div>
          </div>

          <h2 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Study Abroad Made Simple with <span className="text-indigo-600">AI</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Get instant answers about universities, visas, scholarships, SOPs, LORs, and more — 
            powered by our intelligent abroad inquiry assistant.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 from-blue-600 to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              Start Chatting Now
            </Link>

            {/* <Link
              href="/upload"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-700 font-semibold text-lg rounded-xl shadow-lg border-2 border-indigo-200 hover:bg-indigo-50 transform hover:scale-105 transition-all duration-300"
            >
              <Upload className="w-6 h-6 mr-3" />
              Upload Your Profile
            </Link> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Students Love AbroadBot
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <MessageCircle className="w-12 h-12 text-blue-600" />,
                title: "24/7 Instant Answers",
                desc: "Ask anything about studying abroad — anytime, anywhere."
              },
              {
                icon: <Globe className="w-12 h-12 text-indigo-600" />,
                title: "100+ Countries Covered",
                desc: "USA, Canada, UK, Australia, Germany, Ireland & more."
              },
              {
                icon: <Upload className="w-12 h-12 text-purple-600" />,
                title: "Smart Document Analysis",
                desc: "Upload transcripts, resumes, essays — get personalized feedback."
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
              >
                <div className="mb-6">{feature.icon}</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Globe className="w-10 h-10 text-indigo-400" />
          </div>
          <p className="text-lg mb-4">Made with ❤️ for dreamers chasing global education</p>
          <p className="text-sm text-gray-400">© 2025 AbroadBot. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}