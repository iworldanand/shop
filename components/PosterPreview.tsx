
import React from 'react';
import { PromotionDetails } from '../types';

interface PosterPreviewProps {
  details: PromotionDetails;
  onClose: () => void;
}

const PosterPreview: React.FC<PosterPreviewProps> = ({ details, onClose }) => {
  const renderPoster = () => {
    switch(details.posterStyle) {
      case 'Bold Offer':
        return (
          <div className="w-full aspect-square bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-xl"></div>
            <div className="relative z-10 flex flex-col h-full">
              <span className="bg-red-500 text-white px-4 py-1 rounded-lg font-black text-sm w-fit mb-4 animate-pulse">
                SPECIAL OFFER
              </span>
              <h2 className="text-4xl font-black mb-2 leading-tight">{details.shopName}</h2>
              <p className="text-amber-100 text-lg mb-6 font-medium uppercase tracking-widest">{details.product}</p>
              
              <div className="mt-auto bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <p className="text-5xl font-black mb-1">{details.offer}</p>
                <p className="text-xl font-bold">{details.offerPrice}</p>
              </div>
              <div className="mt-4 flex justify-between items-end">
                <p className="text-sm font-bold">{details.location} | {details.eventDate}</p>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-lg">
                  <i className="fas fa-store"></i>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Free Gift':
        return (
          <div className="w-full aspect-square bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-8 text-white relative shadow-2xl overflow-hidden">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             <div className="relative z-10 text-center flex flex-col h-full items-center justify-center">
                <div className="bg-amber-400 text-black px-6 py-2 rounded-full font-black text-xl mb-6 shadow-xl">
                  FREE GIFTS!
                </div>
                <h2 className="text-3xl font-bold mb-2">{details.shopName}</h2>
                <div className="w-full border-t border-white/20 my-4"></div>
                <p className="text-6xl font-black text-amber-400 mb-2">{details.offer}</p>
                <p className="text-xl italic opacity-80 mb-8">{details.freeGifts}</p>
                <div className="mt-4 bg-white/10 p-4 rounded-xl">
                   <p className="font-bold">{details.eventDate}</p>
                </div>
             </div>
          </div>
        );
      case 'Festival':
        return (
          <div className="w-full aspect-square bg-red-700 rounded-3xl p-8 text-white relative shadow-2xl border-8 border-yellow-500/30">
             <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-dashed border-white/30 rounded-2xl pointer-events-none"></div>
             <div className="relative z-10 text-center flex flex-col h-full justify-between py-8">
                <div>
                  <h4 className="font-tamil text-3xl mb-1">திருவிழா சலுகை</h4>
                  <p className="text-yellow-400 font-bold tracking-widest">FESTIVAL MEGA SALE</p>
                </div>
                <div>
                   <h2 className="text-4xl font-black mb-2">{details.shopName}</h2>
                   <p className="text-6xl font-black text-yellow-400">{details.offer}</p>
                </div>
                <div className="space-y-1">
                   <p className="font-bold text-lg">{details.offerPrice}</p>
                   <p className="text-sm opacity-80">{details.additionalOffer}</p>
                </div>
             </div>
          </div>
        );
      default:
        return (
          <div className="w-full aspect-square bg-gray-900 rounded-3xl p-8 text-white flex items-center justify-center">
            <h2 className="text-2xl font-bold">Style Preview Coming Soon...</h2>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-8 max-w-xl w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Poster Design Preview</h3>
          <p className="text-gray-500">Visual style: {details.posterStyle}</p>
        </div>

        <div className="mb-8 transform transition-transform hover:scale-[1.02]">
          {renderPoster()}
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-2xl transition-all">
             <i className="fas fa-share-alt mr-2"></i>Share
           </button>
           <button 
             onClick={() => window.print()}
             className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-200 transition-all"
           >
             <i className="fas fa-download mr-2"></i>Download
           </button>
        </div>
      </div>
    </div>
  );
};

export default PosterPreview;
