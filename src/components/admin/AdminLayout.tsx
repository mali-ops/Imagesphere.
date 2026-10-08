import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Crown,
  Zap,
  LayoutDashboard,
  Users,
  Images,
  Flag,
  HardDrive,
  Settings,
  Mail,
  ArrowLeft,
  Menu,
  X,
  Layers,
  Sun,
  Moon,
  LogOut,
  AlertTriangle,
  Globe,
  ExternalLink,
  CreditCard,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const {
    activeRoute,
    navigateTo,
    currentUser,
    logout,
    theme,
    setTheme,
    reports,
    supportMessages,
    paymentRequests,
    clientIssues,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const pendingReportsCount = reports.filter((r) => r.status.toLowerCase() === 'pending').length;
  const newSupportCount = supportMessages.filter((m) => m.status === 'new').length;
  const pendingPaymentsCount = paymentRequests.filter((p) => p.status === 'pending').length;
  const openIssuesCount = (clientIssues || []).filter((t) => t.status !== 'resolved').length;

  const isOwner = currentUser?.role === 'owner' || currentUser?.email === 'aliuniet@gmail.com';

  // Permission verification helper
  const hasPerm = (requiredPerms: string[]): boolean => {
    if (isOwner) return true;
    if (!currentUser || currentUser.role !== 'admin') return false;
    const perms = currentUser.admin_permissions || [];
    // Full wildcard or matches any required permission
    return requiredPerms.some((req) => {
      if (perms.includes(req as any)) return true;
      // Legacy alias mapping
      if (req === 'users.view' && perms.includes('manage_users')) return true;
      if (req === 'payments.view' && perms.includes('manage_payments')) return true;
      if (req === 'subscriptions.view' && perms.includes('manage_subscriptions')) return true;
      if (req === 'reports.view' && perms.includes('manage_reports')) return true;
      if (req === 'website.content' && perms.includes('manage_cms')) return true;
      if (req === 'resources.view' && perms.includes('manage_users')) return true;
      return false;
    });
  };

  const allNavItems = [
    ...(isOwner
      ? [
          {
            label: 'Owner Headquarters',
            route: 'admin-owner',
            icon: Crown,
            highlight: true,
            badge: 'ROOT',
            ownerOnly: true,
          },
        ]
      : []),
    {
      label: 'Overview',
      route: 'admin-overview',
      icon: LayoutDashboard,
      required: ['dashboard.view'],
      alwaysAdmin: true,
    },
    {
      label: 'User & Client Management',
      route: 'admin-users',
      icon: Users,
      required: ['users.view', 'manage_users'],
    },
    {
      label: 'Client Problem Desk',
      route: 'admin-clients-desk',
      icon: Zap,
      badge: openIssuesCount > 0 ? openIssuesCount : undefined,
      required: ['solve_client_issues', 'users.edit'],
    },
    {
      label: 'Subscriptions & Plans',
      route: 'admin-subscriptions',
      icon: CreditCard,
      required: ['manage_subscriptions', 'subscriptions.view', 'payments.view'],
    },
    {
      label: 'Payment Proofs & Verifications',
      route: 'admin-payments',
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined,
      required: ['manage_payments', 'payments.view'],
    },
    {
      label: 'Image Moderation',
      route: 'admin-images',
      icon: Images,
      required: ['resources.view', 'manage_reports'],
    },
    {
      label: 'Abuse Reports',
      route: 'admin-reports',
      icon: Flag,
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
      required: ['reports.view', 'manage_reports'],
    },
    {
      label: 'Storage & Capacity',
      route: 'admin-storage',
      icon: HardDrive,
      required: ['resources.view'],
    },
    {
      label: 'Website CMS & Nav',
      route: 'admin-cms',
      icon: Globe,
      required: ['website.content', 'manage_cms', 'website.pages'],
    },
    {
      label: 'Support Inbox',
      route: 'admin-support',
      icon: Mail,
      badge: newSupportCount > 0 ? newSupportCount : undefined,
      required: ['users.view', 'solve_client_issues', 'manage_users'],
    },
    {
      label: 'Settings',
      route: 'admin-settings',
      icon: Settings,
      required: ['settings.view', 'settings.edit'],
    },
  ];

  // Dynamic nav items based on explicit Owner permissions
  const adminNav = allNavItems.filter((item) => {
    if (item.ownerOnly) return isOwner;
    if (isOwner) return true;
    if (item.alwaysAdmin) return true;
    return hasPerm(item.required || []);
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-white">
      {/* Mobile Top Header */}
      <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 h-16 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-base">Admin Panel</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigateTo('admin-settings')}
            className={`p-2 rounded-lg ${activeRoute === 'admin-settings' ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Admin Sidebar */}
      <aside
        id="admin-sidebar"
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-base leading-tight">ImgSphere</span>
                <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
                  Platform Admin
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Portal Switchers */}
          <div className="px-3 pt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => navigateTo('dashboard-overview')}
              className="py-2 px-2.5 text-[11px] font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
              title="Open Client Workspace"
            >
              <ArrowLeft className="w-3 h-3 text-slate-400" />
              <span>Client Portal</span>
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="py-2 px-2.5 text-[11px] font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
              title="View Public Website"
            >
              <ExternalLink className="w-3 h-3 text-slate-400" />
              <span>Live Site</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {adminNav.map((item: any) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => {
                    navigateTo(item.route as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    item.highlight
                      ? isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30'
                        : 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                      : isActive
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${item.highlight ? 'text-amber-400 fill-current' : (isActive ? 'text-white' : 'text-slate-400')}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.highlight ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium">● System Healthy</span>
            <span className="font-mono">v1.2.0</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
              Administration
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
              {activeRoute.replace('admin-', '').replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => navigateTo('dashboard-overview')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-all shadow-xs"
              title="Open Client Dashboard to test Client features & UI in real-time"
            >
              <span>View Client Dashboard</span>
              <span>&rarr;</span>
            </button>
            <button
              onClick={() => navigateTo('admin-settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeRoute === 'admin-settings'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            {isOwner ? (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-600 dark:text-amber-300 font-extrabold border border-amber-500/40 flex items-center gap-1.5 shadow-xs">
                <Crown className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>Super Owner: {currentUser?.full_name}</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                Admin: {currentUser?.full_name}
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
