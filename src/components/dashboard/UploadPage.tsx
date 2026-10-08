import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CopyButton } from '../ui/CopyButton';
import { getBrandedDirectUrl } from '../../utils/imageUrls';
import {
  UploadCloud,
  X,
  FileImage,
  FolderOpen,
  Lock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Code,
  ArrowRight,
  RefreshCw,
  Plus,
  ExternalLink,
  Link as LinkIcon,
  ClipboardPaste,
  Smartphone,
  Loader2,
  Zap,
} from 'lucide-react';
import { ImageItem, ImageVisibility } from '../../types';
import {
  formatBytes,
  quickEstimateCompression,
  isCompressibleImage,
} from '../../utils/imageCompression';

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  tags: string;
  folderId?: string;
  visibility: ImageVisibility;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  uploadedItem?: ImageItem;
  errorMessage?: string;
  estimatedSavingsPercent?: number;
  estimatedCompressedSize?: number;
}

export const UploadPage: React.FC = () => {
  const {
    currentUser,
    folders,
    uploadSingleImage,
    navigateTo,
    addToast,
    storageProvider,
  } = useApp();

  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [globalVisibility, setGlobalVisibility] = useState<ImageVisibility>('public');
  const [globalFolderId, setGlobalFolderId] = useState<string>('');
  const [isUploadingAll, setIsUploadingAll] = useState(false);
  const [lastUploadedBatch, setLastUploadedBatch] = useState<ImageItem[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileMb = currentUser?.plan === 'pro' ? 100 : currentUser?.plan === 'prime' ? 35 : 10;
  const MAX_FILE_SIZE = maxFileMb * 1024 * 1024;
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ];

  // Global paste handler (works on mobile and laptop clipboard paste)
  useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      // Don't intercept paste if user is typing into text inputs/textareas
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.clipboardData) {
        // 1. Check for pasted image files directly from clipboard
        const files: File[] = [];
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              const file = new File([blob], `pasted_image_${Date.now()}.png`, {
                type: blob.type || 'image/png',
              });
              files.push(file);
            }
          }
        }

        if (files.length > 0) {
          e.preventDefault();
          addFilesToQueue(files);
          addToast('Image Pasted', 'Image from clipboard added to queue!', 'success');
          return;
        }

        // 2. Check for pasted text that is an image URL
        const pastedText = e.clipboardData.getData('text');
        if (
          pastedText &&
          (pastedText.startsWith('http://') || pastedText.startsWith('https://'))
        ) {
          e.preventDefault();
          fetchImageFromUrl(pastedText.trim());
        }
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [queue]);

  // Convert base64 dataUri to a standard File object
  const dataUriToFile = (dataUri: string, filename: string): File => {
    const arr = dataUri.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Fetch image from URL (resolves CORS and works seamlessly on mobile devices)
  const fetchImageFromUrl = async (urlToFetch: string) => {
    const trimmed = urlToFetch.trim();
    if (!trimmed) {
      addToast('Invalid URL', 'Please enter or paste a valid web image URL.', 'error');
      return;
    }

    // 1. Direct Base64 Data URI handling (instant)
    if (trimmed.startsWith('data:image/')) {
      try {
        const file = dataUriToFile(trimmed, `pasted_image_${Date.now()}.png`);
        addFilesToQueue([file]);
        setImageUrlInput('');
        addToast('Image Imported', 'Pasted image data added to queue!', 'success');
        return;
      } catch (err: any) {
        addToast('Invalid Data', 'Could not process pasted image data.', 'error');
        return;
      }
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      addToast('Invalid URL', 'Image link must start with http:// or https://', 'error');
      return;
    }

    setIsFetchingUrl(true);
    try {
      // Step A: Server proxy fetch (SSRF protected, unwraps webpages, bypasses CORS)
      const res = await fetch('/api/images/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.dataUri) {
        const file = dataUriToFile(data.dataUri, data.fileName || 'image_from_link.jpg');
        addFilesToQueue([file]);
        setImageUrlInput('');
        addToast('Image Imported', `Successfully imported ${data.fileName} from link!`, 'success');
        return;
      }

      // Step B: Direct client-side fetch fallback (for CORS-enabled image CDNs)
      try {
        const clientRes = await fetch(trimmed, { mode: 'cors' });
        if (clientRes.ok) {
          const blob = await clientRes.blob();
          if (blob.type.startsWith('image/')) {
            const ext = blob.type.split('/')[1]?.replace('+xml', '') || 'jpg';
            const file = new File([blob], `imported_image_${Date.now()}.${ext}`, { type: blob.type });
            addFilesToQueue([file]);
            setImageUrlInput('');
            addToast('Image Imported', 'Image fetched directly into queue!', 'success');
            return;
          }
        }
      } catch {
        // client fetch failed as well, throw server error
      }

      throw new Error(data.error || 'Failed to fetch image from URL');
    } catch (err: any) {
      console.error('URL Fetch Error:', err);
      addToast(
        'Could Not Load Image Link',
        err.message || 'Make sure the link points to a public image or image webpage.',
        'error'
      );
    } finally {
      setIsFetchingUrl(false);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
    }
  };

  const addFilesToQueue = (files: File[]) => {
    if (queue.length + files.length > 10) {
      addToast('Limit Reached', 'Maximum 10 files can be queued simultaneously.', 'error');
      return;
    }

    const currentUsed = currentUser?.storage_used || 0;
    const limit = currentUser?.storage_limit || (currentUser?.plan === 'pro' ? 50 * 1024 * 1024 * 1024 : currentUser?.plan === 'prime' ? 15 * 1024 * 1024 * 1024 : 500 * 1024 * 1024);
    let newBatchBytes = 0;

    const newQueued: QueuedFile[] = [];

    for (const file of files) {
      // Validate MIME
      if (!ALLOWED_TYPES.includes(file.type)) {
        addToast(
          'Invalid Format',
          `${file.name} is not a supported image format (JPG, PNG, WebP, GIF only).`,
          'error'
        );
        continue;
      }

      // Validate Size
      if (file.size > MAX_FILE_SIZE) {
        addToast(
          'File Too Large',
          `${file.name} exceeds ${maxFileMb} MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
          'error'
        );
        continue;
      }

      newBatchBytes += file.size;
      if (currentUsed + newBatchBytes > limit) {
        const quotaLabel = currentUser?.plan === 'pro' ? '50 GB' : currentUser?.plan === 'prime' ? '15 GB' : '500 MB';
        addToast(
          'Storage Quota Exceeded',
          `Uploading this batch would exceed your ${quotaLabel} storage limit.`,
          'error'
        );
        break;
      }

      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      const isEligible = isCompressibleImage(file);
      const est = isEligible ? quickEstimateCompression(file.size, file.type) : null;

      newQueued.push({
        id,
        file,
        previewUrl,
        title,
        description: '',
        tags: '',
        folderId: globalFolderId || undefined,
        visibility: globalVisibility,
        status: 'pending',
        progress: 0,
        estimatedSavingsPercent: est?.estimatedSavingsPercent,
        estimatedCompressedSize: est?.estimatedSize,
      });
    }

    setQueue((prev) => [...prev, ...newQueued]);

    // Auto-upload immediately without requiring user to click any button
    setIsUploadingAll(true);
    (async () => {
      for (const item of newQueued) {
        await uploadSingleQueuedFile(item);
      }
      setIsUploadingAll(false);
    })();
  };

  const removeQueuedFile = (id: string) => {
    setQueue((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateQueuedFile = (id: string, updates: Partial<QueuedFile>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Upload an individual queued file automatically with animated progress
  const uploadSingleQueuedFile = async (item: QueuedFile) => {
    updateQueuedFile(item.id, { status: 'uploading', progress: 25 });

    try {
      await new Promise((r) => setTimeout(r, 150));
      updateQueuedFile(item.id, { progress: 70 });

      const tagsArray = item.tags
        ? item.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const uploaded = await uploadSingleImage(item.file, {
        title: item.title,
        description: item.description,
        tags: tagsArray,
        folder_id: item.folderId,
        visibility: item.visibility,
      });

      updateQueuedFile(item.id, {
        status: 'completed',
        progress: 100,
        uploadedItem: uploaded,
      });

      setLastUploadedBatch((prev) => [uploaded, ...prev.filter((p) => p.id !== uploaded.id)]);
      addToast(
        'Upload Complete',
        `"${uploaded.title}" auto-uploaded & ready to share!`,
        'success'
      );
      return uploaded;
    } catch (err: any) {
      console.error('Failed upload', err);
      updateQueuedFile(item.id, {
        status: 'error',
        errorMessage: err.message || 'Upload failed',
      });
      addToast('Upload Failed', err.message || 'Could not upload image', 'error');
      return null;
    }
  };

  // Upload any pending queued files (e.g. for retry)
  const uploadAll = async () => {
    if (queue.length === 0 || isUploadingAll) return;
    setIsUploadingAll(true);

    for (const item of queue) {
      if (item.status === 'completed') continue;
      await uploadSingleQueuedFile(item);
    }

    setIsUploadingAll(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Upload Images
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {storageProvider === 'supabase' ? '⚡ Supabase Storage' : `${storageProvider} Storage`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload up to 10 images at once. Supports JPG, PNG, WebP, and GIF up to 10 MB each.
          </p>
        </div>

        {queue.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {isUploadingAll ? (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-xl border border-blue-200/80 dark:border-blue-800">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auto-Uploading ({queue.filter(q => q.status === 'uploading' || q.status === 'pending').length} active)...</span>
              </div>
            ) : queue.some(q => q.status === 'error') ? (
              <button
                onClick={uploadAll}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Failed</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auto-Upload Completed</span>
              </div>
            )}
            <button
              onClick={() => setQueue([])}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Clear
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Select More</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Defaults Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Default Privacy:
            </span>
            <select
              value={globalVisibility}
              onChange={(e) => {
                const val = e.target.value as ImageVisibility;
                setGlobalVisibility(val);
                setQueue((prev) => prev.map((item) => ({ ...item, visibility: val })));
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
            >
              <option value="public">Public (Everyone)</option>
              <option value="unlisted">Unlisted (Link Only)</option>
              <option value="private">Private (Only You)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Default Folder:
            </span>
            <select
              value={globalFolderId}
              onChange={(e) => {
                const val = e.target.value;
                setGlobalFolderId(val);
                setQueue((prev) => prev.map((item) => ({ ...item, folderId: val || undefined })));
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
            >
              <option value="">No Folder (Root)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-medium">
          {currentUser?.plan === 'pro' ? 'Pro Plan: 100 MB per file max' : currentUser?.plan === 'prime' ? 'Prime Plan: 35 MB per file max' : 'Community Plan: 10 MB per file max'}
        </span>
      </div>

      {/* Auto-Compression Pipeline Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Auto-Compression Pipeline Active
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                WebP • 82% Quality • Max 2560px
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Automatically optimizes and compresses images before cloud storage to reduce bandwidth, cut storage usage by ~60–80%, and optimize load times.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optimal Storage Active</span>
          </span>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        id="dashboard-dropzone"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-10 sm:p-14 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center bg-white dark:bg-slate-900 ${
          dragActive
            ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Drag & Drop Images Here
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-md mx-auto">
          ⚡ <strong className="text-blue-600 dark:text-blue-400 font-semibold">Auto-Upload Active:</strong> Drop or select images and they will automatically upload immediately without clicking any button!
        </p>

        <button
          type="button"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Select Images (Auto-Uploads Instantly)</span>
        </button>
      </div>

      {/* Mobile & Desktop Paste Image Link / URL Importer */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Paste Image Link (موبائل یا لیپ ٹاپ سے لنک پیسٹ کریں)</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                  <Smartphone className="w-3 h-3" /> Mobile Friendly
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct image URLs (Unsplash, Pinterest, CDN) paste karein — mobile aur desktop dono per turant fetch ho kar queue me shamil ho jayegi.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchImageFromUrl(imageUrlInput);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1"
        >
          <div className="relative flex-1">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg ya image link yahan paste karein..."
              className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
            {imageUrlInput && (
              <button
                type="button"
                onClick={() => setImageUrlInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  if (navigator.clipboard && navigator.clipboard.readText) {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      setImageUrlInput(text);
                      fetchImageFromUrl(text);
                    } else {
                      addToast('Clipboard Empty', 'No text found in clipboard.', 'info');
                    }
                  } else {
                    addToast('Clipboard Info', 'Long press inside the input box to paste on mobile.', 'info');
                  }
                } catch {
                  addToast('Clipboard Permission', 'Please tap and paste directly into the box.', 'info');
                }
              }}
              className="flex-1 sm:flex-initial px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <ClipboardPaste className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Paste Clipboard</span>
            </button>

            <button
              type="submit"
              disabled={!imageUrlInput.trim() || isFetchingUrl}
              className="flex-1 sm:flex-initial px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              {isFetchingUrl ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Import Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Queue Items List */}
      {queue.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Upload Queue ({queue.length})</span>
            <span className="text-xs font-normal text-slate-500">
              Customize metadata before uploading
            </span>
          </h3>

          <div className="space-y-3">
            {queue.map((item, idx) => (
              <div
                key={`up-queue-${item.id || idx}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                {/* Thumbnail */}
                <img
                  src={item.previewUrl}
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />

                {/* Form fields */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      disabled={item.status === 'uploading' || item.status === 'completed'}
                      onChange={(e) => updateQueuedFile(item.id, { title: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="nature, travel, wallpaper"
                      value={item.tags}
                      disabled={item.status === 'uploading' || item.status === 'completed'}
                      onChange={(e) => updateQueuedFile(item.id, { tags: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Privacy
                      </label>
                      <select
                        value={item.visibility}
                        disabled={item.status === 'uploading' || item.status === 'completed'}
                        onChange={(e) =>
                          updateQueuedFile(item.id, {
                            visibility: e.target.value as ImageVisibility,
                          })
                        }
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Folder
                      </label>
                      <select
                        value={item.folderId || ''}
                        disabled={item.status === 'uploading' || item.status === 'completed'}
                        onChange={(e) =>
                          updateQueuedFile(item.id, { folderId: e.target.value || undefined })
                        }
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="">Root</option>
                        {folders.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Progress / Actions */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                      {formatBytes(item.file.size)}
                    </span>
                    {item.status === 'pending' && item.estimatedSavingsPercent !== undefined && item.estimatedSavingsPercent > 0 && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block">
                        est. ~{formatBytes(item.estimatedCompressedSize || 0)} (-{item.estimatedSavingsPercent}%)
                      </span>
                    )}
                    {item.status === 'completed' && item.uploadedItem && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                        {item.uploadedItem.was_compressed
                          ? `⚡ ${formatBytes(item.uploadedItem.file_size)} (-${item.uploadedItem.compression_ratio}% saved)`
                          : `${formatBytes(item.uploadedItem.file_size)} (original)`}
                      </span>
                    )}
                  </div>

                  {item.status === 'pending' && (
                    <button
                      onClick={() => removeQueuedFile(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remove from queue"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {item.status === 'uploading' && (
                    <div className="w-28 text-right">
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-blue-500 font-medium">Compressing & Uploading</span>
                    </div>
                  )}

                  {item.status === 'completed' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ready</span>
                    </span>
                  )}

                  {item.status === 'error' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-rose-500 font-medium bg-rose-50 dark:bg-rose-950/50 px-2 py-1 rounded-lg">
                        Failed
                      </span>
                      <button
                        onClick={() => uploadSingleQueuedFile(item)}
                        className="px-2 py-1 text-[11px] font-semibold bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-800 text-rose-700 dark:text-rose-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Retry upload"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post-Upload Success Screen with Embed Codes */}
      {lastUploadedBatch.length > 0 && (
        <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-lg font-bold">
                  Upload Batch Completed!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lastUploadedBatch.length} images are live on the cloud CDN. Use the embed codes below.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('dashboard-images')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <span>Go to Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lastUploadedBatch.map((img, idx) => (
              <div
                key={`up-batch-${img.id || idx}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={img.thumbnail_url || img.storage_url}
                    alt={img.title}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {img.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {img.width}×{img.height} • {(img.file_size / 1024 / 1024).toFixed(2)} MB
                      {img.was_compressed && (
                        <span className="ml-1.5 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-[10px]">
                          ⚡ -{img.compression_ratio}% saved
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('dashboard-image-detail', { imageId: img.id })}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                    title="Open Image Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                {/* Direct Link */}
                <div className="flex items-center justify-between text-xs font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="truncate mr-2 text-slate-600 dark:text-slate-300">
                    {getBrandedDirectUrl(img)}
                  </span>
                  <CopyButton textToCopy={getBrandedDirectUrl(img)} size="sm" variant="secondary" label="Direct" />
                </div>

                {/* Markdown */}
                <div className="flex items-center justify-between text-xs font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="truncate mr-2 text-slate-600 dark:text-slate-300">
                    ![{img.title}]({getBrandedDirectUrl(img)})
                  </span>
                  <CopyButton
                    textToCopy={`![${img.title}](${getBrandedDirectUrl(img)})`}
                    size="sm"
                    variant="ghost"
                    label="Markdown"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
