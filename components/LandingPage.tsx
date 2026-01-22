
import React from 'react';

interface LandingPageProps {
  onGoToLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  return (
    <div className="min-h-screen">
      {/* Sticky Navbar */}
      <nav className="glassmorphism fixed top-0 left-0 right-0 z-50 py-4 px-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-blue-500 flex items-center justify-center">
              <i className="fas fa-store text-white text-lg"></i>
            </div>
            <span className="font-playfair text-xl font-bold text-gray-800">ShopPromoHub</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-amber-600 font-medium transition">Home</a>
            <a href="#posters" className="text-gray-700 hover:text-amber-600 font-medium transition">Styles</a>
            <a href="#contact" className="text-gray-700 hover:text-amber-600 font-medium transition">Contact</a>
          </div>
          <button 
            onClick={onGoToLogin}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all active:scale-95"
          >
            <i className="fas fa-bolt mr-2"></i>Promo Generator
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-amber-50/50 to-blue-50/50">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-playfair leading-tight">
              Professional <span className="text-amber-600 underline decoration-amber-200">Promotion Posters</span> & AI Prompts
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-xl leading-relaxed">
              Create stunning business promotion posters and generate AI art prompts for social media ads, marketing campaigns, and sales promotions in seconds.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={onGoToLogin}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all"
              >
                <i className="fas fa-wand-magic-sparkles mr-2"></i>Create Ad Prompt
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all">
                <i className="fas fa-palette mr-2"></i>View Styles
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            
            <div className="relative space-y-6">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-8 rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-md font-bold text-xs uppercase tracking-widest">Pongal Offer</span>
                  <i className="fas fa-laptop text-white/50 text-4xl"></i>
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">LAPTOP DEALS</h3>
                <p className="text-white/80 text-sm">Starts from ₹24,999 + Free Gifts</p>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform ml-12 cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-md font-bold text-xs uppercase tracking-widest">Free Gift</span>
                  <i className="fas fa-gem text-white/50 text-4xl"></i>
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">MEGA DISCOUNT</h3>
                <p className="text-white/80 text-sm text-center">UP TO 65% OFF TODAY</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact Placeholder */}
      <footer id="contact" className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">© 2024 ShopPromoHub AI. 100% Professional Promotional Solutions.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
