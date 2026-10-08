import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { PricingSection } from './components/public/PricingSection';
import { LandingPage } from './components/public/LandingPage';
import { AuthPages } from './components/public/AuthPages';
import { PublicImagePage } from './components/public/PublicImagePage';
import { HelpCenter } from './components/public/HelpCenter';
import { ContactPage } from './components/public/ContactPage';
import { PaymentVerificationForm } from './components/public/PaymentVerificationForm';

// Client Dashboard
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { UploadPage } from './components/dashboard/UploadPage';
import { MyImagesPage } from './components/dashboard/MyImagesPage';
import { ImageDetailPage } from './components/dashboard/ImageDetailPage';
import { FoldersPage } from './components/dashboard/FoldersPage';
import { AnalyticsPage } from './components/dashboard/AnalyticsPage';
import { StoragePage } from './components/dashboard/StoragePage';
import { ProfilePage } from './components/dashboard/ProfilePage';
import { SettingsPage } from './components/dashboard/SettingsPage';
import { BillingSubscriptionPage } from './components/dashboard/BillingSubscriptionPage';

// Admin Panel
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminUsersPage } from './components/admin/AdminUsersPage';
import { AdminImagesPage } from './components/admin/AdminImagesPage';
import { AdminReportsPage } from './components/admin/AdminReportsPage';
import { AdminStoragePage } from './components/admin/AdminStoragePage';
import { AdminSupportInbox } from './components/admin/AdminSupportInbox';
import { AdminSettingsPage } from './components/admin/AdminSettingsPage';
import { AdminCMSPage } from './components/admin/AdminCMSPage';
import { AdminPaymentsPage } from './components/admin/AdminPaymentsPage';
import { AdminSubscriptionsPage } from './components/admin/AdminSubscriptionsPage';
import { OwnerDashboard } from './components/admin/OwnerDashboard';
import { ClientProblemDesk } from './components/admin/ClientProblemDesk';
import { SecretAdminModal } from './components/admin/SecretAdminModal';

import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeRoute,
    navigateTo,
    currentUser,
    confirmState,
    closeConfirm,
    images,
  } = useApp();

  const [secretAdminModalOpen, setSecretAdminModalOpen] = React.useState(false);

  // Discreet Global Shortcut & Event Listener for Hidden Admin Gateway
  useEffect(() => {
    const handleSecretEvent = () => setSecretAdminModalOpen(true);
    window.addEventListener('open-secret-admin-modal', handleSecretEvent);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+O or Ctrl+Shift+A or Cmd+Shift+O or Cmd+Shift+A
      const isModifier = (e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey);
      if (isModifier && (e.key === 'A' || e.key === 'a' || e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        setSecretAdminModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Secret URL query or hash trigger (e.g. #owner, #admin-gateway, ?portal=owner, ?portal=secret)
    if (
      window.location.hash === '#owner' ||
      window.location.hash === '#admin-gateway' ||
      window.location.hash === '#secret' ||
      window.location.search.includes('portal=owner') ||
      window.location.search.includes('portal=secret') ||
      window.location.search.includes('portal=master') ||
      window.location.search.includes('admin=secret')
    ) {
      setSecretAdminModalOpen(true);
    }

    return () => {
      window.removeEventListener('open-secret-admin-modal', handleSecretEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Check URL path and query parameters for image links
  useEffect(() => {
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const imgParam = params.get('img');

    let targetSlugOrId = imgParam;
    if (!targetSlugOrId) {
      // Matches /view/:slug or /:brand/view/:slug
      const viewMatch = pathname.match(/(?:\/[^/]+)?\/view\/([^/]+)/);
      if (viewMatch) {
        targetSlugOrId = viewMatch[1];
      }
    }

    if (targetSlugOrId) {
      const match = images.find(
        (i) => i.public_slug === targetSlugOrId || i.id === targetSlugOrId
      );
      if (match) {
        navigateTo('public-image', { imageId: match.id, slug: match.public_slug });
      } else {
        // Fallback: lookup on backend (e.g. when link is opened on mobile phone or new browser session)
        fetch(`/api/db/images/lookup/${encodeURIComponent(targetSlugOrId)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.image) {
              const fetched = data.image;
              navigateTo('public-image', {
                imageId: fetched.id,
                slug: fetched.slug || fetched.public_slug,
                fetchedImage: {
                  id: fetched.id,
                  user_id: fetched.userId || fetched.user_id || 'system',
                  uploader_name: fetched.uploader_name || 'ImgSphere Creator',
                  title: fetched.title || 'Image',
                  description: fetched.description || '',
                  file_name: fetched.title ? `${fetched.title}.jpg` : 'image.jpg',
                  original_name: fetched.title ? `${fetched.title}.jpg` : 'image.jpg',
                  storage_url: fetched.storageUrl || fetched.storage_url,
                  thumbnail_url: fetched.thumbnailUrl || fetched.thumbnail_url || fetched.storageUrl || fetched.storage_url,
                  file_size: fetched.size || fetched.file_size || 500000,
                  mime_type: fetched.mimeType || fetched.mime_type || 'image/jpeg',
                  width: fetched.width || 1200,
                  height: fetched.height || 800,
                  visibility: fetched.visibility || 'public',
                  views: fetched.views || 1,
                  downloads: fetched.downloads || 0,
                  tags: Array.isArray(fetched.tags) ? fetched.tags : [],
                  public_slug: fetched.slug || fetched.public_slug || targetSlugOrId,
                  created_at: fetched.createdAt || fetched.created_at || new Date().toISOString(),
                  updated_at: fetched.updatedAt || fetched.updated_at || new Date().toISOString(),
                },
              });
            }
          })
          .catch(() => {
            // Silently ignore network failures
          });
      }
    }
  }, [images]);

  // Public Layout Wrapper for pages that share Navbar and Footer
  const renderPublicPage = (children: React.ReactNode) => (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );

  // Authentication guard for Dashboard
  if (activeRoute.startsWith('dashboard-') && !currentUser) {
    return renderPublicPage(
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold">Sign In Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please sign in to access your media library, analytics, and personal cloud folders.
        </p>
        <button
          onClick={() => navigateTo('auth-login')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // Discreet protection for Admin routes (Hidden from public)
  if (activeRoute.startsWith('admin-')) {
    const isOwnerUser =
      currentUser &&
      (currentUser.role === 'owner' || currentUser.email === 'aliuniet@gmail.com');
    const isAdminUser =
      currentUser &&
      (currentUser.role === 'admin' || isOwnerUser);

    if (!isAdminUser) {
      return renderPublicPage(
        <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
          <div className="text-6xl font-black text-slate-200 dark:text-slate-800 tracking-wider">
            404
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page you are looking for does not exist or may have been relocated.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigateTo('home')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
            >
              Return Home
            </button>
            {/* Hidden admin unlock trigger */}
            <span
              onClick={() => setSecretAdminModalOpen(true)}
              className="w-2 h-2 rounded-full bg-transparent hover:bg-slate-300 dark:hover:bg-slate-700 cursor-default transition-colors"
              title=""
            />
          </div>
        </div>
      );
    }

    // Owner protection: Root Owner Headquarters strictly restricted to Owner
    if (activeRoute === 'admin-owner' && !isOwnerUser) {
      return (
        <AdminLayout>
          <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30">
              403 Forbidden - Root Owner Only
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Owner Headquarters Restricted
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This module is strictly reserved for the Sovereign Platform Owner (aliuniet@gmail.com). As a delegated Administrator, your account permissions do not permit root owner elevation.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateTo('admin-overview')}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md"
              >
                Return to Admin Console
              </button>
            </div>
          </div>
        </AdminLayout>
      );
    }

    // Granular Module Permission Checks for Admins
    if (!isOwnerUser) {
      const perms = currentUser?.admin_permissions || [];
      const hasPerm = (requiredList: string[]) => {
        return requiredList.some((req) => {
          if (perms.includes(req as any)) return true;
          if (req === 'users.view' && perms.includes('manage_users')) return true;
          if (req === 'payments.view' && perms.includes('manage_payments')) return true;
          if (req === 'subscriptions.view' && perms.includes('manage_subscriptions')) return true;
          if (req === 'reports.view' && perms.includes('manage_reports')) return true;
          if (req === 'website.content' && perms.includes('manage_cms')) return true;
          if (req === 'resources.view' && perms.includes('manage_users')) return true;
          return false;
        });
      };

      const ROUTE_PERM_MAP: Record<string, { label: string; perms: string[] }> = {
        'admin-users': { label: 'User & Client Management', perms: ['users.view', 'manage_users'] },
        'admin-clients-desk': { label: 'Client Problem Desk', perms: ['solve_client_issues', 'users.edit'] },
        'admin-subscriptions': { label: 'Subscriptions & Plans', perms: ['manage_subscriptions', 'subscriptions.view', 'payments.view'] },
        'admin-payments': { label: 'Payment Proofs & Verifications', perms: ['manage_payments', 'payments.view'] },
        'admin-images': { label: 'Image Moderation', perms: ['resources.view', 'manage_reports'] },
        'admin-reports': { label: 'Abuse Reports', perms: ['reports.view', 'manage_reports'] },
        'admin-storage': { label: 'Storage & Capacity', perms: ['resources.view'] },
        'admin-cms': { label: 'Website CMS & Nav', perms: ['website.content', 'manage_cms', 'website.pages'] },
        'admin-support': { label: 'Support Inbox', perms: ['users.view', 'solve_client_issues', 'manage_users'] },
        'admin-settings': { label: 'System Settings', perms: ['settings.view', 'settings.edit'] },
      };

      const requirement = ROUTE_PERM_MAP[activeRoute];
      if (requirement && !hasPerm(requirement.perms)) {
        return (
          <AdminLayout>
            <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30">
                403 Access Denied
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Permission Required: {requirement.label}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your administrative account does not currently hold permission to access the <strong>{requirement.label}</strong> module.
              </p>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                Required Capability: {requirement.perms.join(' or ')}
              </div>
              <p className="text-[11px] text-slate-400">
                Contact the Platform Owner (aliuniet@gmail.com) to request permission assignment.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('admin-overview')}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md"
                >
                  Back to Authorized Overview
                </button>
              </div>
            </div>
          </AdminLayout>
        );
      }
    }
  }

  // Router dispatcher
  const renderRoute = () => {
    switch (activeRoute) {
      // Public pages
      case 'home':
      case 'landing':
      case 'features':
      case 'how-it-works':
      case 'about':
        return renderPublicPage(<LandingPage />);
      case 'pricing':
        return renderPublicPage(<PricingSection isStandalonePage />);
      case 'login':
      case 'signup':
      case 'forgot-password':
      case 'reset-password':
      case 'auth-login':
      case 'auth-signup':
      case 'auth-forgot':
        return renderPublicPage(<AuthPages />);
      case 'public-image':
        return renderPublicPage(<PublicImagePage />);
      case 'help':
        return renderPublicPage(<HelpCenter />);
      case 'contact':
        return renderPublicPage(<ContactPage />);
      case 'payment-verification':
        return currentUser ? (
          <DashboardLayout>
            <div className="py-2">
              <PaymentVerificationForm />
            </div>
          </DashboardLayout>
        ) : (
          renderPublicPage(
            <div className="max-w-7xl mx-auto px-4 py-8">
              <PaymentVerificationForm />
            </div>
          )
        );

      // Client Dashboard
      case 'dashboard-overview':
        return (
          <DashboardLayout>
            <DashboardOverview />
          </DashboardLayout>
        );
      case 'dashboard-upload':
        return (
          <DashboardLayout>
            <UploadPage />
          </DashboardLayout>
        );
      case 'dashboard-images':
        return (
          <DashboardLayout>
            <MyImagesPage />
          </DashboardLayout>
        );
      case 'dashboard-image-detail':
        return (
          <DashboardLayout>
            <ImageDetailPage />
          </DashboardLayout>
        );
      case 'dashboard-folders':
        return (
          <DashboardLayout>
            <FoldersPage />
          </DashboardLayout>
        );
      case 'dashboard-analytics':
        return (
          <DashboardLayout>
            <AnalyticsPage />
          </DashboardLayout>
        );
      case 'dashboard-storage':
        return (
          <DashboardLayout>
            <StoragePage />
          </DashboardLayout>
        );
      case 'dashboard-profile':
        return (
          <DashboardLayout>
            <ProfilePage />
          </DashboardLayout>
        );
      case 'dashboard-settings':
        return (
          <DashboardLayout>
            <SettingsPage />
          </DashboardLayout>
        );
      case 'dashboard-billing':
        return (
          <DashboardLayout>
            <BillingSubscriptionPage />
          </DashboardLayout>
        );
      case 'dashboard-webhooks':
        return (
          <DashboardLayout>
            <SettingsPage initialTab="webhooks" />
          </DashboardLayout>
        );
      case 'dashboard-help':
        return (
          <DashboardLayout>
            <HelpCenter />
          </DashboardLayout>
        );

      // Admin Panel
      case 'admin-overview':
        return (
          <AdminLayout>
            <AdminOverview />
          </AdminLayout>
        );
      case 'admin-users':
        return (
          <AdminLayout>
            <AdminUsersPage />
          </AdminLayout>
        );
      case 'admin-images':
        return (
          <AdminLayout>
            <AdminImagesPage />
          </AdminLayout>
        );
      case 'admin-reports':
        return (
          <AdminLayout>
            <AdminReportsPage />
          </AdminLayout>
        );
      case 'admin-storage':
        return (
          <AdminLayout>
            <AdminStoragePage />
          </AdminLayout>
        );
      case 'admin-support':
        return (
          <AdminLayout>
            <AdminSupportInbox />
          </AdminLayout>
        );
      case 'admin-settings':
        return (
          <AdminLayout>
            <AdminSettingsPage />
          </AdminLayout>
        );
      case 'admin-cms':
        return (
          <AdminLayout>
            <AdminCMSPage />
          </AdminLayout>
        );
      case 'admin-payments':
        return (
          <AdminLayout>
            <AdminPaymentsPage />
          </AdminLayout>
        );
      case 'admin-subscriptions':
        return (
          <AdminLayout>
            <AdminSubscriptionsPage />
          </AdminLayout>
        );
      case 'admin-owner':
        return (
          <AdminLayout>
            <OwnerDashboard />
          </AdminLayout>
        );
      case 'admin-clients-desk':
        return (
          <AdminLayout>
            <ClientProblemDesk />
          </AdminLayout>
        );

      default:
        return renderPublicPage(<LandingPage />);
    }
  };

  return (
    <>
      {renderRoute()}

      {/* Discreet Secret Admin Gateway Modal (Hidden from public navigation) */}
      <SecretAdminModal
        isOpen={secretAdminModalOpen}
        onClose={() => setSecretAdminModalOpen(false)}
      />

      {/* Global Notifications Toast Container */}
      <ToastContainer />

      {/* Global Confirmation Modal Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        isDestructive={confirmState.isDestructive}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
