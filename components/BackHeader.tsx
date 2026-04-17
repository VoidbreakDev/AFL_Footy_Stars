import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}

const BackHeader: React.FC<BackHeaderProps> = ({ title, subtitle, onBack, rightSlot }) => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 h-14 sticky top-0 z-10 flex items-center px-4">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center flex-shrink-0"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      
      <div className="flex-1 min-w-0 ml-3">
        <h1 className="text-white font-black text-sm uppercase truncate">{title}</h1>
        {subtitle && <p className="text-slate-400 text-xs truncate">{subtitle}</p>}
      </div>
      
      {rightSlot && (
        <div className="flex-shrink-0 ml-2">
          {rightSlot}
        </div>
      )}
    </div>
  );
};

export default BackHeader;