import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Plus,
  Shield,
  ShieldAlert,
  Trash2,
  Edit2,
  HardDrive,
  Check,
  X,
  UserCheck,
  UserX,
  Zap,
  Award,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  Crown,
  AlertCircle,
  HelpCircle,
  Sliders,
  FileText,
  Activity,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { User, UserRole, UserStatus, AdminPermission } from '../../types';

const ADMIN_PERM_LIST: { id: AdminPermission; label: string; desc: string }[] = [
  { id: 'manage_users', label: 'User & Client Management', desc: 'View clients, modify accounts and storage quotas' },
  { id: 'solve_client_issues', label: 'Client Problem Solving Desk', desc: 'Troubleshoot errors, grant emergency storage, reset access' },
  { id: 'manage_payments', label: 'Payments & Verification Desks', desc: 'Verify payment proofs, receipts, and invoices' },
  { id: 'manage_subscriptions', label: 'Subscriptions & Client Plans', desc: 'Manage subscriber plans, upgrades, and storage limits' },
  { id: 'manage_reports', label: 'Abuse Reports & Moderation', desc: 'Review flagged photos and handle takedowns' },
  { id: 'manage_cms', label: 'Website CMS & Announcements', desc: 'Edit homepage content and portal announcements' },
  { id: 'view_analytics', label: 'System Analytics & Audit Logs', desc: 'Audit traffic spikes, daily event logs' },
];

export const AdminUsersPage: React.FC = () => {
  const {
    currentUser,
    users,
    updateUserStatus,
    updateUserProfile,
    deleteUser,
    createUserAdmin,
    adminResetUserPassword,
    assignAdminRole,
    solveClientProblem,
    syncUsersFromDatabase,
    isSyncingUsers,
    navigateTo,
    confirm,
    addToast,
  } = useApp();

  useEffect(() => {
    syncUsersFromDatabase();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'owner'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');

  // Password Reveal & Reset Modal State
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [resetPasswordModalUser, setResetPasswordModalUser] = useState<User | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const openResetPasswordModal = (user: User) => {
    setResetPasswordModalUser(user);
    setNewResetPassword('');
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordModalUser || !newResetPassword.trim()) return;
    setIsResettingPassword(true);
    await adminResetUserPassword(resetPasswordModalUser.id, newResetPassword.trim());
    setIsResettingPassword(false);
    setResetPasswordModalUser(null);
    setNewResetPassword('');
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewResetPassword(pass);
  };

  // Modal for new user creation
  const [addUserModal, setAddUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newPlan, setNewPlan] = useState<'free' | 'pro' | 'business' | 'custom'>('pro');
  const [newQuotaMB, setNewQuotaMB] = useState(25600); // 25 GB for Pro

  // Modal for assigning plan / editing quota
  const [editingQuotaUser, setEditingQuotaUser] = useState<User | null>(null);
  const [assignPlan, setAssignPlan] = useState<'free' | 'pro' | 'business' | 'custom'>('pro');
  const [assignQuotaMB, setAssignQuotaMB] = useState(25600);

  // Modal for Assigning Role & Specific Permissions (Admin and Owner access)
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [roleModalRole, setRoleModalRole] = useState<UserRole>('user');
  const [roleModalPerms, setRoleModalPerms] = useState<AdminPermission[]>([
    'manage_users',
    'solve_client_issues',
    'manage_reports',
  ]);
  const [isSavingRole, setIsSavingRole] = useState(false);

  const openRoleModal = (u: User) => {
    setRoleModalUser(u);
    setRoleModalRole(u.role);
    setRoleModalPerms(
      u.admin_permissions && u.admin_permissions.length > 0
        ? u.admin_permissions
        : ['manage_users', 'solve_client_issues', 'manage_reports']
    );
  };

  const handleTogglePerm = (perm: AdminPermission) => {
    setRoleModalPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser) return;
    setIsSavingRole(true);
    try {
      await assignAdminRole(roleModalUser.id, roleModalRole, roleModalRole === 'admin' ? roleModalPerms : []);
      setRoleModalUser(null);
      await syncUsersFromDatabase();
    } finally {
      setIsSavingRole(false);
    }
  };

  // Modal for Troubleshooting & Solving Client Problem (Admin and Owner access)
  const [solveModalUser, setSolveModalUser] = useState<User | null>(null);
  const [solveAction, setSolveAction] = useState<string>('fix_quota');
  const [solveBonusGB, setSolveBonusGB] = useState<number>(5);
  const [solveNote, setSolveNote] = useState<string>('Client issue resolved directly from Admin desk.');
  const [isSolvingProblem, setIsSolvingProblem] = useState(false);

  const openSolveModal = (u: User) => {
    setSolveModalUser(u);
    setSolveAction('fix_quota');
    setSolveBonusGB(5);
    setSolveNote(`Resolved client issue for ${u.full_name}: Storage quota & access verified.`);
  };

  const handleExecuteSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solveModalUser) return;
    setIsSolvingProblem(true);
    try {
      await solveClientProblem(solveModalUser.id, solveAction, {
        bonusBytes: solveBonusGB * 1024 * 1024 * 1024,
        note: solveNote,
      });
      setSolveModalUser(null);
      await syncUsersFromDatabase();
    } finally {
      setIsSolvingProblem(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.full_name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handlePlanSelection = (
    plan: 'free' | 'pro' | 'business' | 'custom',
    target: 'new' | 'assign'
  ) => {
    let mb = 500;
    if (plan === 'free') mb = 500;
    else if (plan === 'pro') mb = 25600; // 25 GB
    else if (plan === 'business') mb = 102400; // 100 GB

    if (target === 'new') {
      setNewPlan(plan);
      if (plan !== 'custom') setNewQuotaMB(mb);
    } else {
      setAssignPlan(plan);
      if (plan !== 'custom') setAssignQuotaMB(mb);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim() || !newPassword) return;

    const planName =
      newPlan === 'pro'
        ? 'Pro Creator (25 GB)'
        : newPlan === 'business'
        ? 'Business Studio (100 GB)'
        : newPlan === 'free'
        ? 'Free Starter (500 MB)'
        : `Custom Plan (${(newQuotaMB / 1024).toFixed(1)} GB)`;

    createUserAdmin({
      full_name: newFullName.trim(),
      email: newEmail.trim(),
      role: newRole,
      storage_limit_mb: newQuotaMB,
      plan: newPlan,
      plan_name: planName,
      password: newPassword,
    });

    setAddUserModal(false);
    setNewFullName('');
    setNewEmail('');
    setNewPassword('');
    setNewPlan('pro');
    setNewQuotaMB(25600);
  };

  const handleToggleStatus = (u: User) => {
    const nextStatus: UserStatus = u.status === 'active' ? 'banned' : 'active';
    confirm({
      title: `${nextStatus === 'banned' ? 'Ban' : 'Unban'} User "${u.full_name}"?`,
      message:
        nextStatus === 'banned'
          ? 'Banning this user will block their login and hide their images from public sharing.'
          : 'Reactivate this user account?',
      confirmLabel: nextStatus === 'banned' ? 'Ban User' : 'Unban User',
      isDestructive: nextStatus === 'banned',
      onConfirm: () => {
        updateUserStatus(u.id, nextStatus);
      },
    });
  };

  const handleToggleRole = (u: User) => {
    const nextRole: UserRole = u.role === 'admin' ? 'user' : 'admin';
    confirm({
      title: `Change Role to ${nextRole.toUpperCase()}?`,
      message: `Are you sure you want to change ${u.full_name}'s permissions to ${nextRole}?`,
      confirmLabel: 'Confirm Role Change',
      onConfirm: () => {
        updateUserProfile(u.id, { role: nextRole });
      },
    });
  };

  const handleDeleteUser = (u: User) => {
    confirm({
      title: `Delete User "${u.full_name}"?`,
      message: `This will permanently wipe this user and all of their uploaded images and folders from the database.`,
      confirmLabel: 'Delete User & Data',
      isDestructive: true,
      onConfirm: () => {
        deleteUser(u.id);
      },
    });
  };

  const openAssignPlanModal = (u: User) => {
    setEditingQuotaUser(u);
    const mb = Math.round(u.storage_limit / (1024 * 1024));
    setAssignQuotaMB(mb);
    if (u.plan === 'pro' || (mb >= 20000 && mb < 60000)) {
      setAssignPlan('pro');
    } else if (u.plan === 'business' || mb >= 60000) {
      setAssignPlan('business');
    } else if (u.plan === 'free' || u.plan === 'community' || mb <= 600) {
      setAssignPlan('free');
    } else {
      setAssignPlan('custom');
    }
  };

  const handleSavePlanAndQuota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuotaUser) return;

    const planName =
      assignPlan === 'pro'
        ? 'Pro Creator (25 GB)'
        : assignPlan === 'business'
        ? 'Business Studio (100 GB)'
        : assignPlan === 'free'
        ? 'Free Starter (500 MB)'
        : `Custom Plan (${(assignQuotaMB / 1024).toFixed(1)} GB)`;

    updateUserProfile(editingQuotaUser.id, {
      storage_limit: assignQuotaMB * 1024 * 1024,
      plan: assignPlan,
      plan_name: planName,
    });

    addToast(
      'Storage & Plan Assigned',
      `Assigned ${planName} (${(assignQuotaMB / 1024).toFixed(1)} GB) to ${editingQuotaUser.full_name} successfully!`,
      'success'
    );
    setEditingQuotaUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Management ({filteredUsers.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View accounts, ban or reactivate users, assign roles, and adjust storage allocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={async () => {
              await syncUsersFromDatabase();
              addToast('Database Synced', 'User list refreshed from cloud database.', 'success');
            }}
            disabled={isSyncingUsers}
            title="Refresh user accounts from the PostgreSQL database"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingUsers ? 'animate-spin text-purple-600' : ''}`} />
            <span>{isSyncingUsers ? 'Syncing...' : 'Sync Database'}</span>
          </button>

          <button
            onClick={() => setAddUserModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
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
            placeholder="Search by user name or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Roles</option>
            <option value="user">Regular Users</option>
            <option value="admin">Platform Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="banned">Banned Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">User Profile</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Password / Credentials</th>
                <th className="p-3">Plan & Storage Quota</th>
                <th className="p-3">Joined Date</th>
                <th className="p-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u, idx) => {
                const limitGB = u.storage_limit / (1024 * 1024 * 1024);
                const isPro = u.plan === 'pro' || (limitGB >= 20 && limitGB < 60);
                const isBusiness = u.plan === 'business' || limitGB >= 60;

                return (
                  <tr key={`user-row-${u.id || u.user_id || 'u'}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={u.full_name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.full_name}</span>
                            {u.role === 'admin' && (
                              <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {u.role === 'owner' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs">
                          <Crown className="w-3 h-3 fill-current" />
                          <span>Owner</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openRoleModal(u)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 hover:bg-purple-200'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                          title="Assign Role & Permissions (کردار تفویض کریں)"
                        >
                          <Shield className="w-2.5 h-2.5" />
                          <span>{u.role}</span>
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-colors ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100'
                        }`}
                        title="Click to toggle active/banned status"
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="select-all">
                            {revealedPasswords[u.id]
                              ? (u.password || u.passcode || 'demo123')
                              : '••••••••'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => togglePasswordReveal(u.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                          title={revealedPasswords[u.id] ? 'Hide Password' : 'Show Password'}
                        >
                          {revealedPasswords[u.id] ? (
                            <EyeOff className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => openResetPasswordModal(u)}
                          className="px-2 py-1 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors flex items-center gap-1"
                          title="Reset or Change User Password"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {isBusiness ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <Award className="w-3 h-3" />
                              <span>Business (100 GB)</span>
                            </span>
                          ) : isPro ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                              <Zap className="w-3 h-3" />
                              <span>Pro Plan (25 GB)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              <span>Free (500 MB)</span>
                            </span>
                          )}

                          <button
                            onClick={() => openAssignPlanModal(u)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 transition-colors flex items-center gap-1"
                            title="Assign Plan or Storage Quota"
                          >
                            <HardDrive className="w-3 h-3" />
                            <span>Assign Plan</span>
                          </button>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          {(u.storage_used / (1024 * 1024)).toFixed(1)} MB / {limitGB.toFixed(1)} GB
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openSolveModal(u)}
                          className="px-2 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Solve Client Problem (مسئلہ حل کریں)"
                        >
                          <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Solve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openResetPasswordModal(u)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          title="Reset User Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openAssignPlanModal(u)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors"
                          title="Assign Storage & Plan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'active'
                              ? 'text-slate-400 hover:text-amber-600'
                              : 'text-emerald-500 hover:bg-emerald-50'
                          }`}
                          title={u.status === 'active' ? 'Ban User' : 'Activate User'}
                        >
                          {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create User Account & Assign Storage
                </h3>
                <p className="text-xs text-slate-400">
                  Provision client account with designated storage tier immediately.
                </p>
              </div>
              <button
                onClick={() => setAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Client Full Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="e.g. client123"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="user">Client User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Plan Selection presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Storage Tier Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlanSelection('free', 'new')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newPlan === 'free'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Free Starter</div>
                    <div className="text-[10px] text-slate-400">500 MB Storage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanSelection('pro', 'new')}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      newPlan === 'pro'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <Zap className="w-3 h-3 text-purple-600" />
                      <span>Pro Creator</span>
                    </div>
                    <div className="text-[10px] text-purple-600 font-semibold">25 GB Storage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanSelection('business', 'new')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newPlan === 'business'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" />
                      <span>Business</span>
                    </div>
                    <div className="text-[10px] text-amber-600 font-semibold">100 GB Storage</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Storage Allocation (MB)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={newQuotaMB}
                    onChange={(e) => {
                      setNewQuotaMB(Number(e.target.value));
                      setNewPlan('custom');
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-xs font-bold text-purple-600 shrink-0">
                    = {(newQuotaMB / 1024).toFixed(1)} GB
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddUserModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm"
                >
                  Create & Assign Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Plan & Storage Quota Modal for Existing User */}
      {editingQuotaUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Assign Storage Plan
                </h3>
                <p className="text-xs text-slate-400">
                  {editingQuotaUser.full_name} ({editingQuotaUser.email})
                </p>
              </div>
              <button
                onClick={() => setEditingQuotaUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlanAndQuota} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Plan to Assign
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlanSelection('free', 'assign')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      assignPlan === 'free'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Free Starter</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">500 MB Storage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanSelection('pro', 'assign')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      assignPlan === 'pro'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                      <span>Pro Plan</span>
                    </div>
                    <div className="text-[10px] text-purple-600 font-semibold mt-0.5">25 GB Storage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanSelection('business', 'assign')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      assignPlan === 'business'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Business</span>
                    </div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5">100 GB Storage</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Storage Quota (MB)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={assignQuotaMB}
                    onChange={(e) => {
                      setAssignQuotaMB(Number(e.target.value));
                      setAssignPlan('custom');
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-xs font-bold text-purple-600 shrink-0">
                    = {(assignQuotaMB / 1024).toFixed(1)} GB
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Current Usage: {(editingQuotaUser.storage_used / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingQuotaUser(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm"
                >
                  Save & Assign Storage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset User Password Modal */}
      {resetPasswordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Reset User Password
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Account: {resetPasswordModalUser.full_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordModalUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="mt-4 space-y-4">
              {/* Credentials summary */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">User Email:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {resetPasswordModalUser.email}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Current Password:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50">
                    {resetPasswordModalUser.password || resetPasswordModalUser.passcode || 'demo123'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="Enter or generate new password..."
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Password will be updated in the database and user can immediately log in with this new password.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPasswordModalUser(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword || !newResetPassword.trim()}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isResettingPassword ? 'Updating...' : 'Save & Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role & Permissions Modal (Admin and Owner access) */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Assign Role & Permissions (کردار تفویض کریں)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    User: {roleModalUser.full_name} ({roleModalUser.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="mt-4 space-y-4">
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Account Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRoleModalRole('user')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      roleModalRole === 'user'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Client / User</span>
                      {roleModalRole === 'user' && <Check className="w-4 h-4 text-purple-600" />}
                    </div>
                    <span className="text-[10px] text-slate-400">Regular cloud subscriber</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoleModalRole('admin')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      roleModalRole === 'admin'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        Administrator
                      </span>
                      {roleModalRole === 'admin' && <Check className="w-4 h-4 text-purple-600" />}
                    </div>
                    <span className="text-[10px] text-slate-400">Has management roles</span>
                  </button>

                  {currentUser?.role === 'owner' && (
                    <button
                      type="button"
                      onClick={() => setRoleModalRole('owner')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        roleModalRole === 'owner'
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1 text-amber-600">
                          <Crown className="w-3.5 h-3.5 fill-amber-500" />
                          Owner (Root)
                        </span>
                        {roleModalRole === 'owner' && <Check className="w-4 h-4 text-amber-500" />}
                      </div>
                      <span className="text-[10px] text-slate-400">Full website access</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Permissions for Admin */}
              {roleModalRole === 'admin' && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Specific Admin Permissions (اختیارات)
                    </label>
                    <button
                      type="button"
                      onClick={() => setRoleModalPerms(ADMIN_PERM_LIST.map((p) => p.id))}
                      className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {ADMIN_PERM_LIST.map((p) => {
                      const active = roleModalPerms.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleTogglePerm(p.id)}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            active
                              ? 'border-purple-300 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/20'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-purple-600 pointer-events-none"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                              {p.label}
                            </p>
                            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                              {p.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRole}
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingRole ? 'Saving...' : 'Save Role & Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Troubleshoot & Solve Client Problem Modal (Admin and Owner access) */}
      {solveModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Solve Client Problem (کلائنٹ کا مسئلہ حل کریں)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Client: {solveModalUser.full_name} ({solveModalUser.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSolveModalUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteSolve} className="mt-4 space-y-4">
              {/* Client Status Bar */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">Current Plan:</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {solveModalUser.plan || 'Free'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Storage Used:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {(solveModalUser.storage_used / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Status:</span>
                  <span
                    className={`font-bold capitalize ${
                      solveModalUser.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {solveModalUser.status}
                  </span>
                </div>
              </div>

              {/* Resolution Action */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Problem Resolution Action
                </label>
                <select
                  value={solveAction}
                  onChange={(e) => setSolveAction(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="fix_quota">1. Fix Quota Limit (Restore full capacity for plan)</option>
                  <option value="grant_bonus">2. Grant Emergency Bonus Storage (+GB)</option>
                  <option value="unlock_account">3. Unlock & Reactivate Account (Unban/Unsuspend)</option>
                  <option value="activate_subscription">4. Force Activate Subscription (Mark Paid)</option>
                  <option value="reset_access">5. Reset Login Access & Clear Corrupt Sessions</option>
                </select>
              </div>

              {/* Bonus GB Picker */}
              {solveAction === 'grant_bonus' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Emergency Bonus Storage to Add
                  </label>
                  <div className="flex items-center gap-2">
                    {[2, 5, 10, 20].map((gb) => (
                      <button
                        key={gb}
                        type="button"
                        onClick={() => setSolveBonusGB(gb)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          solveBonusGB === gb
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        +{gb} GB
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Resolution Note / Action Log
                </label>
                <textarea
                  rows={2}
                  value={solveNote}
                  onChange={(e) => setSolveNote(e.target.value)}
                  placeholder="Describe resolution for audit logs..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => navigateTo('admin-clients-desk')}
                  className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Client Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSolveModalUser(null)}
                    className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSolvingProblem}
                    className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSolvingProblem ? 'Resolving...' : 'Apply Fix & Resolve'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
