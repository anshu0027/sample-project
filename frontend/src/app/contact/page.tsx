import { Mail, User, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white shadow-2xl rounded-xl p-8 sm:p-10 md:p-12 space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Get in Touch</h1>
          <p className="mt-2 text-md text-gray-600">
            We'd love to hear from you! Send us a message using the form below.
          </p>
        </div>
        <form className="mt-8 space-y-6">
          {/* Name Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              disabled
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 cursor-not-allowed"
              placeholder="Your Name"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              disabled
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 cursor-not-allowed"
              placeholder="Email address"
            />
          </div>

          {/* Message Textarea */}
          <div className="relative">
            <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="message"
              name="message"
              rows={4}
              disabled
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 cursor-not-allowed"
              placeholder="Your message"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 opacity-60 cursor-not-allowed"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
