import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { CloudOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 z-100 flex items-center gap-2 bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom duration-300">
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <CloudOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Offline Mode — Saving locally to browser</span>
    </div>
  );
};
