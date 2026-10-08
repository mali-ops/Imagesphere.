import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  UploadCloud,
  Share2,
  Lock,
  Database,
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';

export const HelpCenter: React.FC = () => {
  const { navigateTo } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const sections = [
    {
      icon: UploadCloud,
      title: 'How to Upload',
      content:
        'You can drag and drop JPG, PNG, WebP, or GIF files directly into the upload area or click "Browse Files". Each file can be up to 10 MB. Before uploading, you can customize the image title, description, tags, target folder, and privacy status.',
    },
    {
      icon: Share2,
      title: 'How to Share Links',
      content:
        'Once uploaded, you receive 4 formats: Direct Image Link (raw image CDN URL), Page Link (clean viewing page), HTML code (for websites), and Markdown syntax (for GitHub, Notion, Reddit, or technical blogs). Simply click "Copy" next to any format.',
    },
    {
      icon: Lock,
      title: 'Image Privacy Levels',
      content:
        '• Public: Indexed and accessible to anyone via direct link or browse.\n• Unlisted: Hidden from public search/galleries, only accessible to people who have the secret direct URL.\n• Private: Only visible when logged into the uploader account.',
    },
    {
      icon: Database,
      title: 'Storage Quotas & Limits',
      content:
        'Free tier accounts receive 500 MB of high-speed cloud storage. You can monitor your real-time storage bar in the dashboard. If you reach 100%, delete unused images to restore upload capability or upgrade to Prime (15 GB) or Pro (50 GB).',
    },
    {
      icon: Shield,
      title: 'Account & Content Security',
      content:
        'All images are scanned for approved MIME types. We strictly prohibit malware, copyright infringement, phishing, or abusive media. Any user can flag an image for admin moderation review via the "Report Image" button.',
    },
  ];

  const faqs = [
    {
      q: 'Is ImgSphere really free?',
      a: 'Yes! Our Community Free Plan gives you 500 MB cloud storage, 10 MB maximum image file size, unlimited link copies, and real-time view tracking at zero financial cost.',
    },
    {
      q: 'Will my images ever expire or get automatically deleted?',
      a: 'No, your images do not expire as long as your account is active and adheres to the acceptable use policy.',
    },
    {
      q: 'Can I upload animated GIFs and modern WebP files?',
      a: 'Yes, full animated GIF loop playback and modern WebP high-efficiency formats are natively supported with instant thumbnail generation.',
    },
    {
      q: 'How does view and download analytics tracking work?',
      a: 'Every time a user visits your public image link or downloads the asset, an event is logged in your personal analytics dashboard. We use privacy-friendly deduplication to prevent spamming view counts.',
    },
    {
      q: 'Can I delete my account or bulk delete images?',
      a: 'Yes, head to Dashboard > Settings > Security & Account to manage your account or delete it permanently along with all stored media.',
    },
  ];

  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Help Center & Documentation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Learn how to upload, manage privacy, generate embed codes, and configure your image library.
        </p>

        {/* Search bar */}
        <div className="mt-6 relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, topics, and questions..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Guide Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {filteredSections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {sec.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Still need help CTA */}
      <div className="p-8 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-center max-w-2xl mx-auto">
        <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Have additional questions?
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">
          Our team is available to assist with API keys, custom CNAME domains, and enterprise inquiries.
        </p>
        <button
          onClick={() => navigateTo('contact')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
        >
          Contact Support Team
        </button>
      </div>
    </div>
  );
};
