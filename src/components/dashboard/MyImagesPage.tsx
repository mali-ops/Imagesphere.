import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CopyButton } from '../ui/CopyButton';
import { EmptyState } from '../ui/EmptyState';
import { getBrandedDirectUrl } from '../../utils/imageUrls';
import { formatBytes } from '../../utils/imageCompression';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  FolderOpen,
  Eye,
  Download,
  Trash2,
  Edit2,
  Lock,
  ExternalLink,
  MoreVertical,
  CheckSquare,
  Square,
  Share2,
  Check,
  X,
  UploadCloud,
  HardDrive,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { ImageItem, ImageVisibility } from '../../types';

export const MyImagesPage: React.FC = () => {
  const {
    currentUser,
    images,
    folders,
    routeParams,
    navigateTo,
    updateImage,
    deleteImage,
    batchDeleteImages,
    confirm,
    addToast,
    downloadImage,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>(routeParams.folderId || 'all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'largest' | 'smallest' | 'views'>('newest');

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchModal, setBatchModal] = useState<'folder' | 'privacy' | null>(null);
  const [targetBatchFolder, setTargetBatchFolder] = useState<string>('');
  const [targetBatchPrivacy, setTargetBatchPrivacy] = useState<ImageVisibility>('public');

  // Edit / Rename Modal
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editFolder, setEditFolder] = useState('');
  const [editVisibility, setEditVisibility] = useState<ImageVisibility>('public');

  // Admin filter scope
  const [adminScope, setAdminScope] = useState<'all' | 'mine'>('all');

  // Filter user's images
  const userImages = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin' && adminScope === 'all') {
      return images;
    }
    return images.filter(
      (img) =>
        img.user_id === currentUser.id ||
        img.user_id === currentUser.user_id ||
        (img.uploader_name && img.uploader_name.toLowerCase() === currentUser.full_name?.toLowerCase()) ||
        (currentUser.role === 'admin' && (img.user_id === 'guest' || !img.user_id))
    );
  }, [images, currentUser, adminScope]);

  const filteredImages = useMemo(() => {
    return userImages
      .filter((img) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = img.title.toLowerCase().includes(q);
          const matchFilename = img.file_name.toLowerCase().includes(q);
          const matchTags = img.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchFilename && !matchTags) return false;
        }

        // Folder
        if (selectedFolder !== 'all') {
          if (selectedFolder === 'root') {
            if (img.folder_id) return false;
          } else if (img.folder_id !== selectedFolder) {
            return false;
          }
        }

        // Type
        if (selectedType !== 'all') {
          const ext = img.file_name.split('.').pop()?.toLowerCase();
          if (selectedType === 'jpeg' && ext !== 'jpg' && ext !== 'jpeg') return false;
          if (selectedType === 'png' && ext !== 'png') return false;
          if (selectedType === 'webp' && ext !== 'webp') return false;
          if (selectedType === 'gif' && ext !== 'gif') return false;
        }

        // Privacy
        if (selectedPrivacy !== 'all' && img.visibility !== selectedPrivacy) {
          return false;
        }

        // Size
        if (selectedSize === 'small' && img.file_size >= 1024 * 1024) return false;
        if (selectedSize === 'medium' && (img.file_size < 1024 * 1024 || img.file_size > 5 * 1024 * 1024)) return false;
        if (selectedSize === 'large' && img.file_size <= 5 * 1024 * 1024) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === 'largest') return b.file_size - a.file_size;
        if (sortBy === 'smallest') return a.file_size - b.file_size;
        if (sortBy === 'views') return b.views - a.views;
        return 0;
      });
  }, [userImages, searchQuery, selectedFolder, selectedType, selectedPrivacy, selectedSize, sortBy]);

  // Selected images metrics
  const selectedImages = useMemo(() => {
    return userImages.filter((img) => selectedIds.includes(img.id));
  }, [userImages, selectedIds]);

  const selectedTotalBytes = useMemo(() => {
    return selectedImages.reduce((sum, img) => sum + img.file_size, 0);
  }, [selectedImages]);

  const largeFilteredImages = useMemo(() => {
    return filteredImages.filter((img) => img.file_size >= 1024 * 1024);
  }, [filteredImages]);

  const unfiledFilteredImages = useMemo(() => {
    return filteredImages.filter((img) => !img.folder_id);
  }, [filteredImages]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredImages.length && filteredImages.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredImages.map((img) => img.id));
    }
  };

  const selectLargeImages = () => {
    const ids = largeFilteredImages.map((img) => img.id);
    setSelectedIds(ids);
    if (ids.length === 0) {
      addToast('No Large Images', 'No images in current view are larger than 1 MB.', 'info');
    } else {
      const totalSize = largeFilteredImages.reduce((sum, img) => sum + img.file_size, 0);
      addToast('Selected Large Images', `Selected ${ids.length} files consuming ${formatBytes(totalSize)}.`, 'info');
    }
  };

  const selectUnfiledImages = () => {
    const ids = unfiledFilteredImages.map((img) => img.id);
    setSelectedIds(ids);
    if (ids.length === 0) {
      addToast('No Unfiled Images', 'All images in current view are already organized into folders.', 'info');
    }
  };

  const handleDownload = (img: ImageItem) => {
    downloadImage(img);
  };

  const handleDelete = (img: ImageItem) => {
    confirm({
      title: 'Delete Image',
      message: `Are you sure you want to permanently delete "${img.title}"? This will immediately free ${formatBytes(img.file_size)} from your storage quota. Shared public links and embeds will stop functioning.`,
      confirmLabel: `Delete Permanently (${formatBytes(img.file_size)})`,
      isDestructive: true,
      onConfirm: () => {
        deleteImage(img.id);
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    const sizeStr = formatBytes(selectedTotalBytes);
    confirm({
      title: `Delete ${selectedIds.length} Selected Images`,
      message: `Are you sure you want to permanently delete these ${selectedIds.length} selected images? This action cannot be undone and will immediately clear ${sizeStr} of storage space from your account quota. Any external sites using these links will encounter broken images.`,
      confirmLabel: `Permanently Delete ${selectedIds.length} Images (${sizeStr})`,
      isDestructive: true,
      onConfirm: async () => {
        await batchDeleteImages(selectedIds);
        setSelectedIds([]);
      },
    });
  };

  const handleBatchMoveFolder = () => {
    selectedIds.forEach((id) => {
      updateImage(id, { folder_id: targetBatchFolder || undefined });
    });
    addToast('Batch Update', `Moved ${selectedIds.length} images to folder`, 'success');
    setBatchModal(null);
    setSelectedIds([]);
  };

  const handleBatchChangePrivacy = () => {
    selectedIds.forEach((id) => {
      updateImage(id, { visibility: targetBatchPrivacy });
    });
    addToast('Batch Update', `Updated privacy to ${targetBatchPrivacy} for ${selectedIds.length} images`, 'success');
    setBatchModal(null);
    setSelectedIds([]);
  };

  const openEditModal = (img: ImageItem) => {
    setEditingImage(img);
    setEditTitle(img.title);
    setEditDescription(img.description || '');
    setEditTags(img.tags ? img.tags.join(', ') : '');
    setEditFolder(img.folder_id || '');
    setEditVisibility(img.visibility);
  };

  const saveEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    const tagsArray = editTags
      ? editTags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    updateImage(editingImage.id, {
      title: editTitle,
      description: editDescription,
      tags: tagsArray,
      folder_id: editFolder || undefined,
      visibility: editVisibility,
    });

    setEditingImage(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search / Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Images ({filteredImages.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, organize, and copy direct links from your cloud library.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin scope switcher */}
          {currentUser?.role === 'admin' && (
            <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAdminScope('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  adminScope === 'all'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Uploads ({images.length})
              </button>
              <button
                type="button"
                onClick={() => setAdminScope('mine')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  adminScope === 'mine'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                My Uploads
              </button>
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => navigateTo('dashboard-upload')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images by title, filename, or #tag..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Folder filter */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Folders</option>
            <option value="root">Root (No Folder)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Formats</option>
            <option value="jpeg">JPEG / JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
            <option value="gif">GIF</option>
          </select>

          {/* Privacy filter */}
          <select
            value={selectedPrivacy}
            onChange={(e) => setSelectedPrivacy(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Privacy</option>
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>

          {/* Size filter */}
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All File Sizes</option>
            <option value="small">&lt; 1 MB</option>
            <option value="medium">1 MB – 5 MB</option>
            <option value="large">&gt; 5 MB</option>
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="largest">Largest File Size</option>
              <option value="smallest">Smallest File Size</option>
              <option value="views">Most Views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Selection & Storage Clearance Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left side: Selection indicators and toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={selectAll}
            className={`px-3 py-1.5 rounded-xl font-semibold border flex items-center gap-1.5 transition-all ${
              selectedIds.length > 0 && selectedIds.length === filteredImages.length
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : selectedIds.length > 0
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            {selectedIds.length === filteredImages.length && filteredImages.length > 0 ? (
              <CheckSquare className="w-4 h-4" />
            ) : selectedIds.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-blue-500" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {selectedIds.length === filteredImages.length && filteredImages.length > 0
                ? 'Deselect All'
                : `Select All (${filteredImages.length})`}
            </span>
          </button>

          {selectedIds.length > 0 && (
            <>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold">
                {selectedIds.length} of {filteredImages.length} selected
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Clears {formatBytes(selectedTotalBytes)}</span>
              </span>

              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {/* Right side: Quick storage cleanup helpers & Batch Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-1.5 animate-in fade-in">
              <button
                onClick={() => setBatchModal('folder')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Move ({selectedIds.length})
              </button>
              <button
                onClick={() => setBatchModal('privacy')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Privacy ({selectedIds.length})
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedIds.length} ({formatBytes(selectedTotalBytes)})</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
                Storage cleanup shortcuts:
              </span>
              <button
                onClick={selectLargeImages}
                disabled={largeFilteredImages.length === 0}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  largeFilteredImages.length > 0
                    ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600'
                    : 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
                title="Select all images > 1 MB in current view"
              >
                <span>Large &gt; 1 MB</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold">
                  {largeFilteredImages.length}
                </span>
              </button>
              <button
                onClick={selectUnfiledImages}
                disabled={unfiledFilteredImages.length === 0}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  unfiledFilteredImages.length > 0
                    ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600'
                    : 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
                title="Select unfiled images without a folder"
              >
                <span>Unfiled</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold">
                  {unfiledFilteredImages.length}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Images Display */}
      {filteredImages.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No images match your filter"
          description="Try adjusting your search terms, changing the folder, or upload new images."
          actionLabel="Upload New Image"
          onAction={() => navigateTo('dashboard-upload')}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img, idx) => {
            const isSelected = selectedIds.includes(img.id);
            const folder = folders.find((f) => f.id === img.folder_id);

            return (
              <div
                key={`my-img-grid-${img.id || 'img'}-${idx}`}
                className={`group rounded-2xl bg-white dark:bg-slate-900 border transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/15 dark:bg-blue-950/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={img.thumbnail_url || img.storage_url}
                    alt={img.title}
                    onClick={() => navigateTo('dashboard-image-detail', { imageId: img.id })}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(img.id);
                      }}
                      className={`p-1.5 rounded-lg backdrop-blur-xs transition-all shadow-xs ${
                        isSelected
                          ? 'bg-blue-600 text-white ring-2 ring-white/70 scale-105'
                          : 'bg-black/50 text-white/90 hover:bg-black/80 hover:text-white'
                      }`}
                      title={isSelected ? 'Deselect image' : 'Select image for batch deletion'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-white" />
                      ) : (
                        <Square className="w-4 h-4 text-white/90" />
                      )}
                    </button>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        img.visibility === 'public'
                          ? 'bg-emerald-500/90 text-white'
                          : img.visibility === 'unlisted'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-slate-900/90 text-white'
                      }`}
                    >
                      {img.visibility}
                    </span>
                  </div>

                  {folder && (
                    <div className="absolute bottom-2 left-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white shadow-xs"
                        style={{ backgroundColor: folder.color || '#3B82F6' }}
                      >
                        {folder.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Body */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      onClick={() => navigateTo('dashboard-image-detail', { imageId: img.id })}
                      className="text-xs font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                      title={img.title}
                    >
                      {img.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {(img.file_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {img.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" /> {img.downloads}
                    </span>
                    <span>{new Date(img.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Actions Footer */}
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
                        onClick={() => openEditModal(img)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                        title="Edit Metadata & Folder"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(img)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigateTo('public-image', { imageId: img.id })}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                        title="Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(img)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Delete Image"
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
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3 w-8">
                    <button onClick={selectAll} className="text-slate-400">
                      {selectedIds.length === filteredImages.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Title & File</th>
                  <th className="p-3">Folder</th>
                  <th className="p-3">Privacy</th>
                  <th className="p-3">Dimensions</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredImages.map((img, idx) => {
                  const isSelected = selectedIds.includes(img.id);
                  const folder = folders.find((f) => f.id === img.folder_id);

                  return (
                    <tr
                      key={`my-img-row-${img.id || 'img'}-${idx}`}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="p-3">
                        <button
                          onClick={() => toggleSelect(img.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title={isSelected ? 'Deselect row' : 'Select row for batch action'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <img
                          src={img.thumbnail_url || img.storage_url}
                          alt={img.title}
                          onClick={() => navigateTo('dashboard-image-detail', { imageId: img.id })}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <span
                          onClick={() => navigateTo('dashboard-image-detail', { imageId: img.id })}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer block truncate max-w-xs"
                        >
                          {img.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono truncate block">
                          {img.file_name}
                        </span>
                      </td>
                      <td className="p-3">
                        {folder ? (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] text-white font-medium"
                            style={{ backgroundColor: folder.color || '#3B82F6' }}
                          >
                            {folder.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Root</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            img.visibility === 'public'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : img.visibility === 'unlisted'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {img.visibility}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {img.width}×{img.height}
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {(img.file_size / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {img.views}
                      </td>
                      <td className="p-3 text-slate-400">
                        {new Date(img.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <CopyButton
                            textToCopy={getBrandedDirectUrl(img)}
                            label="Direct"
                            size="sm"
                            variant="ghost"
                          />
                          <button
                            onClick={() => openEditModal(img)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(img)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(img)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Image Details
              </h3>
              <button
                onClick={() => setEditingImage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveEditModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Folder
                  </label>
                  <select
                    value={editFolder}
                    onChange={(e) => setEditFolder(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">No Folder (Root)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Privacy
                  </label>
                  <select
                    value={editVisibility}
                    onChange={(e) => setEditVisibility(e.target.value as ImageVisibility)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Folder Modal */}
      {batchModal === 'folder' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Move {selectedIds.length} Images to Folder
            </h3>
            <select
              value={targetBatchFolder}
              onChange={(e) => setTargetBatchFolder(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Root (No Folder)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBatchModal(null)}
                className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchMoveFolder}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl"
              >
                Move Images
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Privacy Modal */}
      {batchModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Set Privacy for {selectedIds.length} Images
            </h3>
            <select
              value={targetBatchPrivacy}
              onChange={(e) => setTargetBatchPrivacy(e.target.value as ImageVisibility)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="public">Public (Everyone can discover)</option>
              <option value="unlisted">Unlisted (Secret direct link only)</option>
              <option value="private">Private (Only you when logged in)</option>
            </select>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBatchModal(null)}
                className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchChangePrivacy}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl"
              >
                Apply Privacy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Sticky Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {selectedIds.length}
            </span>
            <div>
              <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>{selectedIds.length} images selected</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-normal">of {filteredImages.length}</span>
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <HardDrive className="w-3 h-3" />
                <span>Clears {formatBytes(selectedTotalBytes)} from storage quota</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setBatchModal('folder')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors hidden sm:inline-flex"
            >
              Move
            </button>
            <button
              onClick={() => setBatchModal('privacy')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors hidden sm:inline-flex"
            >
              Privacy
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete {selectedIds.length} Images</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors"
              title="Deselect All"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
