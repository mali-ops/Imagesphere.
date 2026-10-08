import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/EmptyState';
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Images,
  HardDrive,
  ArrowRight,
  X,
  Check,
} from 'lucide-react';
import { Folder } from '../../types';

export const FoldersPage: React.FC = () => {
  const {
    currentUser,
    folders,
    images,
    navigateTo,
    createFolder,
    updateFolder,
    deleteFolder,
    confirm,
    addToast,
  } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const myImages = images.filter((img) => img.user_id === currentUser?.id);

  const handleOpenCreate = () => {
    setName('');
    setColor('#3B82F6');
    setEditingFolder(null);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (f: Folder) => {
    setEditingFolder(f);
    setName(f.name);
    setColor(f.color || '#3B82F6');
    setCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingFolder) {
      updateFolder(editingFolder.id, { name: name.trim(), color });
    } else {
      createFolder(name.trim(), color);
    }
    setCreateModalOpen(false);
  };

  const handleDelete = (f: Folder) => {
    const count = myImages.filter((img) => img.folder_id === f.id).length;
    confirm({
      title: `Delete Folder "${f.name}"`,
      message: `Are you sure you want to delete this folder? Its ${count} images will be safely moved to Root (No Folder).`,
      confirmLabel: 'Delete Folder',
      isDestructive: true,
      onConfirm: () => {
        deleteFolder(f.id);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Folders & Albums
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize your media collections by categories, projects, or clients.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Folders Grid */}
      {folders.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No folders created yet"
          description="Create folders to categorize your screenshots, wallpapers, brand assets, and web imagery."
          actionLabel="Create Your First Folder"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {folders.map((folder, idx) => {
            const folderImages = myImages.filter((img) => img.folder_id === folder.id);
            const totalBytes = folderImages.reduce((sum, img) => sum + img.file_size, 0);
            const totalViews = folderImages.reduce((sum, img) => sum + img.views, 0);

            return (
              <div
                key={`folder-card-${folder.id || 'f'}-${idx}`}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: folder.color || '#3B82F6' }}
                    >
                      <FolderOpen className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => handleOpenEdit(folder)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                        title="Rename Folder"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(folder)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => navigateTo('dashboard-images', { folderId: folder.id })}
                    className="text-base font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                  >
                    {folder.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <div className="flex items-center justify-between">
                      <span>Images</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {folderImages.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Storage</span>
                      <span>{(totalBytes / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Views</span>
                      <span>{totalViews}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => navigateTo('dashboard-images', { folderId: folder.id })}
                    className="w-full py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Browse {folderImages.length} Images</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Folder Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingFolder ? 'Rename Folder' : 'Create New Folder'}
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Work, Wallpapers, Social Media"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Color Tag
                </label>
                <div className="flex items-center gap-3">
                  {[
                    '#3B82F6',
                    '#10B981',
                    '#8B5CF6',
                    '#F59E0B',
                    '#EF4444',
                    '#EC4899',
                    '#6366F1',
                    '#14B8A6',
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  {editingFolder ? 'Save Changes' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
