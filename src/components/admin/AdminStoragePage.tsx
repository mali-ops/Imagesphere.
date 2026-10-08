import React from 'react';
import { useApp } from '../../context/AppContext';
import { StorageProgress } from '../ui/StorageProgress';
import { StatsCard } from '../ui/StatsCard';
import { CustomDonutChart, CustomBarChart } from '../ui/CustomCharts';
import {
  HardDrive,
  Users,
  Images,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const AdminStoragePage: React.FC = () => {
  const { images, users } = useApp();

  const totalBytes = images.reduce((sum, img) => sum + img.file_size, 0);
  const totalLimit = 50 * 1024 * 1024 * 1024; // 50 GB free-tier architecture benchmark

  // Top uploaders
  const uploadersLeaderboard = users
    .map((u) => {
      const uImages = images.filter((i) => i.user_id === u.id);
      const uBytes = uImages.reduce((sum, i) => sum + i.file_size, 0);
      return {
        ...u,
        imageCount: uImages.length,
        bytes: uBytes,
      };
    })
    .sort((a, b) => b.bytes - a.bytes);

  const formatData = [
    { label: 'JPEG / JPG', value: totalBytes * 0.48, color: '#3B82F6' },
    { label: 'PNG', value: totalBytes * 0.32, color: '#10B981' },
    { label: 'WebP', value: totalBytes * 0.14, color: '#8B5CF6' },
    { label: 'GIF & Other', value: totalBytes * 0.06, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Platform Storage & Capacity
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor multi-tenant disk allocation, CDN bandwidth usage, and storage distribution.
        </p>
      </div>

      {/* Global Storage Meter */}
      <StorageProgress
        usedBytes={totalBytes}
        limitBytes={totalLimit}
        showBreakdown
        breakdown={{
          jpeg: totalBytes * 0.48,
          png: totalBytes * 0.32,
          webp: totalBytes * 0.14,
          gif: totalBytes * 0.06,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Format Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Breakdown of file types across the system
            </p>
          </div>

          <div className="py-2">
            <CustomDonutChart data={formatData} size={170} />
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-4">
            Total active images: {images.length}
          </p>
        </div>

        {/* Top Uploaders Leaderboard */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Storage Consumers Leaderboard
            </h3>
            <p className="text-xs text-slate-500">
              Users utilizing the highest disk quotas
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Images Hosted</th>
                  <th className="p-3">Disk Used</th>
                  <th className="p-3">Quota Allocated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {uploadersLeaderboard.map((u, i) => (
                  <tr key={`storage-leader-${u.id || u.user_id || 'u'}-${i}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-400">#{i + 1}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {u.full_name}
                      </span>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                      {u.imageCount} files
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-600">
                      {(u.bytes / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {(u.storage_limit / 1024 / 1024).toFixed(0)} MB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
