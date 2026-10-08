import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CopyButton } from '../ui/CopyButton';
import { getBrandedDirectUrl, getBrandedShareUrl } from '../../utils/imageUrls';
import {
  Download,
  Eye,
  Calendar,
  User as UserIcon,
  Flag,
  Share2,
  Code,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';
import { ReportReason, ImageItem } from '../../types';

export const PublicImagePage: React.FC = () => {
  const {
    routeParams,
    images,
    trackImageView,
    downloadImage,
    submitReport,
    navigateTo,
    addToast,
    systemSettings,
  } = useApp();

  const imageId = routeParams.imageId;
  const imageSlug = routeParams.slug;
  const fetchedImageParam = routeParams.fetchedImage as ImageItem | undefined;

  const [remoteImage, setRemoteImage] = useState<ImageItem | null>(fetchedImageParam || null);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);

  const localImage = images.find(
    (img) => img.id === imageId || (imageSlug && img.public_slug === imageSlug)
  );

  const image = localImage || remoteImage;

  // If not found in local list, attempt to fetch from backend API
  useEffect(() => {
    if (!localImage && !remoteImage && (imageId || imageSlug)) {
      const identifier = imageId || imageSlug;
      setIsSearchingRemote(true);
      fetch(`/api/db/images/lookup/${encodeURIComponent(identifier)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.image) {
            const fetched = data.image;
            setRemoteImage({
              id: fetched.id,
              user_id: fetched.userId || fetched.user_id || 'system',
              uploader_name: fetched.uploader_name || 'ImgSphere Creator',
              title: fetched.title || 'Image',
              description: fetched.description || '',
              file_name: fetched.title ? `${fetched.title}.jpg` : 'image.jpg',
              original_name: fetched.title ? `${fetched.title}.jpg` : 'image.jpg',
              storage_url: fetched.storageUrl || fetched.storage_url,
              thumbnail_url: fetched.thumbnailUrl || fetched.thumbnail_url || fetched.storageUrl || fetched.storage_url,
              file_size: fetched.size || fetched.file_size || 500000,
              mime_type: fetched.mimeType || fetched.mime_type || 'image/jpeg',
              width: fetched.width || 1200,
              height: fetched.height || 800,
              visibility: fetched.visibility || 'public',
              views: fetched.views || 1,
              downloads: fetched.downloads || 0,
              tags: Array.isArray(fetched.tags) ? fetched.tags : [],
              public_slug: fetched.slug || fetched.public_slug || identifier,
              created_at: fetched.createdAt || fetched.created_at || new Date().toISOString(),
              updated_at: fetched.updatedAt || fetched.updated_at || new Date().toISOString(),
            });
          }
        })
        .finally(() => {
          setIsSearchingRemote(false);
        });
    }
  }, [localImage, remoteImage, imageId, imageSlug]);

  // Track view on load
  useEffect(() => {
    if (image) {
      trackImageView(image.id);
    }
  }, [image?.id]);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('Inappropriate Content');
  const [reportDescription, setReportDescription] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');

  if (isSearchingRemote) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Loading image...
        </p>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Image Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          The image you are looking for does not exist, has been deleted, or is set to private visibility.
        </p>
        <button
          onClick={() => navigateTo('home')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
        >
          Return Home
        </button>
      </div>
    );
  }

  const shareUrl = getBrandedShareUrl(image, systemSettings?.site_name);
  const directUrl = getBrandedDirectUrl(image, systemSettings?.site_name);
  const htmlEmbed = `<img src="${directUrl}" alt="${image.title}" />`;
  const markdownEmbed = `![${image.title}](${directUrl})`;
  const bbcodeEmbed = `[img]${directUrl}[/img]`;

  const handleDownload = () => {
    downloadImage(image);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterEmail.trim() || !reportDescription.trim()) {
      addToast('Validation Error', 'Please complete email and reason description', 'error');
      return;
    }
    submitReport(image.id, reportReason, reportDescription, reporterEmail);
    setReportModalOpen(false);
    setReportDescription('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb / Return */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore ImgSphere</span>
        </button>

        <button
          onClick={() => setReportModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report Image</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Image Stage */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center p-2 sm:p-4 min-h-[400px]">
            <img
              src={image.storage_url}
              alt={image.title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-md"
            />
          </div>

          {/* Title & Description Info */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {image.title}
            </h1>
            {image.description && (
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {image.description}
              </p>
            )}

            {image.tags && image.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {image.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info & Sharing */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Share & Download
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </button>

              <div className="flex gap-2">
                <CopyButton
                  textToCopy={shareUrl}
                  label="Copy Page Link"
                  className="w-full"
                  variant="secondary"
                />
                <CopyButton
                  textToCopy={directUrl}
                  label="Direct Link"
                  className="w-full"
                  variant="secondary"
                />
              </div>
            </div>

            {/* Technical Metadata */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" /> Uploader
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {image.uploader_name || 'Community Member'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Upload Date
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {new Date(image.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Total Views
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
                  {image.views.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Downloads
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {image.downloads.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Resolution</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {image.width} × {image.height} px
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>File Size</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {(image.file_size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          </div>

          {/* Embed Codes Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              <span>Embed Codes</span>
            </h3>

            {/* Markdown */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Markdown (GitHub / Docs)</span>
                <CopyButton textToCopy={markdownEmbed} size="sm" variant="ghost" />
              </div>
              <input
                readOnly
                value={markdownEmbed}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              />
            </div>

            {/* HTML */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>HTML Code</span>
                <CopyButton textToCopy={htmlEmbed} size="sm" variant="ghost" />
              </div>
              <input
                readOnly
                value={htmlEmbed}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              />
            </div>

            {/* BBCode */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>BBCode (Forums)</span>
                <CopyButton textToCopy={bbcodeEmbed} size="sm" variant="ghost" />
              </div>
              <input
                readOnly
                value={bbcodeEmbed}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <Flag className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Report Image
                </h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reason for Report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as ReportReason)}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Spam">Spam</option>
                  <option value="Copyright Concern">Copyright Concern</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Malware Concern">Malware Concern</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description of Issue
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide context or license reference..."
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-sm"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
