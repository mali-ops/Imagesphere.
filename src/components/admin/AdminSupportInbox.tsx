import React from 'react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/EmptyState';
import { Mail, CheckCircle2, Reply, Trash2, Clock } from 'lucide-react';

export const AdminSupportInbox: React.FC = () => {
  const { supportMessages, resolveSupportMessage } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Support & Contact Inbox ({supportMessages.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Inquiries submitted via the public Contact and Help Center channels.
        </p>
      </div>

      {supportMessages.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No incoming messages"
          description="Your support inbox is currently clear of open inquiries."
        />
      ) : (
        <div className="space-y-3">
          {supportMessages.map((msg, idx) => (
            <div
              key={`admin-msg-${msg.id || 'msg'}-${idx}`}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                msg.status === 'new'
                  ? 'border-purple-300 dark:border-purple-900/60 ring-1 ring-purple-500/10 shadow-xs'
                  : 'border-slate-200/80 dark:border-slate-800 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {msg.name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    &lt;{msg.email}&gt;
                  </span>
                  {msg.status === 'new' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 uppercase">
                      New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(msg.created_at).toLocaleString()}</span>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Subject: {msg.subject}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {msg.message}
              </p>

              <div className="mt-3 flex items-center justify-end gap-2 pt-2 text-xs">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                {msg.status === 'new' && (
                  <button
                    onClick={() => resolveSupportMessage(msg.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
