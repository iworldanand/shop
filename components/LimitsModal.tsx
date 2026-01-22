
import React from 'react';

interface LimitsModalProps {
  type: 'image' | 'video';
  onClose: () => void;
}

const LimitsModal: React.FC<LimitsModalProps> = ({ type, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Daily Limit Reached</h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          You have reached your daily limit for {type} prompt copies. 
          Limits reset every 24 hours at midnight.
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default LimitsModal;
