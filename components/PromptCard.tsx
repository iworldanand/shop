
import React, { useState } from 'react';
import { PromptTemplate, PromotionDetails } from '../types';
import { enhancePrompt } from '../services/geminiService';

interface PromptCardProps {
  prompt: PromptTemplate;
  details: PromotionDetails;
  onCopy: (type: 'image' | 'video', text: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, details, onCopy }) => {
  const [enhancing, setEnhancing] = useState(false);

  const getProcessedText = (text: string) => {
    let result = text;
    const map: Record<string, string> = {
      '[SHOP_NAME]': details.shopName,
      '[PRODUCT]': details.product,
      '[OFFER]': details.offer,
      '[LOCATION]': details.location,
      '[THEME]': details.theme,
      '[EVENT_DATE]': details.eventDate,
      '[OFFER_PRICE]': details.offerPrice,
      '[FREE_GIFTS]': details.freeGifts,
      '[ADDITIONAL_OFFER]': details.additionalOffer,
      '[ASPECT_RATIO]': details.aspectRatio
    };
    Object.entries(map).forEach(([key, val]) => {
      result = result.replace(new RegExp('\\' + key, 'g'), val);
    });
    return result;
  };

  const processedImage = getProcessedText(prompt.imagePrompt);
  const processedVideo = getProcessedText(prompt.videoPrompt);

  const handleEnhance = async () => {
    setEnhancing(true);
    const enhanced = await enhancePrompt(processedImage, details);
    navigator.clipboard.writeText(enhanced).then(() => {
      alert("Enhanced AI Prompt Copied to Clipboard!");
      setEnhancing(false);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col">
      <div className="mb-4">
        <h3 className="font-tamil text-xl font-bold text-gray-800">{prompt.titleTamil}</h3>
        <p className="text-gray-500 font-medium">{prompt.titleEnglish}</p>
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Image Prompt</label>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm italic text-gray-600 leading-relaxed mb-3 h-24 overflow-y-auto">
            {processedImage}
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onCopy('image', processedImage)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl transition-all flex items-center justify-center text-sm"
            >
              <i className="fas fa-copy mr-2"></i>Copy Image
            </button>
            <button 
              onClick={handleEnhance}
              disabled={enhancing}
              className="px-4 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-xl transition-all"
              title="Enhance with Gemini AI"
            >
              {enhancing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Video Prompt</label>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm italic text-gray-600 leading-relaxed mb-3 h-24 overflow-y-auto">
            {processedVideo}
          </div>
          <button 
            onClick={() => onCopy('video', processedVideo)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-all flex items-center justify-center text-sm"
          >
            <i className="fas fa-copy mr-2"></i>Copy Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
