import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../ui/StatsCard';
import { StorageProgress } from '../ui/StorageProgress';
import { CopyButton } from '../ui/CopyButton';
import { EmptyState } from '../ui/EmptyState';
import { getBrandedDirectUrl } from '../../utils/imageUrls';
import {
  Images,
  UploadCloud,
  HardDrive,
  Eye,
  Download,
  Share2,
  FolderOpen,
  Plus,
  ArrowRight,
  ExternalLink,
  MoreVertical,
  Trash2,
  Lock,
  Globe,
  Crown,
  Shield,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    currentUser,
    images,
    folders,
    navigateTo,
    createFolder,
    deleteImage,
    confirm,
    addToast,
  } = useApp();

  const [createFolderModal, setCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');

  // Filter user's personal images (matching by ID, user_id, or full name, or platform uploads for admin)
  const myImages = images.filter((img) => {
    if (!currentUser) return false;
    return (
      img.user_id === currentUser.id ||
      img.user_id === currentUser.user_id ||
      (img.uploader_name && img.uploader_name.toLowerCase() === currentUser.full_name?.toLowerCase()) ||
      (currentUser.role === 'admin' && (img.user_id === 'guest' || !img.user_id))
    );
  });
  const totalViews = myImages.reduce((sum, img) => sum + img.views, 0);
  const totalDownloads = myImages.reduce((sum, img) => sum + img.downloads, 0);
  const publicSharedCount = myImages.filter((img) => img.visibility !== 'private').length;
  const storageUsedBytes = currentUser?.storage_used || myImages.reduce((sum, img) => sum + img.file_size, 0);
  const storageLimitBytes = currentUser?.storage_limit || 1024 * 1024 * 1024;

  const recentImages = [...myImages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 6);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName('');
    setCreateFolderModal(false);
  };

  const handleDelete = (id: string, title: string) => {
    confirm({
      title: 'Delete Image',
      message: `Are you sure you want to delete "${title}"? This cannot be undone and any shared links will stop working.`,
      confirmLabel: 'Delete Image',
      isDestructive: true,
      onConfirm: () => {
        deleteImage(id);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Sovereign Platform Owner Banner */}
      {currentUser?.role === 'owner' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-600/15 border border-amber-500/35 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30 shrink-0">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Platform Owner Access Active — Ali
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                  Master Authority
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                You are currently viewing your personal client media library. Click below to enter your sovereign <strong>Owner Headquarters</strong> to manage admins, clients, system settings, and RBAC permissions.
              </p>
            </div>
          </div>
          <button
            id="overview-banner-owner-hq-btn"
            onClick={() => navigateTo('admin-owner')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/25 flex items-center gap-2 shrink-0 active:scale-95 transition-all cursor-pointer"
          >
            <Crown className="w-4 h-4 fill-current" />
            <span>Open Owner Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Notice Banner if user is admin */}
      {currentUser?.role === 'admin' && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/30 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Admin Console Access Available
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Switch to the Platform Admin console to manage user tickets, moderation, and reports.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('admin-overview')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/25 flex items-center gap-2 shrink-0 active:scale-95 transition-all cursor-pointer"
          >
            <span>Open Admin Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {currentUser?.full_name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what is happening with your hosted media library today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentUser?.role === 'owner' && (
            <button
              id="overview-quick-owner-hq-btn"
              onClick={() => navigateTo('admin-owner')}
              className="px-3.5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Owner Headquarters</span>
            </button>
          )}

          <button
            id="overview-quick-folder-btn"
            onClick={() => setCreateFolderModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>New Folder</span>
          </button>

          <button
            id="overview-quick-upload-btn"
            onClick={() => navigateTo('dashboard-upload')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Images</span>
          </button>
        </div>
      </div>

      {/* 6 Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatsCard
          title="Total Images"
          value={myImages.length}
          icon={Images}
          color="blue"
        />
        <StatsCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={Eye}
          color="emerald"
        />
        <StatsCard
          title="Downloads"
          value={totalDownloads.toLocaleString()}
          icon={Download}
          color="purple"
        />
        <StatsCard
          title="Shared Public"
          value={publicSharedCount}
          icon={Share2}
          color="indigo"
        />
        <StatsCard
          title="Folders"
          value={folders.length}
          icon={FolderOpen}
          color="amber"
        />
        <StatsCard
          title="Storage Used"
          value={`${(storageUsedBytes / (1024 * 1024)).toFixed(1)} MB`}
          icon={HardDrive}
          color="rose"
        />
      </div>

      {/* Storage Gauge & Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StorageProgress
            usedBytes={storageUsedBytes}
            limitBytes={storageLimitBytes}
            showBreakdown
            breakdown={{
              jpeg: storageUsedBytes * 0.45,
              png: storageUsedBytes * 0.35,
              webp: storageUsedBytes * 0.15,
              gif: storageUsedBytes * 0.05,
            }}
          />
        </div>

        {/* Quick Folders Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Folders ({folders.length})
              </h3>
              <button
                onClick={() => navigateTo('dashboard-folders')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {folders.slice(0, 3).map((folder, idx) => {
                const count = myImages.filter((img) => img.folder_id === folder.id).length;
                return (
                  <div
                    key={`overview-fld-${folder.id || 'f'}-${idx}`}
                    onClick={() => navigateTo('dashboard-images', { folderId: folder.id })}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: folder.color || '#3B82F6' }}
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {folder.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {count} images
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setCreateFolderModal(true)}
            className="w-full mt-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Folder</span>
          </button>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Uploads
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quick access to your most recently uploaded files.
            </p>
          </div>

          {myImages.length > 0 && (
            <button
              onClick={() => navigateTo('dashboard-images')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Library</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {recentImages.length === 0 ? (
          <EmptyState
            icon={UploadCloud}
            title="No images uploaded yet"
            description="Drag and drop your pictures, screenshots, or art to start sharing with the world."
            actionLabel="Upload Your First Image"
            onAction={() => navigateTo('dashboard-upload')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentImages.map((img, idx) => (
              <div
                key={`overview-img-${img.id || 'img'}-${idx}`}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div
                  onClick={() => navigateTo('dashboard-image-detail', { imageId: img.id })}
                  className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
                >
                  <img
                    src={img.thumbnail_url || img.storage_url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        img.visibility === 'public'
                          ? 'bg-emerald-500/90 text-white'
                          : img.visibility === 'unlisted'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-slate-800/90 text-white'
                      }`}
                    >
                      {img.visibility}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <h4
                    onClick={() => navigateTo('dashboard-image-detail', { imageId: img.id })}
                    className="text-xs font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                    title={img.title}
                  >
                    {img.title}
                  </h4>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{img.views} views</span>
                    <span>{(img.file_size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                    <CopyButton
                      textToCopy={getBrandedDirectUrl(img)}
                      label="Direct"
                      size="sm"
                      variant="ghost"
                      className="text-[10px]"
                    />
                    <button
                      onClick={() => navigateTo('public-image', { imageId: img.id })}
                      title="Open Public Page"
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(img.id, img.title)}
                      title="Delete Image"
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {createFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Create New Folder
            </h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., Blog Graphics, Screenshots, Project X"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Folder Color Tag
                </label>
                <div className="flex items-center gap-3">
                  {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewFolderColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newFolderColor === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateFolderModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
