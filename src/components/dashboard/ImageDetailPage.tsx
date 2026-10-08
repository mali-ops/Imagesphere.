import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CopyButton } from '../ui/CopyButton';
import { getBrandedDirectUrl, getBrandedShareUrl } from '../../utils/imageUrls';
import {
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  FolderOpen,
  Lock,
  Share2,
  Trash2,
  ExternalLink,
  Code,
  Tag,
  Save,
  Clock,
  HardDrive,
} from 'lucide-react';
import { ImageVisibility } from '../../types';

export const ImageDetailPage: React.FC = () => {
  const {
    routeParams,
    images,
    folders,
    navigateTo,
    updateImage,
    deleteImage,
    confirm,
    downloadImage,
    addToast,
    systemSettings,
  } = useApp();

  const imageId = routeParams.imageId;
  const image = images.find((img) => img.id === imageId);

  const [title, setTitle] = useState(image?.title || '');
  const [description, setDescription] = useState(image?.description || '');
  const [tags, setTags] = useState(image?.tags ? image.tags.join(', ') : '');
  const [folderId, setFolderId] = useState(image?.folder_id || '');
  const [visibility, setVisibility] = useState<ImageVisibility>(image?.visibility || 'public');
  const [isSaving, setIsSaving] = useState(false);

  if (!image) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Image Not Found
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          This image may have been moved or removed.
        </p>
        <button
          onClick={() => navigateTo('dashboard-images')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const shareUrl = getBrandedShareUrl(image, systemSettings?.site_name);
  const directUrl = getBrandedDirectUrl(image, systemSettings?.site_name);
  const htmlEmbed = `<img src="${directUrl}" alt="${image.title}" />`;
  const markdownEmbed = `![${image.title}](${directUrl})`;
  const bbcodeEmbed = `[img]${directUrl}[/img]`;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const tagsArray = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    updateImage(image.id, {
      title,
      description,
      tags: tagsArray,
      folder_id: folderId || undefined,
      visibility,
    });
    setIsSaving(false);
  };

  const handleDelete = () => {
    confirm({
      title: 'Delete Image',
      message: `Are you sure you want to permanently delete "${image.title}"? This cannot be undone.`,
      confirmLabel: 'Delete Permanently',
      isDestructive: true,
      onConfirm: () => {
        deleteImage(image.id);
        navigateTo('dashboard-images');
      },
    });
  };

  const handleDownload = () => {
    downloadImage(image);
  };

  return (
    <div className="space-y-6">
      {/* Top Return */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('dashboard-images')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('public-image', { imageId: image.id })}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Page</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl"
            title="Delete Image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Left Stage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Large Image Showcase */}
          <div className="bg-slate-900 rounded-3xl p-4 flex items-center justify-center min-h-[380px] max-h-[600px] overflow-hidden border border-slate-800 shadow-xl">
            <img
              src={image.storage_url}
              alt={image.title}
              className="max-h-[550px] max-w-full rounded-xl object-contain shadow-md"
            />
          </div>

          {/* Edit Metadata Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Edit Image Details
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add an optional caption or description..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="art, wallpaper, screenshots"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Folder
                  </label>
                  <select
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">No Folder (Root)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Privacy Level
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as ImageVisibility)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="public">Public (Indexed & Searchable)</option>
                    <option value="unlisted">Unlisted (Link only)</option>
                    <option value="private">Private (Only you)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Share, Embeds & Metadata */}
        <div className="space-y-6">
          {/* Quick Sharing & Social Links */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Share Image</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="truncate mr-2 font-mono text-slate-600 dark:text-slate-400">
                  {directUrl}
                </span>
                <CopyButton textToCopy={directUrl} label="Direct" size="sm" />
              </div>

              {image.storage_url && (image.storage_url.startsWith('http://') || image.storage_url.startsWith('https://')) && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="truncate mr-2 font-mono text-slate-600 dark:text-slate-400">
                    {image.storage_url}
                  </span>
                  <CopyButton textToCopy={image.storage_url} label="Cloud CDN" size="sm" />
                </div>
              )}

              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="truncate mr-2 font-mono text-slate-600 dark:text-slate-400">
                  {shareUrl}
                </span>
                <CopyButton textToCopy={shareUrl} label="Page" size="sm" />
              </div>
            </div>

            {/* Social Sharing */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Share to Social Media
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(image.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 text-center text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  X / Twitter
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(image.title + ' ' + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 text-center text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(image.title)}&body=${encodeURIComponent(shareUrl)}`}
                  className="flex-1 py-1.5 text-center text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  Email
                </a>
              </div>
            </div>
          </div>

          {/* Embed Codes Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              <span>Embed Codes</span>
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Markdown (GitHub)</span>
                <CopyButton textToCopy={markdownEmbed} size="sm" variant="ghost" />
              </div>
              <input
                readOnly
                value={markdownEmbed}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              />
            </div>

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

          {/* Technical Metadata */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              File Properties
            </h3>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>File Name</span>
              <span className="font-mono text-slate-900 dark:text-white truncate max-w-[180px]">
                {image.file_name}
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

            {image.was_compressed && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Compression</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md text-[11px]">
                  -{image.compression_ratio}% optimized ({((image.original_file_size || 0) / 1024 / 1024).toFixed(2)} MB → {(image.file_size / 1024).toFixed(0)} KB)
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Total Views</span>
              <span className="font-semibold font-mono text-blue-600">
                {image.views}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Downloads</span>
              <span className="font-semibold font-mono text-emerald-600">
                {image.downloads}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Uploaded On</span>
              <span>{new Date(image.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
