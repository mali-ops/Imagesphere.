import React from 'react';
import { useApp } from '../../context/AppContext';
import { StorageProgress } from '../ui/StorageProgress';
import {
  HardDrive,
  AlertTriangle,
  Sparkles,
  Trash2,
  ExternalLink,
  Zap,
  Info,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { formatBytes } from '../../utils/imageCompression';

export const StoragePage: React.FC = () => {
  const { currentUser, images, deleteImage, confirm, navigateTo } = useApp();

  const myImages = images.filter((img) => img.user_id === currentUser?.id);
  const usedBytes = currentUser?.storage_used || myImages.reduce((sum, img) => sum + img.file_size, 0);
  const limitBytes = currentUser?.storage_limit || 1024 * 1024 * 1024;

  const totalSavedBytes = myImages.reduce((sum, img) => {
    if (img.was_compressed && img.original_file_size && img.original_file_size > img.file_size) {
      return sum + (img.original_file_size - img.file_size);
    }
    return sum;
  }, 0);

  const compressedImagesCount = myImages.filter((img) => img.was_compressed).length;

  const largestImages = [...myImages].sort((a, b) => b.file_size - a.file_size).slice(0, 5);

  const handleDelete = (id: string, title: string) => {
    confirm({
      title: 'Delete Large Image',
      message: `Delete "${title}" to reclaim storage space?`,
      confirmLabel: 'Delete',
      isDestructive: true,
      onConfirm: () => {
        deleteImage(id);
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Storage & Bandwidth
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {currentUser?.plan === 'pro'
            ? 'Monitor your 50 GB Pro Studio quota, analyze largest assets, and maintain optimal cloud capacity.'
            : currentUser?.plan === 'prime'
            ? 'Monitor your 15 GB Prime Creator quota, analyze largest assets, and maintain optimal cloud capacity.'
            : 'Monitor your 500 MB Free Community quota, analyze largest assets, and maintain optimal cloud capacity.'}
        </p>
      </div>

      {/* Main Storage Gauge Card */}
      <StorageProgress
        usedBytes={usedBytes}
        limitBytes={limitBytes}
        showBreakdown
        breakdown={{
          jpeg: usedBytes * 0.45,
          png: usedBytes * 0.35,
          webp: usedBytes * 0.15,
          gif: usedBytes * 0.05,
        }}
      />

      {/* Auto-Compression Engine Stats Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upload Pipeline Compression Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Images are automatically re-encoded to lightweight modern WebP format (82% quality, max 2560px) before writing to Cloudinary / cloud storage, slashing loading latency and saving storage quota.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0 bg-white/70 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <div className="text-right sm:text-left">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Storage Reclaimed
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {totalSavedBytes > 0 ? `+${formatBytes(totalSavedBytes)}` : 'Active on next upload'}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Optimized Images
            </span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {compressedImagesCount} files
            </span>
          </div>
        </div>
      </div>

      {/* Storage Optimization Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Prefer WebP Format
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            WebP provides 25%–35% higher compression than JPEG with zero perceptual quality loss.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <HardDrive className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            10 MB Single File Limit
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Each individual file is capped at 10 MB to ensure rapid edge caching and fast preview loading.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Global High-Speed CDN
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Images are routed through Supabase Storage &amp; Edge CDN nodes for sub-100ms global delivery.
          </p>
        </div>
      </div>

      {/* Largest Files Table for Quick Cleanup */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Largest Assets in Your Library
            </h3>
            <p className="text-xs text-slate-500">
              Files consuming the most space in your account
            </p>
          </div>
        </div>

        {largestImages.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No images uploaded yet</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {largestImages.map((img, idx) => (
              <div key={`largest-img-${img.id || idx}`} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={img.thumbnail_url || img.storage_url}
                    alt={img.title}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5
                      onClick={() => navigateTo('dashboard-image-detail', { imageId: img.id })}
                      className="font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                    >
                      {img.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {img.width}×{img.height} • {new Date(img.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {(img.file_size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    onClick={() => handleDelete(img.id, img.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete file to free space"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
