import { Linkedin, Facebook, Github, Mail, Phone, Code } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Company Section */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  MicroTasker
                </h3>
              </div>
              <p className="text-gray-400 text-xs mb-3">
                Task completion platform
              </p>

              {/* Social Media */}
              <div className="flex space-x-2">
                <a
                  href="https://www.linkedin.com/in/mohammad-fakhrul-islam-tazim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-gray-900 rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.facebook.com/tazimulislam.salam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-gray-900 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://github.com/tazim5032"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-white">Contact</h4>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>support@microtasker.com</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>+880 123-456-7890</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-white">Links</h4>
              <div className="space-y-1">
                {["About", "Support", "Privacy", "Careers"].map(
                  (link, index) => (
                    <a
                      key={index}
                      href="#"
                      className="block text-gray-400 hover:text-white transition-colors text-xs"
                    >
                      {link}
                    </a>
                  )
                )}
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-white">
                Newsletter
              </h4>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 text-xs"
                />
                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 text-xs text-gray-400">
              <span>
                © {new Date().getFullYear()} MicroTasker. All rights reserved.
              </span>

              <div className="flex items-center space-x-1">
                <span>Built by</span>
                <a
                  href="https://www.linkedin.com/in/mohammad-fakhrul-islam-tazim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Mohammad Fakhrul Islam
                </a>
              </div>

              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
