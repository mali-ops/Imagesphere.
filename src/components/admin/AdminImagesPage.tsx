import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CopyButton } from '../ui/CopyButton';
import { getBrandedDirectUrl } from '../../utils/imageUrls';
import {
  Images,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Eye,
  Flag,
  Lock,
  Globe,
  AlertTriangle,
  User,
} from 'lucide-react';
import { ImageItem } from '../../types';

export const AdminImagesPage: React.FC = () => {
  const {
    images,
    users,
    reports,
    deleteImage,
    updateImage,
    confirm,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterReported, setFilterReported] = useState(false);
  const [filterVisibility, setFilterVisibility] = useState<string>('all');

  // Reported image IDs
  const reportedImageIds = useMemo(() => {
    return new Set(reports.map((r) => r.image_id));
  }, [reports]);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const uploader = users.find((u) => u.id === img.user_id);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = img.title.toLowerCase().includes(q);
        const matchUser = uploader?.full_name.toLowerCase().includes(q) || uploader?.email.toLowerCase().includes(q);
        if (!matchTitle && !matchUser) return false;
      }

      if (filterReported && !reportedImageIds.has(img.id)) return false;
      if (filterVisibility !== 'all' && img.visibility !== filterVisibility) return false;

      return true;
    });
  }, [images, users, searchQuery, filterReported, filterVisibility, reportedImageIds]);

  const handleDelete = (img: ImageItem) => {
    confirm({
      title: 'Moderate & Delete Image',
      message: `Permanently remove "${img.title}" from the platform? This will invalidate all active embeds.`,
      confirmLabel: 'Delete Permanently',
      isDestructive: true,
      onConfirm: () => {
        deleteImage(img.id);
      },
    });
  };

  const toggleVisibility = (img: ImageItem) => {
    const nextVis = img.visibility === 'public' ? 'private' : 'public';
    updateImage(img.id, { visibility: nextVis });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Image Moderation ({filteredImages.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global repository oversight, DMCA response tools, and content filtering.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, uploader name or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterReported(!filterReported)}
            className={`px-3 py-2 rounded-xl border transition-colors flex items-center gap-1.5 ${
              filterReported
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reported Only</span>
          </button>

          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Privacy</option>
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Grid of Platform Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map((img, idx) => {
          const uploader = users.find((u) => u.id === img.user_id);
          const isReported = reportedImageIds.has(img.id);

          return (
            <div
              key={`admin-img-${img.id || 'img'}-${idx}`}
              className={`group rounded-2xl bg-white dark:bg-slate-900 border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                isReported
                  ? 'border-rose-300 dark:border-rose-900 ring-2 ring-rose-500/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Thumbnail Stage */}
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={img.thumbnail_url || img.storage_url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Top Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      img.visibility === 'public'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900/90 text-white'
                    }`}
                  >
                    {img.visibility}
                  </span>

                  {isReported && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-600 text-white flex items-center gap-1">
                      <Flag className="w-2.5 h-2.5" />
                      Reported
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 right-2">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono">
                    {(img.file_size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={img.title}>
                    {img.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {img.views} views
                  </span>
                </div>

                {/* Uploader info */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <User className="w-3 h-3" />
                  <span className="truncate">{uploader ? uploader.full_name : 'Unknown'}</span>
                </div>

                {/* Action Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-xs">
                  <CopyButton
                    textToCopy={getBrandedDirectUrl(img)}
                    label="Direct"
                    size="sm"
                    variant="ghost"
                    className="text-[10px]"
                  />

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => toggleVisibility(img)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg"
                      title={img.visibility === 'public' ? 'Make Private' : 'Make Public'}
                    >
                      {img.visibility === 'public' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => navigateTo('public-image', { imageId: img.id })}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                      title="Inspect Public Page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(img)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Delete Image Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
