import React from 'react';
import { User, ConnectionStatus } from '../types';
import { MessageCircle, Heart, GraduationCap, UserPlus, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface WriterCardProps {
  writer: User;
  onChat: (writer: User) => void;
  index: number;
  onToggleSave?: (id: string) => void;
  isSaved?: boolean;
  connectionStatus?: ConnectionStatus;
  onConnect?: (id: string) => void;
}

const WriterCard: React.FC<WriterCardProps> = ({ writer, onChat, index, onToggleSave, isSaved, connectionStatus = 'none', onConnect }) => {

  const renderActionButton = () => {
    // 1. Connected -> Message
    if (connectionStatus === 'connected') {
      return (
        <button
          onClick={() => onChat(writer)}
          className="w-full bg-slate-900 group-hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <MessageCircle size={16} /> Message
        </button>
      );
    }

    // 2. Pending (Sent by me)
    if (connectionStatus === 'pending_sent') {
      return (
        <button
          disabled
          className="w-full bg-slate-100 text-slate-400 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <Clock size={16} /> Request Sent
        </button>
      );
    }

    // 3. Pending (Received) - Redirect to profile to accept
    if (connectionStatus === 'pending_received') {
      return (
        <button
          disabled
          className="w-full bg-orange-50 text-orange-600 border border-orange-100 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
        >
          <UserPlus size={16} /> Request Received
        </button>
      );
    }

    // 4. Default -> Connect
    return (
      <button
        onClick={() => onConnect && onConnect(writer.id)}
        className="w-full bg-white border border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
      >
        <UserPlus size={16} /> Connect
      </button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3">
            <img
              src={writer.avatar_url}
              alt={writer.handle}
              loading="lazy"
              className="w-12 h-12 rounded-full object-cover bg-orange-50 border border-orange-100 shadow-sm"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${writer.handle}`;
              }}
            />
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                {writer.handle}
                {writer.is_writer && (
                  <span className="bg-orange-100 text-orange-600 text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-orange-200" title="Active Contributor">
                    <Zap size={8} className="fill-orange-500" /> CONTRIBUTOR
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <GraduationCap size={12} className="text-orange-500" />
                <span className="truncate max-w-[140px] font-medium">{writer.school}</span>
              </div>
            </div>
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(writer.id); }}
              className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-red-50 text-red-500' : 'text-slate-400 hover:bg-orange-50 hover:text-red-400'}`}
            >
              <Heart size={18} className={isSaved ? 'fill-current' : ''} />
            </button>
          )}
        </div>

        <div className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px] leading-relaxed">
          {writer.bio || "Student ready to help!"}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {writer.tags?.slice(0, 3).map((tag, t) => (
            <span key={t} className="px-2.5 py-1 text-[10px] font-bold rounded-md text-slate-600 bg-slate-50 border border-slate-200 group-hover:border-orange-100 group-hover:bg-orange-50 transition-colors">
              {tag}
            </span>
          ))}
        </div>

        {renderActionButton()}
      </div>

      {/* Mini Portfolio Strip */}
      {writer.portfolio && writer.portfolio.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-2 flex gap-2 overflow-x-auto no-scrollbar h-24">
          {writer.portfolio.map((img, i) => (
            <div key={i} className="flex-shrink-0 w-20 h-full overflow-hidden rounded-lg border border-slate-200 bg-white cursor-pointer hover:opacity-90 transition-opacity relative group/img">
              <img
                src={img}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Hide broken portfolio images
                  e.currentTarget.parentElement!.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default WriterCard;