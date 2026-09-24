import React, { useState, useEffect } from 'react';
import {
  Link2,
  Mail,
  Phone,
  Instagram,
  Clipboard,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Send,
  AtSign,
  User,
  MessageCircle,
} from 'lucide-react';
import { isValidUrl, normalizeUrl, detectPayloadCategory } from '../utils/qr';

interface UrlInputSectionProps {
  url: string;
  onChange: (url: string) => void;
}

type InputTab = 'url' | 'email' | 'phone' | 'instagram';
type PhoneSubMode = 'call' | 'sms' | 'whatsapp';

const PRESET_URLS = [
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'YouTube', url: 'https://youtube.com' },
  { label: 'LinkedIn', url: 'https://linkedin.com' },
  { label: 'Spotify', url: 'https://spotify.com' },
];

const PRESET_EMAIL_SUBJECTS = [
  'General Inquiry',
  'Collaboration Proposal',
  'Quick Question',
  'Saying Hello!',
];

const PRESET_INSTA_HANDLES = [
  'gauravratnu',
  'instagram',
  'creators',
  'design',
];

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({ url, onChange }) => {
  // Detect active tab from current URL value if possible
  const [activeTab, setActiveTab] = useState<InputTab>(() => {
    if (/^mailto:/i.test(url)) return 'email';
    if (/^(tel:|sms:|https:\/\/wa\.me)/i.test(url)) return 'phone';
    if (/instagram\.com/i.test(url)) return 'instagram';
    return 'url';
  });

  // URL state
  const [webUrl, setWebUrl] = useState(url);

  // Email sub-state
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Phone sub-state
  const [phoneMode, setPhoneMode] = useState<PhoneSubMode>('call');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneMessage, setPhoneMessage] = useState('');

  // Instagram sub-state
  const [instaHandle, setInstaHandle] = useState('');

  const [pasteFeedback, setPasteFeedback] = useState(false);

  // Parse external URL changes into sub-states
  useEffect(() => {
    if (!url) return;
    if (/^mailto:/i.test(url)) {
      try {
        const withoutPrefix = url.replace(/^mailto:/i, '');
        const [to, query] = withoutPrefix.split('?');
        setEmailTo(to || '');
        if (query) {
          const params = new URLSearchParams(query);
          setEmailSubject(params.get('subject') || '');
          setEmailBody(params.get('body') || '');
        }
      } catch {
        // Fallback
      }
    } else if (/^tel:/i.test(url)) {
      setPhoneMode('call');
      setPhoneNumber(url.replace(/^tel:/i, ''));
    } else if (/^sms:/i.test(url)) {
      setPhoneMode('sms');
      const withoutPrefix = url.replace(/^sms:/i, '');
      const [num, query] = withoutPrefix.split('?');
      setPhoneNumber(num || '');
      if (query) {
        const params = new URLSearchParams(query);
        setPhoneMessage(params.get('body') || '');
      }
    } else if (/wa\.me/i.test(url)) {
      setPhoneMode('whatsapp');
      const match = url.match(/wa\.me\/([0-9+]+)/);
      if (match) setPhoneNumber(match[1]);
      try {
        const parsed = new URL(url);
        setPhoneMessage(parsed.searchParams.get('text') || '');
      } catch {}
    } else if (/instagram\.com/i.test(url)) {
      const match = url.match(/instagram\.com\/([a-zA-Z0-9_.-]+)/i);
      if (match && match[1]) {
        setInstaHandle(match[1].replace(/\/$/, ''));
      }
    } else {
      setWebUrl(url);
    }
  }, [url]);

  // Tab change handler
  const handleTabSelect = (tab: InputTab) => {
    setActiveTab(tab);
    if (tab === 'url') {
      onChange(webUrl.trim() || 'https://github.com');
    } else if (tab === 'email') {
      const email = emailTo.trim() || 'hello@example.com';
      buildAndEmitEmail(email, emailSubject, emailBody);
    } else if (tab === 'phone') {
      const num = phoneNumber.trim() || '+1234567890';
      buildAndEmitPhone(phoneMode, num, phoneMessage);
    } else if (tab === 'instagram') {
      const handle = instaHandle.trim() || 'gauravratnu';
      buildAndEmitInsta(handle);
    }
  };

  // Helper generators
  const buildAndEmitEmail = (to: string, subject: string, body: string) => {
    const cleanTo = to.trim();
    if (!cleanTo) {
      onChange('');
      return;
    }
    const params = new URLSearchParams();
    if (subject.trim()) params.append('subject', subject.trim());
    if (body.trim()) params.append('body', body.trim());
    const query = params.toString();
    const payload = `mailto:${cleanTo}${query ? `?${query}` : ''}`;
    onChange(payload);
  };

  const buildAndEmitPhone = (mode: PhoneSubMode, num: string, msg: string) => {
    const cleanNum = num.trim();
    if (!cleanNum) {
      onChange('');
      return;
    }
    if (mode === 'call') {
      onChange(`tel:${cleanNum}`);
    } else if (mode === 'sms') {
      const query = msg.trim() ? `?body=${encodeURIComponent(msg.trim())}` : '';
      onChange(`sms:${cleanNum}${query}`);
    } else if (mode === 'whatsapp') {
      const digitsOnly = cleanNum.replace(/[^0-9]/g, '');
      const query = msg.trim() ? `?text=${encodeURIComponent(msg.trim())}` : '';
      onChange(`https://wa.me/${digitsOnly}${query}`);
    }
  };

  const buildAndEmitInsta = (handleInput: string) => {
    let clean = handleInput.trim();
    if (!clean) {
      onChange('');
      return;
    }
    // Remove @ if present
    clean = clean.replace(/^@/, '');
    // If user pasted a full URL, extract username
    const match = clean.match(/instagram\.com\/([a-zA-Z0-9_.-]+)/i);
    if (match && match[1]) {
      clean = match[1].replace(/\/$/, '');
    }
    onChange(`https://www.instagram.com/${clean}/`);
  };

  // Quick clipboard paste for URL tab
  const handlePasteUrl = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const trimmed = text.trim();
          setWebUrl(trimmed);
          onChange(trimmed);
          setPasteFeedback(true);
          setTimeout(() => setPasteFeedback(false), 1500);
        }
      }
    } catch {}
  };

  const category = detectPayloadCategory(url);
  const isValid = isValidUrl(url);
  const normalized = normalizeUrl(url);

  return (
    <div id="url-input-container" className="space-y-3.5">
      {/* Type Selector Tabs */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>Share Your Input</span>
        </span>

        {url && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors ${
              isValid
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>{category.label}</span>
          </span>
        )}
      </div>

      {/* 4 Feature Type Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          id="tab-select-url"
          type="button"
          onClick={() => handleTabSelect('url')}
          className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'url'
              ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-cyan-500" />
          <span>Website</span>
        </button>

        <button
          id="tab-select-email"
          type="button"
          onClick={() => handleTabSelect('email')}
          className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'email'
              ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-blue-500" />
          <span>Email</span>
        </button>

        <button
          id="tab-select-phone"
          type="button"
          onClick={() => handleTabSelect('phone')}
          className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'phone'
              ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-emerald-500" />
          <span>Phone / SMS</span>
        </button>

        <button
          id="tab-select-instagram"
          type="button"
          onClick={() => handleTabSelect('instagram')}
          className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'instagram'
              ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Instagram className="w-3.5 h-3.5 text-pink-500" />
          <span>Instagram</span>
        </button>
      </div>

      {/* ----------------- TAB 1: WEBSITE URL ----------------- */}
      {activeTab === 'url' && (
        <div id="website-url-panel" className="space-y-2.5 animate-in fade-in duration-150">
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 transition-all focus-within:border-cyan-500 dark:focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/30">
            <Link2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400 mr-2.5 shrink-0" />
            <input
              id="qr-url-input"
              type="text"
              value={webUrl}
              onChange={(e) => {
                setWebUrl(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Enter web link (e.g., https://yourwebsite.com)"
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none font-medium"
              autoComplete="off"
              spellCheck="false"
            />

            <div className="flex items-center gap-1 ml-2 shrink-0">
              {webUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setWebUrl('');
                    onChange('');
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handlePasteUrl}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3 h-3" />
                <span className="hidden sm:inline">{pasteFeedback ? 'Pasted' : 'Paste'}</span>
              </button>

              {isValid && (
                <a
                  href={normalized}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-md text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title="Test visit link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>Presets:</span>
            </span>
            {PRESET_URLS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setWebUrl(preset.url);
                  onChange(preset.url);
                }}
                className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                  url === preset.url
                    ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 font-medium'
                    : 'bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: EMAIL SHARING ----------------- */}
      {activeTab === 'email' && (
        <div id="email-share-panel" className="space-y-2.5 animate-in fade-in duration-150">
          {/* Recipient Email */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30">
            <Mail className="w-4 h-4 text-blue-500 mr-2.5 shrink-0" />
            <input
              id="qr-email-recipient-input"
              type="email"
              value={emailTo}
              onChange={(e) => {
                setEmailTo(e.target.value);
                buildAndEmitEmail(e.target.value, emailSubject, emailBody);
              }}
              placeholder="Recipient Email (e.g., hello@yourdomain.com)"
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none font-medium"
              spellCheck="false"
            />
          </div>

          {/* Subject Line */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30">
            <span className="text-[11px] font-semibold text-slate-400 mr-2.5 uppercase tracking-wide shrink-0">
              Subject:
            </span>
            <input
              id="qr-email-subject-input"
              type="text"
              value={emailSubject}
              onChange={(e) => {
                setEmailSubject(e.target.value);
                buildAndEmitEmail(emailTo, e.target.value, emailBody);
              }}
              placeholder="Optional subject line (e.g., Partnership Request)"
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none font-medium"
            />
          </div>

          {/* Body Message */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30">
            <textarea
              id="qr-email-body-input"
              rows={2}
              value={emailBody}
              onChange={(e) => {
                setEmailBody(e.target.value);
                buildAndEmitEmail(emailTo, emailSubject, e.target.value);
              }}
              placeholder="Optional pre-filled message body..."
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none resize-none font-normal"
            />
          </div>

          {/* Helper hint & Quick Subject Presets */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Scanners will immediately draft an email to this address.
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_EMAIL_SUBJECTS.slice(0, 3).map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setEmailSubject(sub);
                    buildAndEmitEmail(emailTo || 'hello@example.com', sub, emailBody);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/40"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: PHONE & SMS SHARING ----------------- */}
      {activeTab === 'phone' && (
        <div id="phone-share-panel" className="space-y-2.5 animate-in fade-in duration-150">
          {/* Sub-modes: Direct Call vs SMS vs WhatsApp */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => {
                setPhoneMode('call');
                buildAndEmitPhone('call', phoneNumber || '+1234567890', phoneMessage);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                phoneMode === 'call'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Direct Call</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPhoneMode('sms');
                buildAndEmitPhone('sms', phoneNumber || '+1234567890', phoneMessage);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                phoneMode === 'sms'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SMS Text</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPhoneMode('whatsapp');
                buildAndEmitPhone('whatsapp', phoneNumber || '+1234567890', phoneMessage);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                phoneMode === 'whatsapp'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Phone Number Input */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30">
            <Phone className="w-4 h-4 text-emerald-500 mr-2.5 shrink-0" />
            <input
              id="qr-phone-number-input"
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                buildAndEmitPhone(phoneMode, e.target.value, phoneMessage);
              }}
              placeholder="Phone number with country code (e.g. +1 555 123 4567)"
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none font-medium font-mono"
            />
          </div>

          {/* Optional pre-filled SMS/WhatsApp text */}
          {(phoneMode === 'sms' || phoneMode === 'whatsapp') && (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30">
              <textarea
                id="qr-phone-message-input"
                rows={2}
                value={phoneMessage}
                onChange={(e) => {
                  setPhoneMessage(e.target.value);
                  buildAndEmitPhone(phoneMode, phoneNumber, e.target.value);
                }}
                placeholder="Optional pre-filled message text..."
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none resize-none font-normal"
              />
            </div>
          )}

          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {phoneMode === 'call' && 'When scanned, prompts mobile device to call this phone number.'}
            {phoneMode === 'sms' && 'When scanned, opens SMS messaging app with pre-filled message.'}
            {phoneMode === 'whatsapp' && 'When scanned, immediately opens a direct WhatsApp conversation.'}
          </div>
        </div>
      )}

      {/* ----------------- TAB 4: INSTAGRAM SHARING ----------------- */}
      {activeTab === 'instagram' && (
        <div id="instagram-share-panel" className="space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-500/30">
            <Instagram className="w-4 h-4 text-pink-500 mr-2.5 shrink-0" />
            <span className="text-sm font-semibold text-slate-400 mr-1 shrink-0">@</span>
            <input
              id="qr-instagram-handle-input"
              type="text"
              value={instaHandle}
              onChange={(e) => {
                setInstaHandle(e.target.value);
                buildAndEmitInsta(e.target.value);
              }}
              placeholder="Instagram handle or link (e.g. gauravratnu)"
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none font-medium"
              autoComplete="off"
              spellCheck="false"
            />

            {instaHandle && (
              <a
                id="test-instagram-profile-link"
                href={`https://www.instagram.com/${instaHandle.replace(/^@/, '')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-md text-pink-500 hover:bg-pink-500/10 transition-colors ml-1"
                title="Preview profile on Instagram"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Quick Presets & Explanation */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Generates canonical profile link: <code className="font-mono text-pink-600 dark:text-pink-400">instagram.com/{instaHandle || 'username'}</code>
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Try:</span>
              {PRESET_INSTA_HANDLES.map((handle) => (
                <button
                  key={handle}
                  type="button"
                  onClick={() => {
                    setInstaHandle(handle);
                    buildAndEmitInsta(handle);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-pink-500/40"
                >
                  @{handle}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
