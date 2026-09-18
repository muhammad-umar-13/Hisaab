import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside an installed PWA context, hide the widget
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-wider border border-emerald-100">
        <Check className="w-3.5 h-3.5" />
        <span>Installed App</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not natively supported by WebKit/iOS Safari)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-teal-200 bg-teal-50/30 text-teal-700 hover:bg-teal-50/60 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-100 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                  <Smartphone className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Install on iPhone / iPad</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">iOS Safari Guide</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                <p>
                  iOS Safari doesn't support automatic installation. You can install it manually in two simple taps:
                </p>
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 font-medium">
                  <div className="flex gap-2">
                    <span className="text-teal-600 font-extrabold">1.</span>
                    <span>Tap the <b className="text-slate-800">Share icon</b> (square with up arrow) in the bottom toolbar.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-teal-600 font-extrabold">2.</span>
                    <span>Scroll down and select <b className="text-slate-800">Add to Home Screen</b>.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback / other desktop browsers that don't support installable prompts directly in web page context
  return (
    <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/50 text-teal-800 rounded-xl text-[10px] font-bold uppercase tracking-wider">
      <span>PWA Ready</span>
    </div>
  );
};
