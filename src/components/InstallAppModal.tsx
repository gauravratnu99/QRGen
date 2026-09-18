import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  X,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  WifiOff,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'android' | 'ios' | 'scan';

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'android';
  });

  const [installSuccess, setInstallSuccess] = useState(false);
  const [appUrl, setAppUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.href);
    }
  }, []);

  // Update default tab based on platform when opening
  useEffect(() => {
    if (isOpen) {
      if (isIOS) setActiveTab('ios');
      else if (isAndroid) setActiveTab('android');
    }
  }, [isOpen, isIOS, isAndroid]);

  // Generate QR code for mobile scanning
  useEffect(() => {
    if (isOpen && activeTab === 'scan' && qrCanvasRef.current && appUrl) {
      QRCode.toCanvas(qrCanvasRef.current, appUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0891b2',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      }).catch(() => {});
    }
  }, [isOpen, activeTab, appUrl]);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
        setInstallSuccess(false);
      }, 1500);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      id="install-app-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="install-app-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 id="install-modal-title" className="text-sm sm:text-lg font-bold tracking-tight">
                Install QRGen App
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Install directly on Android or iOS phone without app stores
              </p>
            </div>
          </div>

          <button
            id="close-install-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 p-1 sm:p-1.5 mx-4 sm:mx-6 mt-3 sm:mt-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs font-medium border border-slate-200/60 dark:border-slate-700/40">
          <button
            type="button"
            id="tab-btn-android"
            onClick={() => setActiveTab('android')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg transition-all text-[11px] sm:text-xs ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Android</span>
          </button>

          <button
            type="button"
            id="tab-btn-ios"
            onClick={() => setActiveTab('ios')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg transition-all text-[11px] sm:text-xs ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <AppleIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">iOS</span>
          </button>

          <button
            type="button"
            id="tab-btn-scan"
            onClick={() => setActiveTab('scan')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg transition-all text-[11px] sm:text-xs ${
              activeTab === 'scan'
                ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className="truncate">Scan</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* ANDROID TAB */}
          {activeTab === 'android' && (
            <div id="android-install-guide" className="space-y-4">
              {/* Direct Install CTA Button if installable or on Android */}
              {isInstallable && !isInstalled && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Instant Android Install Ready
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Your browser supports 1-click WebAPK installation directly into your Android app drawer.
                  </p>
                  <button
                    id="direct-android-install-btn"
                    type="button"
                    onClick={handleDirectInstall}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {installSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Installed Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Install on Android Device</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Android Instructions */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  How to install on any Android phone (Chrome, Samsung Internet, Edge):
                </div>

                <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Open in Chrome or Browser</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Open QRGen URL in your Android smartphone browser.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Tap the Menu Button (⋮)</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Tap the three dots icon in the top right corner of Chrome.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Tap "Install App" or "Add to Home screen"</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Android automatically builds a WebAPK package with the app icon on your home screen and app drawer.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* IOS TAB */}
          {activeTab === 'ios' && (
            <div id="ios-install-guide" className="space-y-4">
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  How to install on iPhone or iPad (Safari):
                </div>

                <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold shrink-0 text-[11px]">
                      1
                    </span>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-900 dark:text-white">Open in Safari</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Apple requires Safari for installing home screen web apps on iOS.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold shrink-0 text-[11px]">
                      2
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Tap the Share Button</span>
                        <Share2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Found at the bottom toolbar in Safari (rectangle with arrow pointing up).
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold shrink-0 text-[11px]">
                      3
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Tap "Add to Home Screen"</span>
                        <PlusSquare className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in the top right.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* SCAN TO PHONE TAB */}
          {activeTab === 'scan' && (
            <div id="scan-to-phone-section" className="flex flex-col items-center text-center space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                Scan this QR code with your iPhone or Android camera to open and install QRGen directly on your phone:
              </p>

              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md">
                <canvas ref={qrCanvasRef} className="rounded-lg" />
              </div>

              <div className="w-full flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 text-xs font-mono py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 truncate"
                />
                <button
                  id="copy-app-link-btn"
                  type="button"
                  onClick={handleCopyLink}
                  className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* App Benefits Badge Strip */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>Works 100% Offline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Zero App Store required</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>QRGen Progressive Web App (PWA)</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// Clean vector Apple icon for iOS tab
function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 170 170"
      width="1em"
      height="1em"
      fill="currentColor"
      {...props}
    >
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-5.99-9.35-10.7-20.08-14.15-32.18-3.44-12.1-5.17-23.77-5.17-35.01 0-14.25 3.63-26.07 10.89-35.45 7.26-9.38 16.5-14.16 27.71-14.33 4.89 0 10.36 1.34 16.42 4.02 6.06 2.68 10.02 4.07 11.89 4.16 1.7.09 5.86-1.34 12.49-4.3 6.63-2.95 12.35-4.22 17.16-3.8 12.7.99 22.78 5.75 30.24 14.29-11.08 6.74-16.53 15.93-16.35 27.56.18 9.08 3.52 16.79 10.03 23.12 6.51 6.34 14.39 10.02 23.63 11.05-2.28 6.96-5.06 14.07-8.36 21.32zM119.22 33.64c0-7.39 2.67-14.37 8.01-20.95 5.34-6.58 11.96-10.74 19.86-12.49.54 1.7.81 3.44.81 5.23 0 7.39-2.78 14.52-8.34 21.38-5.56 6.86-12.42 10.89-20.58 12.09-.53-1.61-.76-3.37-.76-5.26z" />
    </svg>
  );
}
