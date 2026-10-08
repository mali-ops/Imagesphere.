import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/EmptyState';
import {
  Flag,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Eye,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const {
    reports,
    images,
    resolveReport,
    deleteImage,
    confirm,
    navigateTo,
    addToast,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const handleDeleteReportedImage = (reportId: string, imageId: string) => {
    confirm({
      title: 'Takedown & Delete Offending Image?',
      message: 'This will delete the image from storage, mark the report as resolved, and eliminate all embeds.',
      confirmLabel: 'Delete & Resolve',
      isDestructive: true,
      onConfirm: () => {
        deleteImage(imageId);
        resolveReport(reportId, 'mark_resolved');
        addToast('Report Resolved', 'The image has been purged and report closed.', 'success');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Abuse & DMCA Reports ({filteredReports.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review community flags, copyright claims, spam alerts, and malicious file submissions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto text-xs font-semibold">
          {(['all', 'pending', 'resolved', 'dismissed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Percentage Report Metrics ("Kitny Percent Hua Hai") */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Pending Moderation</span>
            <span className="font-mono font-bold text-rose-600">
              {reports.length > 0 ? ((reports.filter(r => r.status.toLowerCase() === 'pending').length / reports.length) * 100).toFixed(1) : '0.0'}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {reports.filter(r => r.status.toLowerCase() === 'pending').length} reports
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              style={{ width: `${reports.length > 0 ? (reports.filter(r => r.status.toLowerCase() === 'pending').length / reports.length) * 100 : 0}%` }}
              className="h-full bg-rose-500"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Takedown / Resolved Rate</span>
            <span className="font-mono font-bold text-emerald-600">
              {reports.length > 0 ? ((reports.filter(r => r.status.toLowerCase() === 'resolved').length / reports.length) * 100).toFixed(1) : '100.0'}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {reports.filter(r => r.status.toLowerCase() === 'resolved').length} resolved
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              style={{ width: `${reports.length > 0 ? (reports.filter(r => r.status.toLowerCase() === 'resolved').length / reports.length) * 100 : 100}%` }}
              className="h-full bg-emerald-500"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Dismissed / Cleared Rate</span>
            <span className="font-mono font-bold text-purple-600">
              {reports.length > 0 ? ((reports.filter(r => r.status.toLowerCase() === 'dismissed').length / reports.length) * 100).toFixed(1) : '0.0'}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {reports.filter(r => r.status.toLowerCase() === 'dismissed').length} dismissed
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              style={{ width: `${reports.length > 0 ? (reports.filter(r => r.status.toLowerCase() === 'dismissed').length / reports.length) * 100 : 0}%` }}
              className="h-full bg-purple-500"
            />
          </div>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No abuse reports found"
          description="All clear! There are currently no reports matching this filter."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Reported Image</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Details / Reporter</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reported At</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.map((r, idx) => {
                  const targetImage = images.find((i) => i.id === r.image_id);

                  return (
                    <tr key={`admin-rep-${r.id || 'r'}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        {targetImage ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={targetImage.thumbnail_url || targetImage.storage_url}
                              alt={targetImage.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[160px]">
                                {targetImage.title}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ID: {targetImage.id.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-500 font-medium italic">Image Already Purged</span>
                        )}
                      </td>

                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                          {r.reason}
                        </span>
                      </td>

                      <td className="p-3">
                        <p className="text-slate-700 dark:text-slate-300 max-w-xs line-clamp-2">
                          {r.description || r.details || 'No additional comment provided by reporter.'}
                        </p>
                        {r.reporter_email && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Reported by: {r.reporter_email}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                            r.status.toLowerCase() === 'pending'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                              : r.status.toLowerCase() === 'resolved'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="p-3 text-slate-400">
                        {new Date(r.created_at).toLocaleString()}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {targetImage && (
                            <button
                              onClick={() => navigateTo('public-image', { imageId: targetImage.id })}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                              title="Inspect Image"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {r.status.toLowerCase() === 'pending' && (
                            <>
                              <button
                                onClick={() => resolveReport(r.id, 'dismiss')}
                                className="px-2 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg font-medium"
                                title="Dismiss Report"
                              >
                                Dismiss
                              </button>
                              {targetImage && (
                                <button
                                  onClick={() => handleDeleteReportedImage(r.id, targetImage.id)}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-xs"
                                  title="Delete image & resolve"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Takedown</span>
                                </button>
                              )}
                            </>
                          )}
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
    </div>
  );
};
