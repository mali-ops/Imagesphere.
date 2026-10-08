import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PricingSection } from './PricingSection';
import { ReviewsSection } from './ReviewsSection';
import { Footer } from './Footer';
import {
  UploadCloud,
  Share2,
  Lock,
  BarChart3,
  FolderSync,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  ExternalLink,
  Code,
  Image as ImageIcon,
  Check,
  FileCheck,
  Link as LinkIcon,
  Loader2,
  ClipboardPaste,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo, currentUser, uploadSingleImage, addToast, images, systemSettings } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [quickUploadPreview, setQuickUploadPreview] = useState<{
    file: File;
    previewUrl: string;
    uploadedItem?: any;
    isUploading?: boolean;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quickUrlInput, setQuickUrlInput] = useState('');
  const [isFetchingQuickUrl, setIsFetchingQuickUrl] = useState(false);

  const fetchQuickImageFromUrl = async (urlToFetch: string) => {
    const trimmed = urlToFetch.trim();
    if (!trimmed) {
      addToast('Invalid URL', 'Please enter a valid image URL.', 'error');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      addToast('Invalid URL', 'Image link must start with http:// or https://', 'error');
      return;
    }

    setIsFetchingQuickUrl(true);
    try {
      const res = await fetch('/api/images/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch image from link');
      }

      // Convert base64 dataUri to a standard File object
      const arr = data.dataUri.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const file = new File([u8arr], data.fileName || 'image_from_link.jpg', { type: mime });
      setQuickUrlInput('');
      processFile(file);
    } catch (err: any) {
      addToast('Could Not Load Link', err.message || 'Error importing image URL', 'error');
    } finally {
      setIsFetchingQuickUrl(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setQuickUploadPreview({ file, previewUrl, isUploading: true });

    try {
      const item = await uploadSingleImage(file, {
        title: file.name.replace(/\.[^/.]+$/, ''),
        tags: ['quick-upload'],
        visibility: 'public',
      });
      setQuickUploadPreview({ file, previewUrl, uploadedItem: item, isUploading: false });
      addToast(
        'Upload Complete',
        currentUser
          ? 'Your image is hosted and saved to your library!'
          : 'Your image is hosted and ready to share!',
        'success'
      );
    } catch (err: any) {
      setQuickUploadPreview(null);
      addToast('Upload Failed', err.message || 'Error uploading file', 'error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Fast Upload',
      description: 'Ultra-low latency uploads with instant WebP compression and global thumbnail generation.',
    },
    {
      icon: Lock,
      title: 'Secure Storage',
      description: 'Encrypted storage with fine-grained Row Level Security and isolated cloud infrastructure.',
    },
    {
      icon: Share2,
      title: 'Shareable Links',
      description: 'Instantly generate direct image URLs, Markdown syntax, BBCode, and responsive HTML embeds.',
    },
    {
      icon: BarChart3,
      title: 'Image Analytics',
      description: 'Track real-time image views, downloads, referral sources, and bandwidth statistics.',
    },
    {
      icon: FolderSync,
      title: 'Image Management',
      description: 'Sort into custom color-coded folders, search by tags, batch move, and rename seamlessly.',
    },
    {
      icon: ShieldCheck,
      title: 'Privacy Controls',
      description: 'Toggle between Public, Unlisted, or completely Private visibility anytime with one click.',
    },
    {
      icon: Globe,
      title: 'Responsive Dashboard',
      description: 'Adaptive design crafted for desktops, tablets, and phones with light and dark theme support.',
    },
    {
      icon: Sparkles,
      title: 'Free Community Tier',
      description: '500 MB high-speed cloud storage and unlimited link copies with zero hidden subscription fees.',
    },
  ];

  const useCases = [
    { label: 'Bloggers', desc: 'Embed clean responsive images in Ghost, Medium, and WordPress blogs.' },
    { label: 'Developers', desc: 'Host README documentation screenshots and API assets with direct links.' },
    { label: 'Students', desc: 'Organize research diagrams, class presentation slides, and notes.' },
    { label: 'Designers', desc: 'Share visual mockups, UI concepts, and design moodboards with clients.' },
    { label: 'Marketing Teams', desc: 'Distribute brand guidelines, advertising banners, and promotional cards.' },
    { label: 'Content Creators', desc: 'Deliver high-resolution photo packages and social media thumbnails.' },
    { label: 'Businesses', desc: 'Store e-commerce product imagery and customer support screenshots.' },
    { label: 'Freelancers', desc: 'Send proof-of-work previews with download tracking and unlisted privacy.' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/90 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-bold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{systemSettings?.hero_badge || '⚡ Modern High-Speed Cloud Image Hosting'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              {systemSettings?.hero_title || 'Upload. Share. Manage Your Images.'}
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Start with the <strong className="text-blue-600 dark:text-blue-400">Community Free Plan (500 MB)</strong> or upgrade to <strong className="text-indigo-600 dark:text-indigo-400">Prime (15 GB)</strong> and <strong className="text-purple-600 dark:text-purple-400">Pro (50 GB)</strong>. Direct CDN embed links, WebP compression, and zero ad banners.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                id="hero-create-account-btn"
                onClick={() => navigateTo('signup')}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-upload-btn"
                onClick={() => {
                  if (currentUser) {
                    navigateTo('dashboard-upload');
                  } else {
                    const el = document.getElementById('quick-upload-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
              >
                <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{systemSettings?.hero_cta_primary || 'Quick Upload'}</span>
              </button>
            </div>

            {/* Micro badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 500 MB Free Community Plan
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Global High-Speed CDN
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Permanent Direct Embed Codes
              </span>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden p-2 sm:p-4">
            <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">imgsphere.io/dashboard</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[11px] font-medium">
                <span className="text-emerald-500 font-semibold">● CDN Online</span>
                <span>Storage: 245 MB / 1024 MB</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3">
              {images.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigateTo('public-image', { imageId: item.id })}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 cursor-pointer"
                >
                  <img
                    src={item.thumbnail_url || item.storage_url}
                    alt={item.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <span className="text-white text-xs font-semibold truncate">{item.title}</span>
                    <span className="text-slate-300 text-[10px]">{item.views} views • {(item.file_size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PLANS & CLOUD ARCHITECTURE SECTION */}
      <section className="py-14 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Simple & Transparent Tiers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Three Flexible Plans Tailored For You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              From casual personal hosting to high-volume creator media delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <span>Community Plan</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  500 MB Free
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Enjoy 500 MB permanent cloud storage forever. Direct shareable URLs, WebP compression, and CDN links included at $0 cost.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <span>Prime Plan</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  15 GB • $4.99/mo
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                15 GB high-speed cloud storage with 35 MB max file sizes. Ideal for digital creators, portfolio designers, and active bloggers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                <span>Pro Creator</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  50 GB • $9.99/mo
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                50 GB ultra storage with 100 MB max single uploads, dedicated CDN edge routing, custom link domains, and priority bandwidth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK UPLOAD SECTION */}
      <section
        id="quick-upload-section"
        className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Quick Upload
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Try the upload interface directly. Drag an image below to test.
            </p>
          </div>

          {/* Interactive Drop Area */}
          <div
            id="quick-dropzone"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center bg-white dark:bg-slate-900 ${
              dragActive
                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Drag & Drop Your Images Here
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              ⚡ Drop or select any image — it uploads and generates hosted links automatically!
            </p>

            <button
              type="button"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Browse Images (Auto-Uploads Instantly)</span>
            </button>

            {/* Supported formats & max size banner */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Supported formats:
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">JPG</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">JPEG</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">PNG</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">WEBP</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">GIF</span>
              <span className="text-slate-400">•</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Maximum image size: 10 MB
              </span>
            </div>
          </div>

          {/* Quick Paste Link Input for Mobile & Desktop */}
          <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchQuickImageFromUrl(quickUrlInput);
              }}
              className="flex flex-col sm:flex-row items-center gap-2.5"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                <LinkIcon className="w-4 h-4 text-purple-600" />
                <span>Paste Link:</span>
              </div>
              <input
                type="url"
                value={quickUrlInput}
                onChange={(e) => setQuickUrlInput(e.target.value)}
                placeholder="Paste any web image URL (e.g. https://...)..."
                className="flex-1 w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!quickUrlInput.trim() || isFetchingQuickUrl}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                {isFetchingQuickUrl ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Upload Active Preview Card */}
          {quickUploadPreview && (
            <div className="mt-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={quickUploadPreview.previewUrl}
                  alt="Preview"
                  className="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {quickUploadPreview.file.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      ({(quickUploadPreview.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {currentUser
                      ? 'Image hosted successfully in your personal library.'
                      : 'Preview generated in browser memory. Sign in to permanently save to cloud.'}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {currentUser && quickUploadPreview.uploadedItem ? (
                      <>
                        <button
                          onClick={() =>
                            navigateTo('dashboard-image-detail', {
                              imageId: quickUploadPreview.uploadedItem.id,
                            })
                          }
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                        >
                          View in Dashboard
                        </button>
                        <button
                          onClick={() =>
                            navigateTo('public-image', {
                              imageId: quickUploadPreview.uploadedItem.id,
                            })
                          }
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg"
                        >
                          Public Page
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigateTo('signup')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                      >
                        <span>Create Free Account to Save</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
              Everything You Need to Host & Share
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-base">
              Engineered with modern cloud storage standards, responsive performance, and privacy-first controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-base">
              Share images across the web in 3 simple, friction-free steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-md shadow-blue-600/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Upload Your Image
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Drag and drop your JPG, PNG, WebP, or GIF. Apply custom titles, tags, and choose your preferred privacy setting.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-md shadow-indigo-600/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Get Your Link
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We generate instant direct image links, clean public sharing pages, HTML codes, and Markdown for blogs and GitHub.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-md shadow-emerald-600/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Share Anywhere
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste on forums, Discord, documentation, social media, or email. Track views and downloads directly from your analytics panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT SECTION (MANAGED VIA CMS) */}
      <section id="about" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>About {systemSettings?.site_name || 'ImgSphere'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {systemSettings?.about_heading || 'Crafted for Fast, Reliable Cloud Media Hosting'}
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                {systemSettings?.about_description ||
                  'ImgSphere was built from the ground up to solve the friction of sharing images across blogs, apps, GitHub repositories, and forums. With integrated CDN caching and automated WebP generation, your images render blazing fast anywhere on the globe.'}
              </p>

              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={() => navigateTo('signup')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>Start Hosting Today</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateTo('help')}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                >
                  Explore Documentation
                </button>
              </div>
            </div>

            {/* Key Metric Badges configured via CMS */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-blue-600/20 shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {systemSettings?.about_stat_1_val || '99.9%'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {systemSettings?.about_stat_1_label || 'Uptime Guarantee'}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-indigo-600/20 shrink-0">
                  🚀
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {systemSettings?.about_stat_2_val || '< 50ms'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {systemSettings?.about_stat_2_label || 'Global CDN Latency'}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-emerald-600/20 shrink-0">
                  🛡️
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {systemSettings?.about_stat_3_val || '100%'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {systemSettings?.about_stat_3_label || 'Privacy Protected & Encrypted'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. USE CASES SECTION */}
      <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
              Built for Modern Creators & Teams
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-base">
              Reliable image infrastructure trusted across diverse workflows.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {useCases.map((uc, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs mb-3">
                  {i + 1}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {uc.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {uc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. REVIEWS & TESTIMONIALS (AUTO-ANIMATED SCROLLING) */}
      <ReviewsSection />

      {/* 7. PRICING SECTION */}
      <PricingSection id="pricing" />

      {/* 7. CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Hosting Your Images Today
          </h2>
          <p className="mt-4 text-lg text-blue-100 max-w-xl mx-auto">
            Join developers, creators, and teams hosting fast, reliable images with zero upfront commitments.
          </p>
          <div className="mt-8">
            <button
              id="cta-create-account-btn"
              onClick={() => navigateTo('signup')}
              className="px-8 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
