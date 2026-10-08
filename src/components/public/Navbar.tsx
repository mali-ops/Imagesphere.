import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  UploadCloud,
  Moon,
  Sun,
  Menu,
  X,
  LayoutDashboard,
  Shield,
  Crown,
  LogOut,
  User as UserIcon,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeRoute, navigateTo, currentUser, logout, theme, setTheme, systemSettings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  // Discreet secret logo click sequence for Owner/Admin
  const handleLogoClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 3) {
      setLogoClicks(0);
      window.dispatchEvent(new CustomEvent('open-secret-admin-modal'));
      return;
    }
    handleNavClick('home');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const activeNavItems = systemSettings?.nav_items
    ? systemSettings.nav_items.filter((item) => item.is_enabled)
    : [
        { id: '1', label: 'Home', route: 'home' },
        { id: '2', label: 'Features', route: 'features' },
        { id: '3', label: 'How It Works', route: 'how-it-works' },
        { id: '4', label: 'Reviews', route: 'reviews' },
        { id: '5', label: 'Pricing', route: 'pricing' },
        { id: '6', label: 'Help', route: 'help' },
        { id: '7', label: 'Contact', route: 'contact' },
        { id: '8', label: 'Verify Payment', route: 'payment-verification' },
      ];

  const handleNavClick = (route: string) => {
    setMobileMenuOpen(false);
    navigateTo(route as any);
  };

  const handleClientSignIn = () => {
    setMobileMenuOpen(false);
    navigateTo('auth-login');
  };

  const handleClientSignUp = () => {
    setMobileMenuOpen(false);
    navigateTo('signup');
  };

  const handleDashboardClick = () => {
    setMobileMenuOpen(false);
    if (currentUser?.role === 'owner') {
      navigateTo('admin-owner');
    } else if (currentUser?.role === 'admin') {
      navigateTo('admin-overview');
    } else {
      navigateTo('dashboard-overview');
    }
  };

  const discountCampaign = systemSettings?.discount_campaign;
  const isDiscountActive = discountCampaign?.is_active;

  return (
    <>
      {/* Top Discount Campaign Announcement Banner (if configured) */}
      {isDiscountActive && (
        <aside
          id="top-promo-banner"
          aria-label="Promotion Announcement"
          className="bg-gradient-to-r from-purple-700 to-pink-700 text-white text-xs py-1.5 px-4 text-center font-medium relative z-50 flex items-center justify-center gap-2 shadow-sm"
        >
          <span className="inline-flex items-center gap-1.5 font-bold bg-white/20 px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-amber-300" /> Sale Active
          </span>
          <span className="truncate max-w-xl">
            {discountCampaign?.banner_text || `Save ${discountCampaign?.percentage}% on all paid plans!`}
          </span>
          <button
            onClick={() => navigateTo('pricing')}
            className="underline underline-offset-2 font-bold hover:text-amber-200 transition-colors shrink-0 ml-1"
          >
            Claim {discountCampaign?.percentage}% Off &rarr;
          </button>
        </aside>
      )}

      <header
        id="main-header"
        className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <button
            id="brand-logo-btn"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            {systemSettings?.logo_type === 'image' && systemSettings?.logo_image_url ? (
              <img
                src={systemSettings.logo_image_url}
                alt={systemSettings.site_name || 'Logo'}
                className="h-9 max-w-[120px] object-contain rounded"
                onError={(e) => {
                  // Fallback to vector icon if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                {systemSettings?.site_name || 'ImgSphere'}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase">
                {systemSettings?.site_tagline || 'Free Cloud Media'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {activeNavItems.map((item) => {
              const isActive =
                activeRoute === item.route ||
                (item.route === 'home' && (activeRoute === 'home' || activeRoute === 'landing'));
              return (
                <button
                  key={item.id || item.route}
                  id={`nav-link-${item.route}`}
                  onClick={() => handleNavClick(item.route)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Controls: Theme Switcher + Client Portal Sign In / Sign Up */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {!currentUser ? (
              <>
                {/* Client Portal Sign In */}
                <button
                  id="nav-client-signin-btn"
                  onClick={handleClientSignIn}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </button>

                {/* Client Portal Sign Up */}
                <button
                  id="nav-client-signup-btn"
                  onClick={handleClientSignUp}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-dashboard-btn"
                  onClick={handleDashboardClick}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>
                    {currentUser.role === 'owner'
                      ? 'Owner Headquarters'
                      : currentUser.role === 'admin'
                      ? 'Admin Console'
                      : 'Dashboard'}
                  </span>
                </button>

                <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 max-w-[120px] truncate hidden md:inline">
                    {currentUser.full_name}
                  </span>
                  <button
                    id="nav-logout-btn"
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu-drawer"
            className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200"
          >
            {/* Navigation Links */}
            <div className="space-y-1">
              {activeNavItems.map((item) => (
                <button
                  key={item.id || item.route}
                  onClick={() => handleNavClick(item.route)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>

            {/* Client Portal Options in Mobile Drawer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Client Portal
              </span>
              {!currentUser ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleClientSignIn}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <UserIcon className="w-4 h-4 text-blue-500" />
                      <span>Client Sign In</span>
                    </button>

                    <button
                      onClick={handleClientSignUp}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
                    >
                      <span>Sign Up</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleDashboardClick}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </button>
                  <div className="flex items-center justify-between px-1 text-xs text-slate-500">
                    <span>Logged in as <strong>{currentUser.full_name}</strong></span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-rose-600 font-semibold hover:underline"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
