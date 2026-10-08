import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { User, UserStatus } from '../../../types';
import { formatBytes } from '../../../utils/imageCompression';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  KeyRound,
  Zap,
  FolderGit2,
  DollarSign,
  Edit3,
  CheckCircle2,
  MoreVertical,
} from 'lucide-react';

interface OwnerClientsSectionProps {
  onTroubleshootClient: (client: User) => void;
  onResetClientPassword: (client: User) => void;
  onViewClientProjects?: (client: User) => void;
}

export const OwnerClientsSection: React.FC<OwnerClientsSectionProps> = ({
  onTroubleshootClient,
  onResetClientPassword,
}) => {
  const { users, updateUserStatus, addToast, clientProjects, invoices } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'community' | 'prime' | 'pro'>('all');

  const clientUsers = useMemo(() => {
    return users.filter((u) => !u.role || u.role === 'user');
  }, [users]);

  const filteredClients = useMemo(() => {
    return clientUsers.filter((u) => {
      const matchSearch =
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchPlan =
        planFilter === 'all' ||
        (planFilter === 'community' && (!u.plan || u.plan === 'free' || u.plan === 'community')) ||
        u.plan === planFilter;

      return matchSearch && matchStatus && matchPlan;
    });
  }, [clientUsers, search, statusFilter, planFilter]);

  const handleToggleStatus = (client: User) => {
    const newStatus: UserStatus = client.status === 'active' ? 'suspended' : 'active';
    updateUserStatus(client.id, newStatus);
    addToast('Client Status Updated', `Client ${client.full_name} status set to ${newStatus}.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Client & Customer Directory (کلائنٹ مینجمنٹ)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registered clients, storage limits, password resets, and problem troubleshooting.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
          Total: {clientUsers.length} Clients
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, email, or handle..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Plans</option>
            <option value="community">Community Free</option>
            <option value="prime">Prime ($4.99/mo)</option>
            <option value="pro">Pro ($9.99/mo)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Modern Client Data Table (Section 17 of spec) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Client Name & Profile</th>
                <th className="py-3.5 px-4">Email & Phone</th>
                <th className="py-3.5 px-4">Plan & Quota</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Projects</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClients.map((client, idx) => {
                const userProjects = clientProjects.filter(
                  (p) => p.client_id === client.id || p.client_name === client.full_name
                );
                const usedPct = Math.min(100, Math.round((client.storage_used / (client.storage_limit || 1)) * 100));

                return (
                  <tr key={`client-row-${client.id || client.user_id || 'u'}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={client.avatar_url}
                          alt={client.full_name}
                          className="w-9 h-9 rounded-xl object-cover bg-slate-200 ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {client.full_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            @{client.username || client.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-700 dark:text-slate-300 block">
                        {client.email}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {client.phone || '+1 (555) 019-2834'}
                      </span>
                    </td>

                    {/* Plan & Quota */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            client.plan === 'pro'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                              : client.plan === 'prime'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {client.plan || 'Free'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {usedPct}%
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 block">
                        {formatBytes(client.storage_used)} / {formatBytes(client.storage_limit)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          client.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>

                    {/* Projects */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                        {userProjects.length} Projects
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {client.created_at ? new Date(client.created_at).toLocaleDateString() : '2026-02-01'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onTroubleshootClient(client)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-bold transition-all flex items-center gap-1"
                          title="Troubleshoot & Fix Issues"
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Fix Quota</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onResetClientPassword(client)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Reset Client Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(client)}
                          className={`p-1.5 rounded-lg ${
                            client.status === 'active'
                              ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                          title={client.status === 'active' ? 'Suspend Client' : 'Activate Client'}
                        >
                          {client.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
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
    </div>
  );
};
