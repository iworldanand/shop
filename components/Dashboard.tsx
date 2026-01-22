
import React, { useState, useEffect, useCallback } from 'react';
import { CATEGORIES, PROMPTS_DATABASE, TAMIL_MAP, DAILY_LIMITS } from '../constants';
import { PromotionDetails } from '../types';
import PromptCard from './PromptCard';
import PosterPreview from './PosterPreview';
import LimitsModal from './LimitsModal';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const [details, setDetails] = useState<PromotionDetails>({
    shopName: 'Sathya Electronics',
    product: 'Laptops, RGB Speakers, Tables',
    offer: 'Upto 65% OFF',
    location: 'Chennai',
    theme: 'Bold & Colorful',
    eventDate: '14-19 January',
    offerPrice: 'Starts From ₹24,999',
    freeGifts: 'Laptop Bag, Wireless Mouse, Mouse Pad',
    additionalOffer: '3% Instant OFF on Card/UPI',
    aspectRatio: '1:1',
    posterStyle: 'Bold Offer'
  });

  const [currentCategory, setCurrentCategory] = useState(CATEGORIES[0]);
  const [tamilToggle, setTamilToggle] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [limitsModal, setLimitsModal] = useState<'image' | 'video' | null>(null);
  const [usage, setUsage] = useState({ image: 0, video: 0 });

  useEffect(() => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('lastResetDate');
    if (lastDate !== today) {
      localStorage.setItem('lastResetDate', today);
      localStorage.setItem('imageCopies', '0');
      localStorage.setItem('videoCopies', '0');
      setUsage({ image: 0, video: 0 });
    } else {
      const img = parseInt(localStorage.getItem('imageCopies') || '0');
      const vid = parseInt(localStorage.getItem('videoCopies') || '0');
      setUsage({ image: img, video: vid });
    }
  }, []);

  const handleInputChange = (field: keyof PromotionDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (tamilToggle && e.key === ' ') {
      const input = e.currentTarget;
      const words = input.value.split(' ');
      if (words.length > 1) {
        const lastWord = words[words.length - 2].toLowerCase();
        if (TAMIL_MAP[lastWord]) {
          words[words.length - 2] = TAMIL_MAP[lastWord];
          const newValue = words.join(' ');
          const fieldName = input.name as keyof PromotionDetails;
          handleInputChange(fieldName, newValue);
        }
      }
    }
  };

  const handleCopy = (type: 'image' | 'video', text: string) => {
    const currentLimit = type === 'image' ? DAILY_LIMITS.IMAGE : DAILY_LIMITS.VIDEO;
    const currentUsage = type === 'image' ? usage.image : usage.video;

    if (currentUsage >= currentLimit) {
      setLimitsModal(type);
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      const newUsage = { ...usage, [type]: currentUsage + 1 };
      setUsage(newUsage);
      localStorage.setItem(`${type}Copies`, (currentUsage + 1).toString());
      alert(`Copied ${type} prompt!`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="glassmorphism sticky top-0 z-40 py-4 px-6 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-blue-500 flex items-center justify-center">
              <i className="fas fa-store text-white"></i>
            </div>
            <div>
              <h1 className="font-playfair text-xl font-bold text-gray-800">ShopPromoHub</h1>
              <p className="text-xs text-gray-500">Welcome, {userEmail}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
             <div className="flex space-x-4 text-center">
               <div className="bg-amber-100 px-3 py-1 rounded-full text-xs font-bold text-amber-800">
                 Images: {usage.image}/{DAILY_LIMITS.IMAGE}
               </div>
               <div className="bg-blue-100 px-3 py-1 rounded-full text-xs font-bold text-blue-800">
                 Videos: {usage.video}/{DAILY_LIMITS.VIDEO}
               </div>
             </div>
             <button onClick={onLogout} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6">
        <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <i className="fas fa-edit mr-3 text-amber-500"></i>Enter Promotion Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(details).map((key) => {
              const field = key as keyof PromotionDetails;
              if (field === 'theme' || field === 'aspectRatio' || field === 'posterStyle') return null;
              return (
                <div key={field}>
                  <label className="block text-gray-600 font-medium text-sm mb-2 capitalize">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    name={field}
                    type="text"
                    value={details[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    onKeyUp={handleKeyup}
                    placeholder={`Enter ${field}`}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>
              );
            })}

            {/* Selects */}
            <div>
              <label className="block text-gray-600 font-medium text-sm mb-2">Theme</label>
              <select 
                value={details.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              >
                <option>Modern Tech</option>
                <option>Festival</option>
                <option>Luxury</option>
                <option>Bold & Colorful</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-medium text-sm mb-2">Aspect Ratio</label>
              <select 
                value={details.aspectRatio}
                onChange={(e) => handleInputChange('aspectRatio', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              >
                <option>1:1</option>
                <option>16:9</option>
                <option>9:16</option>
                <option>4:5</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 font-medium text-sm mb-2">Poster Style</label>
              <select 
                value={details.posterStyle}
                onChange={(e) => handleInputChange('posterStyle', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              >
                <option>Bold Offer</option>
                <option>Free Gift</option>
                <option>Minimalist</option>
                <option>Festival</option>
                <option>Luxury</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
             <div className="flex items-center space-x-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={tamilToggle} onChange={() => setTamilToggle(!tamilToggle)} className="sr-only peer"/>
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
                <span className="text-sm font-medium text-amber-900">Tamil Typing (Phonetic + Space)</span>
             </div>
             <button 
               onClick={() => setShowPoster(true)}
               className="bg-amber-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-200 transition-all active:scale-95"
             >
               GENERATE PREVIEW
             </button>
          </div>
        </section>

        {/* Prompt Library */}
        <section>
          <div className="flex overflow-x-auto space-x-2 pb-6 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCurrentCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  currentCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {PROMPTS_DATABASE[currentCategory]?.map(prompt => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
                details={details} 
                onCopy={handleCopy}
              />
            ))}
          </div>
        </section>
      </main>

      {showPoster && (
        <PosterPreview details={details} onClose={() => setShowPoster(false)} />
      )}

      {limitsModal && (
        <LimitsModal type={limitsModal} onClose={() => setLimitsModal(null)} />
      )}
    </div>
  );
};

export default Dashboard;
