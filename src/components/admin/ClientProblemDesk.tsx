import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, ClientIssueTicket } from '../../types';
import { formatBytes } from '../../utils/imageCompression';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  HardDrive,
  Lock,
  KeyRound,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Mail,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

export const ClientProblemDesk: React.FC = () => {
  const {
    currentUser,
    users,
    clientIssues,
    solveClientProblem,
    syncUsersFromDatabase,
    isSyncingUsers,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<ClientIssueTicket | null>(null);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);

  // Resolution state
  const [resolutionAction, setResolutionAction] = useState<string>('fix_quota');
  const [bonusGB, setBonusGB] = useState<number>(5);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredTickets = clientIssues.filter((t) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'open'
        ? t.status !== 'resolved'
        : t.status === 'resolved';

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.user_name.toLowerCase().includes(q) ||
      t.user_email.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleOpenSolver = (ticket: ClientIssueTicket) => {
    setSelectedTicket(ticket);
    const client = users.find((u) => u.id === ticket.user_id || u.email === ticket.user_email);
    setSelectedClient(client || null);
    setResolutionAction(
      ticket.issue_type === 'storage_quota'
        ? 'fix_quota'
        : ticket.issue_type === 'login_access'
        ? 'reset_access'
        : 'grant_bonus'
    );
    setResolutionNote(`Resolved: ${ticket.title}`);
    setBonusGB(5);
  };

  const handleExecuteSolution = async () => {
    if (!selectedClient) {
      addToast('No Client Selected', 'Unable to locate client record.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      await solveClientProblem(selectedClient.id, resolutionAction, {
        bonusBytes: bonusGB * 1024 * 1024 * 1024,
        note: resolutionNote,
        ticketId: selectedTicket?.id,
      });
      setSelectedTicket(null);
      setSelectedClient(null);
      await syncUsersFromDatabase();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Client Problem Solver Desk (کلائنٹ مسائل ڈیسک)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Both Administrators and Owner can view client accounts, troubleshoot issues, recalculate quotas, grant emergency storage, and reset credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => syncUsersFromDatabase()}
          disabled={isSyncingUsers}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors shadow-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingUsers ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, ticket #, or issue description..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Tickets ({clientIssues.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('open')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === 'open'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Pending Attention ({clientIssues.filter((t) => t.status !== 'resolved').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              No Client Problems Matching Filter
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All client systems and quota allowances are currently operating within normal parameters.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket, idx) => {
            const isResolved = ticket.status === 'resolved';
            const client = users.find((u) => u.id === ticket.user_id || u.email === ticket.user_email);

            return (
              <div
                key={`desk-tkt-${ticket.id || 't'}-${idx}`}
                className={`p-5 rounded-3xl border transition-all ${
                  isResolved
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-amber-300/80 dark:border-amber-700/60 shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{ticket.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ticket.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : ticket.priority === 'high'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}>
                        {ticket.priority} Priority
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {isResolved ? 'Resolved' : 'Active Problem'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {ticket.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                      <span>Client: <strong>{ticket.user_name}</strong></span>
                      <span>•</span>
                      <span className="font-mono">{ticket.user_email}</span>
                      {client && (
                        <>
                          <span>•</span>
                          <span>Storage: <strong>{formatBytes(client.storage_used)} / {formatBytes(client.storage_limit)}</strong></span>
                          <span>•</span>
                          <span className="capitalize text-purple-600 dark:text-purple-400 font-bold">Tier: {client.plan || 'Free'}</span>
                        </>
                      )}
                    </div>

                    {isResolved && ticket.resolution_notes && (
                      <div className="mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                        <strong>Solution applied by {ticket.resolved_by || 'Admin'}:</strong> {ticket.resolution_notes}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenSolver(ticket)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        isResolved
                          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{isResolved ? 'Re-adjust Solution' : 'Solve Client Problem'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Problem Solver Modal */}
      {selectedTicket && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Solve Problem for {selectedClient.full_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ticket #{selectedTicket.id}: {selectedTicket.issue_type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTicket(null);
                  setSelectedClient(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Client:</span>
                <span className="font-bold">{selectedClient.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono">{selectedClient.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Storage Used:</span>
                <span className="font-bold text-blue-600">{formatBytes(selectedClient.storage_used)} / {formatBytes(selectedClient.storage_limit)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Administrative Action
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'fix_quota', label: 'Recalculate Storage Quota', desc: 'Syncs quota with client plan' },
                  { id: 'grant_bonus', label: 'Grant Emergency Storage', desc: 'Adds bonus buffer GBs' },
                  { id: 'unlock_account', label: 'Unblock Client Account', desc: 'Sets status back to active' },
                  { id: 'reset_access', label: 'Reset Temporary Passcode', desc: 'Re-enables client sign-in' },
                  { id: 'activate_subscription', label: 'Activate Paid Tier', desc: 'Activates Prime or Pro' },
                ].map((act, idx) => (
                  <button
                    key={`desk-act-${act.id || 'a'}-${idx}`}
                    type="button"
                    onClick={() => setResolutionAction(act.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      resolutionAction === act.id
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold block">{act.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{act.desc}</span>
                  </button>
                ))}
              </div>

              {resolutionAction === 'grant_bonus' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Bonus Storage to Grant (GB)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bonusGB}
                    onChange={(e) => setBonusGB(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              )}

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Explanation for Client
                </label>
                <input
                  type="text"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="e.g. Quota recalculated and emergency buffer added"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedTicket(null);
                  setSelectedClient(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteSolution}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isProcessing ? 'Executing...' : 'Apply Fix & Close Ticket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
