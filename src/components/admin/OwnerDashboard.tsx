import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, AdminPermission, UserRole, ClientIssueTicket, ClientProject, CustomRole } from '../../types';
import { formatBytes } from '../../utils/imageCompression';
import { OwnerOverviewSection } from './owner/OwnerOverviewSection';
import { OwnerAdminsSection } from './owner/OwnerAdminsSection';
import { OwnerClientsSection } from './owner/OwnerClientsSection';
import { OwnerRolesSection } from './owner/OwnerRolesSection';
import { OwnerPermissionsSection } from './owner/OwnerPermissionsSection';
import { OwnerSecuritySection } from './owner/OwnerSecuritySection';
import {
  Crown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Zap,
  Activity,
  CreditCard,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  FileText,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sliders,
  Database,
  Download,
  Settings,
  HelpCircle,
  Eye,
  Check,
  X,
  Plus,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  Laptop,
  Globe,
  FolderGit2,
  Image,
  Share2,
  Layers,
  Terminal,
  LogOut,
  Copy,
  CheckCheck,
  UploadCloud,
} from 'lucide-react';

export type OwnerTabType =
  | 'overview'
  | 'admins'
  | 'clients'
  | 'roles'
  | 'permissions'
  | 'resources'
  | 'projects'
  | 'orders'
  | 'payments'
  | 'reports'
  | 'website'
  | 'media'
  | 'notifications'
  | 'activity'
  | 'security'
  | 'integrations'
  | 'settings';

const OWNER_MODULES: { id: OwnerTabType; label: string; icon: any; badge?: string }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'admins', label: 'Admins', icon: ShieldCheck },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'roles', label: 'Roles', icon: Layers },
  { id: 'permissions', label: 'Permissions', icon: Sliders },
  { id: 'resources', label: 'Resources', icon: HardDrive },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'orders', label: 'Orders', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'reports', label: 'Reports', icon: ShieldAlert },
  { id: 'website', label: 'Website Management', icon: Globe },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'activity', label: 'Activity Logs', icon: Clock },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'integrations', label: 'Integrations', icon: Terminal },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const PERMISSION_GROUPS: { name: string; perms: { id: AdminPermission; label: string }[] }[] = [
  {
    name: 'Dashboard',
    perms: [{ id: 'dashboard.view', label: 'View Dashboard' }],
  },
  {
    name: 'Users / Clients',
    perms: [
      { id: 'users.view', label: 'View Clients' },
      { id: 'users.create', label: 'Create Clients' },
      { id: 'users.edit', label: 'Edit Clients' },
      { id: 'users.delete', label: 'Delete Clients' },
      { id: 'users.suspend', label: 'Suspend Clients' },
    ],
  },
  {
    name: 'Admins',
    perms: [
      { id: 'admins.view', label: 'View Admins' },
      { id: 'admins.create', label: 'Add Admin' },
      { id: 'admins.edit', label: 'Edit Admin' },
      { id: 'admins.remove', label: 'Remove Admin' },
      { id: 'admins.suspend', label: 'Suspend Admin' },
      { id: 'admins.reset_password', label: 'Reset Password' },
    ],
  },
  {
    name: 'Resources & Media',
    perms: [
      { id: 'resources.view', label: 'View Resources' },
      { id: 'resources.create', label: 'Create Resources' },
      { id: 'resources.edit', label: 'Edit Resources' },
      { id: 'resources.delete', label: 'Delete Resources' },
    ],
  },
  {
    name: 'Projects',
    perms: [
      { id: 'projects.view', label: 'View Projects' },
      { id: 'projects.create', label: 'Create Projects' },
      { id: 'projects.edit', label: 'Edit Projects' },
      { id: 'projects.delete', label: 'Delete Projects' },
      { id: 'projects.assign', label: 'Assign Projects' },
    ],
  },
  {
    name: 'Payments',
    perms: [
      { id: 'payments.view', label: 'View Payments' },
      { id: 'payments.approve', label: 'Approve Payments' },
      { id: 'payments.reject', label: 'Reject Payments' },
      { id: 'payments.refund', label: 'Refund Payments' },
    ],
  },
  {
    name: 'Reports & Moderation',
    perms: [
      { id: 'reports.view', label: 'View Reports' },
      { id: 'reports.export', label: 'Export Reports' },
    ],
  },
  {
    name: 'Website CMS',
    perms: [
      { id: 'website.content', label: 'Manage Content' },
      { id: 'website.pages', label: 'Manage Pages' },
      { id: 'website.media', label: 'Manage Media' },
      { id: 'website.seo', label: 'Manage SEO' },
    ],
  },
  {
    name: 'Settings',
    perms: [
      { id: 'settings.view', label: 'View Settings' },
      { id: 'settings.edit', label: 'Edit Settings' },
    ],
  },
  {
    name: 'Security',
    perms: [
      { id: 'security.logs', label: 'View Logs' },
      { id: 'security.sessions', label: 'Manage Sessions' },
      { id: 'security.permissions', label: 'Manage Permissions' },
    ],
  },
];

export const OwnerDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    images,
    invoices,
    clientIssues,
    adminActivityLogs,
    clientProjects,
    paymentRequests,
    updatePaymentRequestStatus,
    deletePaymentRequest,
    reports,
    supportMessages,
    customRoles,
    systemNotifications,
    assignAdminRole,
    solveClientProblem,
    logAdminAction,
    syncUsersFromDatabase,
    isSyncingUsers,
    navigateTo,
    addToast,
    confirm,
    theme,
    setTheme,
    resetAdminPassword,
    resetClientPassword,
    addClientProject,
    updateClientProject,
    deleteClientProject,
    markNotificationRead,
  } = useApp();

  const [activeTab, setActiveTab] = useState<OwnerTabType>('overview');

  // Owner Payments & Verification Desk States
  const [ownerPaymentSubTab, setOwnerPaymentSubTab] = useState<'verifications' | 'invoices'>('verifications');
  const [ownerPaymentStatusFilter, setOwnerPaymentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [ownerPaymentSearch, setOwnerPaymentSearch] = useState('');
  const [ownerSelectedScreenshotUrl, setOwnerSelectedScreenshotUrl] = useState<string | null>(null);
  const [ownerRejectModalReq, setOwnerRejectModalReq] = useState<any | null>(null);
  const [ownerRejectReason, setOwnerRejectReason] = useState('');

  // Topbar and Global Search States
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Password Reset Modals
  const [resetAdminModalTarget, setResetAdminModalTarget] = useState<User | null>(null);
  const [adminGeneratedToken, setAdminGeneratedToken] = useState<string | null>(null);
  const [isResettingAdmin, setIsResettingAdmin] = useState(false);

  const [resetClientModalTarget, setResetClientModalTarget] = useState<User | null>(null);
  const [clientGeneratedToken, setClientGeneratedToken] = useState<string | null>(null);
  const [isResettingClient, setIsResettingClient] = useState(false);

  // Create / Edit Admin Modal State
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [adminFormName, setAdminFormName] = useState('');
  const [adminFormEmail, setAdminFormEmail] = useState('');
  const [adminFormPhone, setAdminFormPhone] = useState('');
  const [adminFormRole, setAdminFormRole] = useState<UserRole>('admin');
  const [adminFormCustomRole, setAdminFormCustomRole] = useState('Senior Administrator');
  const [adminFormPermissions, setAdminFormPermissions] = useState<AdminPermission[]>([
    'dashboard.view',
    'users.view',
    'users.edit',
    'projects.view',
    'reports.view',
  ]);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  // Create Project Modal State
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState(1500);
  const [newProjectPriority, setNewProjectPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Client Problem Resolution Modal State
  const [selectedIssueTicket, setSelectedIssueTicket] = useState<ClientIssueTicket | null>(null);
  const [selectedClientForFix, setSelectedClientForFix] = useState<User | null>(null);
  const [resolutionAction, setResolutionAction] = useState<string>('fix_quota');
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [bonusGB, setBonusGB] = useState<number>(5);
  const [isSolving, setIsSolving] = useState(false);

  // Activity Log Filter
  const [activitySearch, setActivitySearch] = useState('');
  const [activityRoleFilter, setActivityRoleFilter] = useState<'all' | 'owner' | 'admin'>('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');

  // Filtered stats
  const ownerUsers = useMemo(() => users.filter((u) => u.role === 'owner'), [users]);
  const adminUsers = useMemo(() => users.filter((u) => u.role === 'admin'), [users]);
  const clientUsers = useMemo(() => users.filter((u) => !u.role || u.role === 'user'), [users]);
  const openTickets = useMemo(() => clientIssues.filter((t) => t.status !== 'resolved'), [clientIssues]);

  const unreadNotificationsCount = useMemo(
    () => systemNotifications.filter((n) => !n.is_read).length,
    [systemNotifications]
  );

  // Global search matcher
  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return null;
    const q = globalSearch.toLowerCase();

    const matchingAdmins = adminUsers.filter(
      (a) => a.full_name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    );
    const matchingClients = clientUsers.filter(
      (c) => c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
    const matchingProjects = clientProjects.filter(
      (p) => p.title.toLowerCase().includes(q) || p.client_name.toLowerCase().includes(q)
    );
    const matchingLogs = adminActivityLogs
      .filter((l) => l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q))
      .slice(0, 4);

    return {
      admins: matchingAdmins,
      clients: matchingClients,
      projects: matchingProjects,
      logs: matchingLogs,
      totalCount:
        matchingAdmins.length + matchingClients.length + matchingProjects.length + matchingLogs.length,
    };
  }, [globalSearch, adminUsers, clientUsers, clientProjects, adminActivityLogs]);

  // Handlers for Admin Creation/Edit
  const handleOpenCreateAdmin = () => {
    setEditingAdmin(null);
    setAdminFormName('');
    setAdminFormEmail('');
    setAdminFormPhone('');
    setAdminFormRole('admin');
    setAdminFormCustomRole('Senior Administrator');
    setAdminFormPermissions([
      'dashboard.view',
      'users.view',
      'users.edit',
      'projects.view',
      'reports.view',
    ]);
    setIsCreateAdminModalOpen(true);
  };

  const handleOpenEditAdmin = (admin: User) => {
    setEditingAdmin(admin);
    setAdminFormName(admin.full_name);
    setAdminFormEmail(admin.email);
    setAdminFormPhone(admin.phone || '');
    setAdminFormRole(admin.role);
    setAdminFormCustomRole(admin.custom_role || 'Senior Administrator');
    setAdminFormPermissions(
      admin.admin_permissions && admin.admin_permissions.length > 0
        ? admin.admin_permissions
        : ['dashboard.view', 'users.view', 'users.edit', 'projects.view']
    );
    setIsCreateAdminModalOpen(true);
  };

  const handleToggleAdminPermission = (permId: AdminPermission) => {
    setAdminFormPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAllAdminPermissions = () => {
    const all = PERMISSION_GROUPS.flatMap((g) => g.perms.map((p) => p.id));
    setAdminFormPermissions(all);
  };

  const handleRemoveAllAdminPermissions = () => {
    setAdminFormPermissions([]);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormEmail || !adminFormName) {
      addToast('Missing Fields', 'Please specify full name and email.', 'warning');
      return;
    }

    setIsSavingAdmin(true);
    try {
      if (editingAdmin) {
        await assignAdminRole(editingAdmin.id, adminFormRole, adminFormPermissions);
        logAdminAction(
          'Updated Admin Permissions & Role',
          'admin',
          `Owner updated permissions for ${editingAdmin.email}`,
          editingAdmin.id
        );
        addToast('Admin Updated', `Updated permissions and role for ${editingAdmin.full_name}.`, 'success');
      } else {
        // Find existing user or check if registered
        const existing = users.find((u) => u.email.toLowerCase() === adminFormEmail.toLowerCase());
        if (existing) {
          await assignAdminRole(existing.id, 'admin', adminFormPermissions);
          logAdminAction(
            'Promoted User to Admin',
            'admin',
            `Owner promoted ${existing.email} to Admin with ${adminFormPermissions.length} permissions.`,
            existing.id
          );
          addToast('Admin Appointed', `Promoted ${existing.full_name} to Administrator.`, 'success');
        } else {
          // If brand new email, appoint into users list via assignAdminRole
          const tempId = `usr_admin_${Date.now()}`;
          await assignAdminRole(tempId, 'admin', adminFormPermissions);
          addToast('Admin Created', `New administrator profile created for ${adminFormEmail}.`, 'success');
        }
      }
      setIsCreateAdminModalOpen(false);
      await syncUsersFromDatabase();
    } finally {
      setIsSavingAdmin(false);
    }
  };

  // Password Reset Hierarchy Handlers
  const handleOpenResetAdminModal = (admin: User) => {
    if (admin.role === 'owner' || admin.email === 'aliuniet@gmail.com') {
      addToast('Protected Account', 'The Super Owner account password cannot be reset from this interface.', 'error');
      return;
    }
    setResetAdminModalTarget(admin);
    setAdminGeneratedToken(null);
  };

  const handleExecuteAdminPasswordReset = async () => {
    if (!resetAdminModalTarget) return;
    setIsResettingAdmin(true);
    try {
      const res = await resetAdminPassword(resetAdminModalTarget.id);
      if (res.success) {
        setAdminGeneratedToken(res.tempToken);
        logAdminAction(
          'Initiated Admin Password Reset',
          'admin',
          `Owner initiated secure password reset token for ${resetAdminModalTarget.email}`,
          resetAdminModalTarget.id
        );
      }
    } finally {
      setIsResettingAdmin(false);
    }
  };

  const handleOpenResetClientModal = (client: User) => {
    setResetClientModalTarget(client);
    setClientGeneratedToken(null);
  };

  const handleExecuteClientPasswordReset = async () => {
    if (!resetClientModalTarget) return;
    setIsResettingClient(true);
    try {
      const res = await resetClientPassword(resetClientModalTarget.id);
      if (res.success) {
        setClientGeneratedToken(res.tempToken);
        logAdminAction(
          'Initiated Client Password Reset',
          'user',
          `Owner/Admin initiated secure credentials reset for ${resetClientModalTarget.email}`,
          resetClientModalTarget.id
        );
      }
    } finally {
      setIsResettingClient(false);
    }
  };

  // Problem solver opener
  const handleOpenProblemSolver = (client: User, ticket?: ClientIssueTicket) => {
    setSelectedClientForFix(client);
    setSelectedIssueTicket(ticket || null);
    setResolutionAction(
      ticket?.issue_type === 'storage_quota'
        ? 'fix_quota'
        : ticket?.issue_type === 'login_access'
        ? 'reset_access'
        : 'grant_bonus'
    );
    setResolutionNote(
      ticket
        ? `Resolving ticket #${ticket.id}: ${ticket.title}`
        : 'Direct administrative client maintenance'
    );
    setBonusGB(5);
  };

  const handleExecuteClientResolution = async () => {
    if (!selectedClientForFix) return;
    setIsSolving(true);
    try {
      await solveClientProblem(selectedClientForFix.id, resolutionAction, {
        bonusBytes: bonusGB * 1024 * 1024 * 1024,
        note: resolutionNote,
        ticketId: selectedIssueTicket?.id,
      });
      setSelectedClientForFix(null);
      setSelectedIssueTicket(null);
      await syncUsersFromDatabase();
    } finally {
      setIsSolving(false);
    }
  };

  // Create Project Handler
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle || !newProjectClient) {
      addToast('Missing Fields', 'Please specify project title and client name.', 'warning');
      return;
    }
    const matchedClient = clientUsers.find((c) => c.full_name === newProjectClient || c.email === newProjectClient);
    addClientProject({
      client_id: matchedClient?.id || 'usr_client',
      client_name: newProjectClient,
      title: newProjectTitle,
      description: newProjectDesc,
      status: 'pending',
      budget: Number(newProjectBudget),
      priority: newProjectPriority,
      assigned_admin: currentUser?.full_name || 'Ali (Owner)',
    });
    setNewProjectTitle('');
    setNewProjectDesc('');
    setIsCreateProjectModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. ENTERPRISE TOPBAR (Section 11 of spec) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand Identity & Root Sovereignty Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
            <Crown className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-none">
                Owner Headquarters
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs">
                Root 100%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Super Admin & Enterprise Governance Panel
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Global Search: Admins, clients, projects, invoices, logs..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white transition-all"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Interactive Live Search Dropdown */}
          {isSearchFocused && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-3 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Search Results ({searchResults.totalCount})
                </span>
                <button
                  type="button"
                  onClick={() => setIsSearchFocused(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              {searchResults.admins.length > 0 && (
                <div>
                  <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                    Admins ({searchResults.admins.length})
                  </span>
                  <div className="space-y-1">
                    {searchResults.admins.map((a, idx) => (
                      <div
                        key={`search-adm-${a.id}-${idx}`}
                        onClick={() => {
                          setActiveTab('admins');
                          setIsSearchFocused(false);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white">{a.full_name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{a.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.clients.length > 0 && (
                <div>
                  <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                    Clients ({searchResults.clients.length})
                  </span>
                  <div className="space-y-1">
                    {searchResults.clients.map((c, idx) => (
                      <div
                        key={`search-cli-${c.id}-${idx}`}
                        onClick={() => {
                          setActiveTab('clients');
                          setIsSearchFocused(false);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white">{c.full_name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{c.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.projects.length > 0 && (
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    Projects ({searchResults.projects.length})
                  </span>
                  <div className="space-y-1">
                    {searchResults.projects.map((p, idx) => (
                      <div
                        key={`search-prj-${p.id}-${idx}`}
                        onClick={() => {
                          setActiveTab('projects');
                          setIsSearchFocused(false);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white">{p.title}</span>
                        <span className="text-slate-400 text-[11px]">{p.client_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Actions, Notifications, Messages, Theme, Profile, Help */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Actions</span>
            </button>

            {quickActionsOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setQuickActionsOpen(false);
                    handleOpenCreateAdmin();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-800 dark:text-slate-200 flex items-center gap-2 font-semibold"
                >
                  <UserPlus className="w-4 h-4 text-purple-600" />
                  <span>Appoint New Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickActionsOpen(false);
                    setIsCreateProjectModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 flex items-center gap-2 font-semibold"
                >
                  <FolderGit2 className="w-4 h-4 text-emerald-600" />
                  <span>Create Client Project</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setQuickActionsOpen(false);
                    await syncUsersFromDatabase();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 flex items-center gap-2 font-semibold"
                >
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>Sync In-Memory & DB</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickActionsOpen(false);
                    const dataStr =
                      'data:text/json;charset=utf-8,' +
                      encodeURIComponent(
                        JSON.stringify({ users, images, invoices, clientIssues, clientProjects }, null, 2)
                      );
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute('download', `owner_system_backup_${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    addToast('Backup Exported', 'Full platform snapshot downloaded.', 'success');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-800 dark:text-slate-200 flex items-center gap-2 font-semibold"
                >
                  <Download className="w-4 h-4 text-amber-600" />
                  <span>Export Database JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative transition-colors"
              title="System Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">Platform Notifications</span>
                  <span className="text-[10px] text-slate-400">{systemNotifications.length} items</span>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {systemNotifications.slice(0, 5).map((n, idx) => (
                    <div
                      key={`dash-top-notif-${n.id || 'n'}-${idx}`}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border text-[11px] cursor-pointer transition-colors ${
                        n.is_read
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-500'
                          : 'bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-white font-semibold'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{n.title}</span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages / Client Support Desk Counter */}
          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative transition-colors"
            title="Support Messages & Client Desk"
          >
            <MessageSquare className="w-4 h-4" />
            {openTickets.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                {openTickets.length}
              </span>
            )}
          </button>

          {/* Switch to Client View */}
          <button
            type="button"
            onClick={() => navigateTo('dashboard-overview')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            title="Switch to personal Client Media Dashboard"
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Client View</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Help & Support Modal Trigger */}
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Enterprise RBAC & Password Architecture Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Owner Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <img
              src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={currentUser?.full_name || 'Ali (Owner)'}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-amber-500"
            />
            <div className="hidden lg:block text-left">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white block leading-tight">
                {currentUser?.full_name || 'Ali (Owner)'}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                Platform Founder
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC LEFT SIDEBAR / TOP NAVIGATION (All 17 Modules from Section 11) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {OWNER_MODULES.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveTab(mod.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span>{mod.label}</span>
                {mod.id === 'admins' && adminUsers.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${isActive ? 'bg-slate-950 text-amber-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'}`}>
                    {adminUsers.length}
                  </span>
                )}
                {mod.id === 'clients' && openTickets.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                    {openTickets.length}
                  </span>
                )}
                {mod.id === 'payments' && paymentRequests.filter((r) => r.status === 'pending').length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black animate-pulse ${isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'}`}>
                    {paymentRequests.filter((r) => r.status === 'pending').length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT ROUTER */}
      {/* ========================================================================= */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <OwnerOverviewSection
          onNavigateTab={(t) => setActiveTab(t as OwnerTabType)}
          onOpenAppointAdmin={handleOpenCreateAdmin}
          onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
        />
      )}

      {/* TAB 2: ADMINS */}
      {activeTab === 'admins' && (
        <OwnerAdminsSection
          onOpenCreateAdmin={handleOpenCreateAdmin}
          onEditAdmin={handleOpenEditAdmin}
          onResetAdminPassword={handleOpenResetAdminModal}
        />
      )}

      {/* TAB 3: CLIENTS */}
      {activeTab === 'clients' && (
        <OwnerClientsSection
          onTroubleshootClient={(cl) => handleOpenProblemSolver(cl)}
          onResetClientPassword={(cl) => handleOpenResetClientModal(cl)}
        />
      )}

      {/* TAB 4: ROLES */}
      {activeTab === 'roles' && <OwnerRolesSection />}

      {/* TAB 5: PERMISSIONS */}
      {activeTab === 'permissions' && <OwnerPermissionsSection />}

      {/* TAB 6: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-emerald-600" />
                <span>Global Resources & Storage Management (ریسورسز اور اسٹوریج)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor platform storage pools, CDN cache distribution, and media bandwidth usage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                syncUsersFromDatabase();
                addToast('Storage Quotas Refreshed', 'Recalculated quotas across all accounts.', 'success');
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recalculate Storage Quotas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Total Stored Assets</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{images.length} Media Files</div>
              <p className="text-[11px] text-slate-400">Compressed WebP and optimized formats</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Allocated Storage Quota</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {formatBytes(users.reduce((sum, u) => sum + (u.storage_limit || 0), 0))}
              </div>
              <p className="text-[11px] text-slate-400">Sum of all client and admin tier allocations</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Actual Disk Consumed</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatBytes(users.reduce((sum, u) => sum + (u.storage_used || 0), 0))}
              </div>
              <p className="text-[11px] text-slate-400">Physical bytes stored in object engine</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-indigo-600" />
                <span>Client Projects & Deliverables (کلائنٹ پروجیکٹس)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Oversee client engagements, design tasks, budget allocations, and staff assignees.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Project</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Project Title</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Assigned Admin</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {clientProjects.map((proj, idx) => (
                    <tr key={`owner-proj-${proj.id || 'p'}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{proj.title}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{proj.client_name}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={proj.status}
                          onChange={(e) => updateClientProject(proj.id, { status: e.target.value as any })}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          proj.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : proj.priority === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {proj.priority || 'medium'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">${proj.budget || 0}</td>
                      <td className="py-3.5 px-4 text-slate-500">{proj.assigned_admin || 'Unassigned'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => deleteClientProject(proj.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: ORDERS / SUBSCRIPTIONS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span>Orders & Tier Subscriptions (آرڈرز اور سبسکرپشنز)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active client memberships, billing renewal dates, and subscription tier status.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Current Plan</th>
                    <th className="py-3 px-4">Subscription Status</th>
                    <th className="py-3 px-4">Quota Limit</th>
                    <th className="py-3 px-4">Auto-Debit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {clientUsers.map((client, idx) => (
                    <tr key={`owner-client-${client.id || client.email || 'c'}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {client.full_name} ({client.email})
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          client.plan === 'pro'
                            ? 'bg-purple-100 text-purple-700'
                            : client.plan === 'prime'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {client.plan || 'Free'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {client.subscription_status || 'active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{formatBytes(client.storage_limit)}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {client.auto_debit_enabled ? 'Enabled' : 'Manual'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenProblemSolver(client)}
                          className="px-2.5 py-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-lg font-bold text-[11px]"
                        >
                          Modify Plan Quota
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: PAYMENTS & VOUCHERS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Super Owner Financial Console
                </span>
                {paymentRequests.filter((r) => r.status === 'pending').length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                    {paymentRequests.filter((r) => r.status === 'pending').length} Action Required
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Manual Payment Verifications & Invoices (رسید کی تصدیق اور انوائسز)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect customer payment screenshots, verify bank / EasyPaisa / JazzCash transactions, and approve instant plan upgrades.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                Total Revenue: ${invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Subtab Toggle Buttons */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setOwnerPaymentSubTab('verifications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                ownerPaymentSubTab === 'verifications'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Manual Payment Proofs ({paymentRequests.length})</span>
              {paymentRequests.filter((r) => r.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-950 text-amber-400">
                  {paymentRequests.filter((r) => r.status === 'pending').length} Pending
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setOwnerPaymentSubTab('invoices')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                ownerPaymentSubTab === 'invoices'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paid Invoices & Receipts ({invoices.length})</span>
            </button>
          </div>

          {/* SUBTAB 1: MANUAL PAYMENT PROOFS VERIFICATION DESK */}
          {ownerPaymentSubTab === 'verifications' && (
            <div className="space-y-4">
              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Submissions</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">{paymentRequests.length}</span>
                  <span className="text-[10px] text-slate-400">All channels</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-xs">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Pending Review</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                    {paymentRequests.filter((r) => r.status === 'pending').length}
                  </span>
                  <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80">Requires verification</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Approved & Active</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {paymentRequests.filter((r) => r.status === 'approved').length}
                  </span>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Plans upgraded</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified Value</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                    ${paymentRequests.filter((r) => r.status === 'approved').reduce((s, r) => s + (r.amount || 0), 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Collected via Transfer</span>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ownerPaymentSearch}
                    onChange={(e) => setOwnerPaymentSearch(e.target.value)}
                    placeholder="Search by customer, email, or TRX ID..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOwnerPaymentStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                        ownerPaymentStatusFilter === st
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {st} ({st === 'all' ? paymentRequests.length : paymentRequests.filter((r) => r.status === st).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Proofs Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-3.5">Receipt Screenshot</th>
                        <th className="py-3 px-3.5">Customer / Email</th>
                        <th className="py-3 px-3.5">Target Plan</th>
                        <th className="py-3 px-3.5">Channel & TRX ID</th>
                        <th className="py-3 px-3.5">Amount</th>
                        <th className="py-3 px-3.5">Submitted At</th>
                        <th className="py-3 px-3.5">Status</th>
                        <th className="py-3 px-3.5 text-right">Owner Verification Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paymentRequests
                        .filter((r) => {
                          const matchesFilter = ownerPaymentStatusFilter === 'all' || r.status === ownerPaymentStatusFilter;
                          const q = ownerPaymentSearch.toLowerCase().trim();
                          const matchesQuery =
                            !q ||
                            r.customer_email.toLowerCase().includes(q) ||
                            (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
                            (r.transaction_id && r.transaction_id.toLowerCase().includes(q)) ||
                            r.plan_name.toLowerCase().includes(q);
                          return matchesFilter && matchesQuery;
                        })
                        .map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3.5">
                              <button
                                type="button"
                                onClick={() => setOwnerSelectedScreenshotUrl(req.voucher_url)}
                                className="group relative block w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-amber-500 transition-all shrink-0"
                                title="Click to inspect receipt in full view"
                              >
                                <img
                                  src={req.voucher_url}
                                  alt="Payment Proof"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-[10px]">
                                  <Eye className="w-4 h-4" />
                                </div>
                              </button>
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {req.customer_name || 'Anonymous User'}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                {req.customer_email}
                              </div>
                              {req.user_id && (
                                <div className="text-[10px] text-slate-400">UID: {req.user_id}</div>
                              )}
                            </td>
                            <td className="py-3 px-3.5">
                              <span className="font-extrabold text-slate-900 dark:text-white block">
                                {req.plan_name}
                              </span>
                              <span className="text-[10px] text-slate-500 capitalize">
                                {req.billing_cycle || 'monthly'}
                              </span>
                            </td>
                            <td className="py-3 px-3.5">
                              <span className="font-bold text-blue-600 dark:text-blue-400 block">
                                {req.payment_method || 'Bank Transfer'}
                              </span>
                              <div className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                {req.transaction_id || 'No TRX ID'}
                              </div>
                              {req.transaction_date && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Date: {req.transaction_date}
                                </div>
                              )}
                              {req.sender_account_or_phone && (
                                <div className="text-[10px] text-slate-400">
                                  From: {req.sender_name ? `${req.sender_name} (${req.sender_account_or_phone})` : req.sender_account_or_phone}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3.5 font-mono font-extrabold text-emerald-600 text-sm">
                              ${req.amount} USD
                            </td>
                            <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                              {new Date(req.created_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-3.5">
                              {req.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse border border-amber-300 dark:border-amber-700">
                                  <Clock className="w-3 h-3" />
                                  <span>Pending Verification</span>
                                </span>
                              )}
                              {req.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Approved & Active</span>
                                </span>
                              )}
                              {req.status === 'rejected' && (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                                    <X className="w-3 h-3" />
                                    <span>Rejected</span>
                                  </span>
                                  {req.admin_notes && (
                                    <span className="block text-[10px] text-rose-500 mt-0.5">
                                      {req.admin_notes}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-right space-x-1">
                              {req.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      confirm({
                                        title: 'Approve Payment & Upgrade User?',
                                        message: `Approve payment of $${req.amount} for ${req.customer_email}? This will instantly upgrade the customer account to ${req.plan_name} with storage and create an official invoice.`,
                                        confirmLabel: 'Approve & Activate Plan',
                                        isDestructive: false,
                                        onConfirm: () => {
                                          updatePaymentRequestStatus(req.id, 'approved', 'Verified and approved by Super Owner.');
                                          logAdminAction('Approved Payment Request', 'payment', `Owner approved ${req.customer_email} payment for ${req.plan_name}`, req.id);
                                        },
                                      });
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                                  >
                                    Approve (منظور کریں)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOwnerRejectModalReq(req);
                                      setOwnerRejectReason('Payment was not received in account statement.');
                                    }}
                                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => setOwnerSelectedScreenshotUrl(req.voucher_url)}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                              >
                                View Receipt
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  confirm({
                                    title: 'Delete Payment Request?',
                                    message: `Permanently delete this payment record for ${req.customer_email}?`,
                                    confirmLabel: 'Delete Record',
                                    isDestructive: true,
                                    onConfirm: () => deletePaymentRequest(req.id),
                                  });
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: OFFICIAL PAID INVOICES LEDGER */}
          {ownerPaymentSubTab === 'invoices' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Invoice ID</th>
                      <th className="py-3 px-4">Plan Description</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Billing Cycle</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {invoices.map((inv, idx) => (
                      <tr key={`owner-inv-${inv.id || 'i'}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{inv.id}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{inv.description || inv.plan_name}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">${inv.amount}</td>
                        <td className="py-3.5 px-4 capitalize">{inv.billing_cycle || 'monthly'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              logAdminAction('Processed Payment Action', 'payment', `Owner audited invoice #${inv.id}`);
                              addToast('Receipt Verified', `Invoice #${inv.id} is confirmed in ledger.`, 'info');
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                          >
                            Audit Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 10: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Abuse Reports & Moderation (شکایات اور خلاف ورزی کی رپورٹس)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review flagged imagery, copyright infringement reports, and take action.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reports, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', dataStr);
                downloadAnchor.setAttribute('download', `moderation_reports_${Date.now()}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
                addToast('Reports Exported', 'Moderation archive downloaded.', 'success');
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Reports JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((rep, idx) => (
              <div
                key={`owner-rep-${rep.id || 'r'}-${idx}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{rep.reason}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    rep.status.toLowerCase() === 'pending'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {rep.status}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{rep.details || 'No additional commentary provided.'}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  <span>Report ID: #{rep.id}</span>
                  <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 11: WEBSITE MANAGEMENT */}
      {activeTab === 'website' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Website Management & CMS (ویب سائٹ مواد اور ترتیبات)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control landing page headline, feature highlights, SEO metadata, and navigation links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Homepage Branding & Hero</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Site Title</label>
                  <input
                    type="text"
                    defaultValue="ImgSphere - Next-Gen Cloud Image Hosting & Collaboration"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Hero Subtitle</label>
                  <textarea
                    rows={2}
                    defaultValue="Store, compress, organize, and share ultra-fast high resolution images with real-time permissions."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Content Saved', 'Website copy updated successfully.', 'success')}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Save CMS Updates
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">SEO & Social Meta Tags</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Meta Description</label>
                  <input
                    type="text"
                    defaultValue="ImgSphere enterprise-grade image hosting and CDN platform with RBAC security."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">OpenGraph Image URL</label>
                  <input
                    type="text"
                    defaultValue="https://imgsphere.app/og-banner.png"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addToast('SEO Saved', 'Search engine metadata applied.', 'success')}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Deploy SEO Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 12: MEDIA */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-600" />
                <span>Media Catalog & Moderation (میڈیا کیٹلاگ)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect uploaded client photos, compression ratios, and public availability.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">{images.length} Assets Registered</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.slice(0, 18).map((img, idx) => (
              <div
                key={`owner-img-${img.id || 'img'}-${idx}`}
                className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 aspect-square"
              >
                <img
                  src={img.thumbnail_url || img.storage_url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white text-[10px]">
                  <span className="font-bold truncate">{img.title}</span>
                  <span className="text-slate-300">{formatBytes(img.file_size)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 13: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <span>System Broadcasts & Notifications (اطلاعات)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Send site-wide announcements, maintenance notices, or security alerts.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {systemNotifications.map((notif, idx) => (
              <div
                key={`owner-notif-${notif.id || 'n'}-${idx}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{notif.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-700">
                      {notif.category}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(notif.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 14: ACTIVITY / AUDIT LOGS (Section 18 of spec) */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span>Enterprise Audit Log & Activity Trail (آڈٹ لاگز)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every administrative action, permission modification, credential reset, and session change is permanently tracked.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(adminActivityLogs, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', dataStr);
                downloadAnchor.setAttribute('download', `audit_trail_export_${Date.now()}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
                addToast('Audit Log Downloaded', 'Audit trail exported in JSON format.', 'success');
              }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Trail</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search audit trail by actor, action description, or target..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={activityRoleFilter}
                onChange={(e) => setActivityRoleFilter(e.target.value as any)}
                className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target / Details</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adminActivityLogs
                    .filter((log) => {
                      const matchRole = activityRoleFilter === 'all' || log.actor_role === activityRoleFilter;
                      const matchSearch =
                        log.actor_name.toLowerCase().includes(activitySearch.toLowerCase()) ||
                        log.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
                        log.details.toLowerCase().includes(activitySearch.toLowerCase());
                      return matchRole && matchSearch;
                    })
                    .map((log, idx) => (
                      <tr key={`owner-act-log-${log.id || 'l'}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{log.actor_name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.actor_role === 'owner'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          }`}>
                            {log.actor_role}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{log.action}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-sm truncate">
                          {log.details}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 15: SECURITY (Section 19 of spec) */}
      {activeTab === 'security' && <OwnerSecuritySection />}

      {/* TAB 16: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              <span>APIs, Webhooks & Cloud Integrations (انضمام اور روابط)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of backend services, PostgreSQL database, storage engines, and webhooks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">PostgreSQL / Cloud SQL Database</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Connected (Healthy)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Primary relational storage handling users, authentication tokens, and activity logs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Object Storage & Edge CDN</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Media delivery engine with automated client-side WebP compression.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 17: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <span>Platform Settings & Owner Controls (سسٹم ترتیبات)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Website-wide toggles, client signup switches, and platform limits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 max-w-2xl">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Public Client Registration</span>
                  <span className="text-slate-400 block text-[11px]">Allow visitors to create new accounts</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-amber-500 focus:ring-amber-500" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Enforce 2FA on Admins</span>
                  <span className="text-slate-400 block text-[11px]">Require OTP verification on administrative logins</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-purple-500" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Maintenance Mode</span>
                  <span className="text-slate-400 block text-[11px]">Only allow Owner and Admins to sign in</span>
                </div>
                <input type="checkbox" className="rounded text-rose-600 focus:ring-rose-500" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => addToast('Settings Applied', 'Platform configuration saved.', 'success')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS (Create/Edit Admin, Reset Admin PW, Reset Client PW, Help Guide) */}
      {/* ========================================================================= */}

      {/* MODAL: Appoint / Edit Admin (Section 15 of spec) */}
      {isCreateAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingAdmin ? 'Edit Administrator Privileges' : 'Appoint New Administrator (ایڈمن بنائیں)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define personal credentials, role title, and explicit granular permissions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateAdminModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-4">
              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={adminFormName}
                    onChange={(e) => setAdminFormName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={adminFormEmail}
                    onChange={(e) => setAdminFormEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={adminFormPhone}
                    onChange={(e) => setAdminFormPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Custom Role Title</label>
                  <input
                    type="text"
                    value={adminFormCustomRole}
                    onChange={(e) => setAdminFormCustomRole(e.target.value)}
                    placeholder="Senior Admin / Support Admin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Grouped Permissions Matrix (Section 3 & 15 of spec) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Assign Delegated Permissions (مخصوص اختیارات دیں)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Admins only access features explicitly enabled here. Backend enforces these permissions.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllAdminPermissions}
                      className="text-[11px] font-bold text-purple-600 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleRemoveAllAdminPermissions}
                      className="text-[11px] font-bold text-rose-500 hover:underline"
                    >
                      Remove All
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {PERMISSION_GROUPS.map((group) => (
                    <div
                      key={group.name}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {group.name}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.perms.map((perm, idx) => {
                          const isChecked = adminFormPermissions.includes(perm.id);
                          return (
                            <label
                              key={`modal-perm-${perm.id || 'p'}-${idx}`}
                              className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                                isChecked
                                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleAdminPermission(perm.id)}
                                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="font-semibold text-[11px]">{perm.label}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdmin}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSavingAdmin ? 'Saving Admin...' : editingAdmin ? 'Update Privileges' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Admin Password Reset (Section 8 of spec) */}
      {resetAdminModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    Reset Admin Password (ایڈمن پاس ورڈ ری سیٹ)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Owner Dashboard Authority (Section 8)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetAdminModalTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Administrator:</span>
                <span className="font-bold text-slate-900 dark:text-white">{resetAdminModalTarget.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{resetAdminModalTarget.email}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
              <p className="leading-relaxed">
                <strong>Owner Password Reset Hierarchy:</strong> Admins do NOT have self-service reset. The Owner initiates reset here. Existing passwords are never shown.
              </p>
            </div>

            {adminGeneratedToken ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
                  <span className="font-bold block">One-Time Secure Access Token Generated:</span>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 font-mono font-bold text-center text-sm border border-emerald-500/40 select-all">
                    {adminGeneratedToken}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Valid for 60 minutes. Provide this token to the administrator to authenticate.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(adminGeneratedToken);
                    addToast('Token Copied', 'Copied token to clipboard.', 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Reset Token</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isResettingAdmin}
                onClick={handleExecuteAdminPasswordReset}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
              >
                {isResettingAdmin ? 'Generating Token...' : 'Initiate Secure Reset Process'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Client Password Reset (Section 9 of spec) */}
      {resetClientModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    Reset Client Password (کلائنٹ پاس ورڈ ری سیٹ)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Client Access Resolution (Section 9)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetClientModalTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Client:</span>
                <span className="font-bold text-slate-900 dark:text-white">{resetClientModalTarget.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{resetClientModalTarget.email}</span>
              </div>
            </div>

            {clientGeneratedToken ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
                  <span className="font-bold block">Temporary Client Passcode Generated:</span>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 font-mono font-bold text-center text-sm border border-emerald-500/40 select-all">
                    {clientGeneratedToken}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    The client can use this temporary passcode to log in at the Client Portal.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(clientGeneratedToken);
                    addToast('Passcode Copied', 'Copied client passcode to clipboard.', 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Client Passcode</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isResettingClient}
                onClick={handleExecuteClientPasswordReset}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
              >
                {isResettingClient ? 'Generating Passcode...' : 'Generate Temporary Client Passcode'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Create Project */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-emerald-600" />
                <span>Initialize Client Project</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateProjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Autumn Editorial Visuals"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Client Name / Email</label>
                <select
                  required
                  value={newProjectClient}
                  onChange={(e) => setNewProjectClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="">-- Choose Client --</option>
                  {clientUsers.map((c, idx) => (
                    <option key={`proj-opt-${c.id || c.email || 'c'}-${idx}`} value={c.full_name}>
                      {c.full_name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Project Scope & Deliverables</label>
                <textarea
                  rows={2}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Details about deliverables..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Record Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Help & Support / Architecture Guide */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    ImgSphere RBAC & Security Specification
                  </h3>
                  <span className="text-[11px] text-slate-500">Enterprise Role Hierarchy Reference</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs">
                  1. Three-Tier Role Hierarchy
                </h4>
                <p className="mt-1">
                  <strong>OWNER &rarr; ADMIN &rarr; CLIENT</strong>. The Owner always holds 100% root sovereignty. No Admin or Client can override, demote, or suspend the Owner.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                <h4 className="font-bold text-purple-800 dark:text-purple-300 text-xs">
                  2. Password Reset Hierarchy (Sections 7-10)
                </h4>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li><strong>Owner:</strong> Self-service reset with OTP/token and session revocation.</li>
                  <li><strong>Admin:</strong> Must contact Owner. Owner initiates reset in Owner Dashboard. Existing passwords are never exposed.</li>
                  <li><strong>Client:</strong> Contacts Admin or Owner. Authorized staff initiates reset process.</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                <h4 className="font-bold text-blue-800 dark:text-blue-300 text-xs">
                  3. Permission Matrix
                </h4>
                <p className="mt-1">
                  Admins only see modules they have explicit permissions for in both frontend navigation and backend API endpoints.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHelpModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Client Problem Solver Desk */}
      {selectedClientForFix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Solve Client Problem (کلائنٹ کا مسئلہ حل کریں)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fix client quota, emergency storage grant, or reset account access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientForFix(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedClientForFix.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedClientForFix.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Storage Usage:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatBytes(selectedClientForFix.storage_used)} / {formatBytes(selectedClientForFix.storage_limit)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Choose Problem Solving Action
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'fix_quota', label: 'Recalculate Plan Quota', desc: 'Syncs storage quota to tier' },
                  { id: 'grant_bonus', label: 'Grant Emergency Storage', desc: 'Adds bonus buffer to limit' },
                  { id: 'unlock_account', label: 'Unblock / Restore Account', desc: 'Sets status back to active' },
                  { id: 'reset_access', label: 'Reset Password / Credentials', desc: 'Sets temporary passcode' },
                  { id: 'activate_subscription', label: 'Activate Paid Subscription', desc: 'Sets subscription active' },
                ].map((act, idx) => (
                  <button
                    key={`modal-act-${act.id || 'a'}-${idx}`}
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
                  Resolution Note / Memo
                </label>
                <input
                  type="text"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="e.g. Cleared upload cache and granted +5 GB quota"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedClientForFix(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSolving}
                onClick={handleExecuteClientResolution}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isSolving ? 'Applying Solution...' : 'Execute Solution & Close'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Lightbox Screenshot Preview Modal */}
      {ownerSelectedScreenshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setOwnerSelectedScreenshotUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4" />
                <span>Super Owner Verification View: Payment Voucher Slip</span>
              </span>
              <button
                type="button"
                onClick={() => setOwnerSelectedScreenshotUrl(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[78vh] overflow-auto flex items-center justify-center rounded-2xl bg-black/60 p-2">
              <img
                src={ownerSelectedScreenshotUrl}
                alt="Payment Voucher Full"
                className="max-h-[72vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Owner Payment Rejection Reason Modal */}
      {ownerRejectModalReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Reject Payment Submission
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOwnerRejectModalReq(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                Rejecting submission for <span className="font-bold text-slate-900 dark:text-white">{ownerRejectModalReq.customer_email}</span> ({ownerRejectModalReq.plan_name} - ${ownerRejectModalReq.amount}).
              </p>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mt-2">
                Reason / Note for Customer:
              </label>
              <textarea
                rows={3}
                value={ownerRejectReason}
                onChange={(e) => setOwnerRejectReason(e.target.value)}
                placeholder="e.g. Transaction ID was not found in bank statement, or screenshot was blurry."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOwnerRejectModalReq(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updatePaymentRequestStatus(ownerRejectModalReq.id, 'rejected', ownerRejectReason.trim());
                  logAdminAction('Rejected Payment Request', 'payment', `Owner rejected payment from ${ownerRejectModalReq.customer_email}. Reason: ${ownerRejectReason}`, ownerRejectModalReq.id);
                  setOwnerRejectModalReq(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
