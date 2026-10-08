import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Layers,
  Layout,
  Navigation,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
  Sliders,
  Type,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  HelpCircle,
  Upload,
  Image as ImageIcon,
  Tag,
  CreditCard,
  KeyRound,
  Percent,
  AlertCircle,
  Clock,
  HardDrive,
} from 'lucide-react';
import { NavItemConfig, PricingPlan, DiscountCampaign } from '../../types';

export const AdminCMSPage: React.FC = () => {
  const { systemSettings, updateSystemSettings, updateAdminCredentials, addToast, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState<
    'branding' | 'navigation' | 'discount' | 'pricing' | 'credentials' | 'hero' | 'about' | 'footer'
  >('branding');

  // Form states initialized from systemSettings
  const [siteName, setSiteName] = useState(systemSettings.site_name || 'ImgSphere');
  const [siteTagline, setSiteTagline] = useState(systemSettings.site_tagline || 'Fast, secure and free cloud image hosting');
  const [logoType, setLogoType] = useState<'icon' | 'image'>(systemSettings.logo_type || 'icon');
  const [logoImageUrl, setLogoImageUrl] = useState(systemSettings.logo_image_url || '');
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Navigation Items
  const [navItems, setNavItems] = useState<NavItemConfig[]>(
    systemSettings.nav_items || [
      { id: 'nav_1', label: 'Home', route: 'home', is_enabled: true, order: 1 },
      { id: 'nav_2', label: 'Features', route: 'features', is_enabled: true, order: 2 },
      { id: 'nav_3', label: 'Pricing', route: 'pricing', is_enabled: true, order: 3 },
      { id: 'nav_4', label: 'About', route: 'about', is_enabled: true, order: 4 },
      { id: 'nav_5', label: 'Help', route: 'help', is_enabled: true, order: 5 },
      { id: 'nav_6', label: 'Contact', route: 'contact', is_enabled: true, order: 6 },
    ]
  );
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavRoute, setNewNavRoute] = useState('');

  // Discount Campaign Management
  const [discountActive, setDiscountActive] = useState<boolean>(
    systemSettings.discount_campaign?.is_active ?? true
  );
  const [discountCode, setDiscountCode] = useState<string>(
    systemSettings.discount_campaign?.code || 'SAVE30'
  );
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    systemSettings.discount_campaign?.percentage ?? 30
  );
  const [discountBannerText, setDiscountBannerText] = useState<string>(
    systemSettings.discount_campaign?.banner_text ||
      'Limited Time Offer: Get 30% off all Pro & Business Storage plans with code'
  );
  const [discountExpiresAt, setDiscountExpiresAt] = useState<string>(
    systemSettings.discount_campaign?.expires_at || 'Expires soon'
  );

  // Pricing Plans Management
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(
    systemSettings.pricing_plans || [
      {
        id: 'plan_free',
        name: 'Free Starter',
        badge: 'Community Plan',
        monthly_price: 0,
        annual_price: 0,
        storage_gb: 1,
        max_file_mb: 10,
        description: 'Ideal for personal image hosting, development, blogging, and casual sharing.',
        features: [
          '1 GB High-Speed Cloud Storage',
          '10 MB Maximum Single File Size',
          'Direct Shareable URLs & Embed Codes',
          'Global CDN Image Delivery',
          'Custom Folders & Tag Organization',
          'Live View & Download Counters',
          'Full Privacy (Public / Unlisted / Private)',
        ],
        is_popular: false,
        cta_label: 'Get Started Free',
      },
      {
        id: 'plan_pro',
        name: 'Pro Creator',
        badge: 'Most Popular',
        monthly_price: 9,
        annual_price: 7,
        storage_gb: 25,
        max_file_mb: 50,
        description: 'Built for designers, photographers, developers, and active digital publishers.',
        features: [
          '25 GB Cloud Media Storage',
          '50 MB Maximum Single File Size',
          'Ultra-Fast CDN Edge Routing',
          'Custom Domain Link Embedding',
          'Automatic WebP & AVIF Compression',
          'Ad-Free Direct Media Pages',
          'Full Analytics & Referrer History',
          'Priority Technical Support',
        ],
        is_popular: true,
        cta_label: 'Upgrade to Pro',
      },
      {
        id: 'plan_business',
        name: 'Business Studio',
        badge: 'High Performance',
        monthly_price: 29,
        annual_price: 23,
        storage_gb: 150,
        max_file_mb: 100,
        description: 'For agencies, commercial platforms, media publishers, and creative teams.',
        features: [
          '150 GB Ultra Cloud Storage',
          '100 MB Maximum Single File Size',
          'Multi-User Team Image Vault',
          'Dedicated Cloudinary / S3 Bucket Routing',
          'Automated Backup Snapshots',
          'API Token for Automated Uploads',
          'Custom Watermarking & Branding',
          '24/7 Dedicated Support & 99.99% SLA',
        ],
        is_popular: false,
        cta_label: 'Get Business Studio',
      },
    ]
  );

  // Admin Credentials Management
  const [adminUsername, setAdminUsername] = useState<string>(
    systemSettings.admin_username || 'sarah_admin'
  );
  const [adminPasscode, setAdminPasscode] = useState<string>(
    systemSettings.admin_passcode || 'admin123'
  );
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);

  // Hero Section
  const [heroBadge, setHeroBadge] = useState(systemSettings.hero_badge || '⚡ Free Cloud Media & Image Hosting Platform');
  const [heroTitle, setHeroTitle] = useState(systemSettings.hero_title || 'Upload. Share. Manage Your Images.');
  const [heroSubtitle, setHeroSubtitle] = useState(systemSettings.hero_subtitle || 'A fast and simple image hosting platform for uploading, managing, and sharing images securely.');
  const [heroCtaPrimary, setHeroCtaPrimary] = useState(systemSettings.hero_cta_primary || 'Upload Image');
  const [heroCtaSecondary, setHeroCtaSecondary] = useState(systemSettings.hero_cta_secondary || 'Create Free Account');

  // About Section & Metrics
  const [aboutHeading, setAboutHeading] = useState(systemSettings.about_heading || 'Built for High-Speed Media Sharing Across the Globe');
  const [aboutDescription, setAboutDescription] = useState(systemSettings.about_description || 'ImgSphere provides modern cloud media infrastructure optimized for developers, creators, businesses, and designers.');
  const [stat1Val, setStat1Val] = useState(systemSettings.about_stat_1_val || '99.9%');
  const [stat1Label, setStat1Label] = useState(systemSettings.about_stat_1_label || 'Uptime Reliability');
  const [stat2Val, setStat2Val] = useState(systemSettings.about_stat_2_val || '< 45ms');
  const [stat2Label, setStat2Label] = useState(systemSettings.about_stat_2_label || 'Global CDN Latency');
  const [stat3Val, setStat3Val] = useState(systemSettings.about_stat_3_val || '100% Free');
  const [stat3Label, setStat3Label] = useState(systemSettings.about_stat_3_label || 'Community Cloud Tier');

  // Footer
  const [footerDescription, setFooterDescription] = useState(systemSettings.footer_description || 'A fast, reliable, and secure image hosting platform.');
  const [footerCopyright, setFooterCopyright] = useState(systemSettings.footer_copyright || '© 2026 ImgSphere Cloud Inc. All rights reserved.');
  const [footerStatusText, setFooterStatusText] = useState(systemSettings.footer_status_text || 'All Systems Operational • Free Tier Active');
  const [footerContactLink, setFooterContactLink] = useState(systemSettings.footer_contact_link || 'support@imgsphere.io');

  // Logo file upload handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Invalid File', 'Please upload a valid image file (PNG, SVG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast('File Too Large', 'Please upload a logo image smaller than 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setLogoImageUrl(result);
        setLogoType('image');
        addToast('Logo Uploaded', 'New custom logo has been loaded. Click "Save All Changes" to persist.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const discountPayload: DiscountCampaign = {
      is_active: discountActive,
      code: discountCode.trim().toUpperCase(),
      percentage: Number(discountPercentage),
      banner_text: discountBannerText.trim(),
      expires_at: discountExpiresAt.trim(),
    };

    updateSystemSettings({
      site_name: siteName,
      site_tagline: siteTagline,
      logo_type: logoType,
      logo_image_url: logoImageUrl,
      nav_items: navItems,
      discount_campaign: discountPayload,
      pricing_plans: pricingPlans,
      admin_username: adminUsername.trim(),
      admin_passcode: adminPasscode,
      hero_badge: heroBadge,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_cta_primary: heroCtaPrimary,
      hero_cta_secondary: heroCtaSecondary,
      about_heading: aboutHeading,
      about_description: aboutDescription,
      about_stat_1_val: stat1Val,
      about_stat_1_label: stat1Label,
      about_stat_2_val: stat2Val,
      about_stat_2_label: stat2Label,
      about_stat_3_val: stat3Val,
      about_stat_3_label: stat3Label,
      footer_description: footerDescription,
      footer_copyright: footerCopyright,
      footer_status_text: footerStatusText,
      footer_contact_link: footerContactLink,
    });

    // Also persist admin credentials to context
    updateAdminCredentials(adminUsername.trim(), adminPasscode);

    addToast('Website Settings Saved', 'CMS settings, discount campaign, pricing plans, and admin credentials updated.', 'success');
  };

  const handleUpdateAdminCredentialsOnly = () => {
    if (!adminUsername.trim()) {
      addToast('Username Required', 'Admin username cannot be empty.', 'error');
      return;
    }
    if (!adminPasscode || adminPasscode.length < 4) {
      addToast('Passcode Too Short', 'Admin passcode must be at least 4 characters long.', 'error');
      return;
    }

    updateAdminCredentials(adminUsername.trim(), adminPasscode);
    addToast(
      'Admin Credentials Updated',
      `New login: Username "${adminUsername.trim()}" and passcode saved.`,
      'success'
    );
  };

  const handleToggleNav = (id: string) => {
    setNavItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_enabled: !item.is_enabled } : item))
    );
  };

  const handleUpdateNavLabel = (id: string, newLabel: string) => {
    setNavItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  const handleAddCustomNav = () => {
    if (!newNavLabel.trim() || !newNavRoute.trim()) {
      addToast('Input Required', 'Please enter both label and route/hash anchor.', 'error');
      return;
    }
    const newItem: NavItemConfig = {
      id: `nav_custom_${Date.now()}`,
      label: newNavLabel.trim(),
      route: newNavRoute.trim(),
      is_enabled: true,
      order: navItems.length + 1,
    };
    setNavItems((prev) => [...prev, newItem]);
    setNewNavLabel('');
    setNewNavRoute('');
    addToast('Menu Item Added', `Added "${newItem.label}" to navigation. Click Save to persist.`, 'info');
  };

  const handleDeleteNav = (id: string) => {
    setNavItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Plan editing helper
  const handleUpdatePlan = (planId: string, field: keyof PricingPlan, value: any) => {
    setPricingPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Admin CMS Control Room
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Website Content & System Customizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control branding, logo uploads, discount campaigns, pricing plans, admin passcode/username, and page copy.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'branding', label: '1. Brand & Logo', icon: Layers },
          { id: 'navigation', label: '2. Navigation Menu', icon: Navigation },
          { id: 'discount', label: '3. Discount Campaign', icon: Tag },
          { id: 'pricing', label: '4. Pricing Plans', icon: CreditCard },
          { id: 'credentials', label: '5. Admin Passcode & Username', icon: KeyRound },
          { id: 'hero', label: '6. Hero Section', icon: Sparkles },
          { id: 'about', label: '7. About & Metrics', icon: FileText },
          { id: 'footer', label: '8. Footer & Links', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRANDING & LOGO UPLOAD */}
      {activeTab === 'branding' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Site Identity & Logo Customization</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customize your platform name, tagline, and upload your custom company logo image.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Website Name (Title)
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. ImgSphere"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Shown in the top Navbar, footer, and page title.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tagline / Subtext
              </label>
              <input
                type="text"
                value={siteTagline}
                onChange={(e) => setSiteTagline(e.target.value)}
                placeholder="e.g. Free Cloud Media Platform"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Mini subtitle displayed directly beneath your logo.
              </span>
            </div>
          </div>

          {/* Logo Format Selection */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Logo Display Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogoType('icon')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                  logoType === 'icon'
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-2 ring-purple-600/30 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Default Vector Icon Logo</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">High-resolution modern gradient layers icon</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLogoType('image')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                  logoType === 'image'
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-2 ring-purple-600/30 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Custom Image Logo (Upload / URL)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Upload your own logo image file or enter URL</div>
                </div>
              </button>
            </div>

            {/* Logo Upload Box */}
            {logoType === 'image' && (
              <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Upload Logo File Directly
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    Upload a transparent PNG, SVG, or high-res JPG from your device.
                  </p>

                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                    id="logo-file-input"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Choose Logo File from Device</span>
                    </button>

                    {logoImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoImageUrl('');
                          setLogoType('icon');
                          addToast('Logo Reset', 'Reset back to standard vector icon.', 'info');
                        }}
                        className="px-3.5 py-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all font-medium"
                      >
                        Remove Custom Logo
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Or Enter Hosted Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={logoImageUrl}
                    onChange={(e) => setLogoImageUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                {logoImageUrl && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <span className="text-xs font-semibold text-slate-500">Live Logo Preview:</span>
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center">
                      <img
                        src={logoImageUrl}
                        alt="Logo preview"
                        className="h-8 max-w-[160px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/140x40?text=Invalid+Image';
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ Active for top navbar and footer
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NAVIGATION MENU */}
      {activeTab === 'navigation' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-purple-600" />
              <span>Public Navbar Menu Items</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Toggle visibility, rename labels, or add custom page navigation links to the header navbar.
            </p>
          </div>

          <div className="space-y-3">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={item.is_enabled}
                    onChange={() => handleToggleNav(item.id)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateNavLabel(item.id, e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-44"
                  />
                  <span className="text-xs font-mono text-slate-400 truncate max-w-xs">
                    Target Route: {item.route}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteNav(item.id)}
                  className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors"
                  title="Remove from menu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom item */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
              Add New Navigation Item
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Link Label (e.g. Gallery)"
                value={newNavLabel}
                onChange={(e) => setNewNavLabel(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Route or Anchor (e.g. pricing or #features)"
                value={newNavRoute}
                onChange={(e) => setNewNavRoute(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomNav}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Nav Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISCOUNT CAMPAIGN */}
      {activeTab === 'discount' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600" />
                  <span>Promotional Discount Campaign Controller</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Run sitewide promotional sales, set discount percentages, coupon codes, and announcement banners.
                </p>
              </div>

              {/* Active Switch */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {discountActive ? 'Sale Active' : 'Sale Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => setDiscountActive(!discountActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    discountActive ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      discountActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Promotional Coupon Code
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE30"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Clients enter this code in the Pricing section to unlock savings.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Discount Percentage (%)
              </label>
              <div className="relative">
                <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={1}
                  max={95}
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                  placeholder="30"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Applied automatically to all paid monthly & annual tiers.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Banner Announcement Message
            </label>
            <textarea
              rows={2}
              value={discountBannerText}
              onChange={(e) => setDiscountBannerText(e.target.value)}
              placeholder="e.g. Limited Time Offer: Get 30% off all Pro & Business Storage plans with code"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Displayed prominently in the top header ribbon and on the pricing calculator.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Expiration Notice
            </label>
            <input
              type="text"
              value={discountExpiresAt}
              onChange={(e) => setDiscountExpiresAt(e.target.value)}
              placeholder="e.g. Ends this Sunday"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-800 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Live Banner Preview ({discountActive ? 'Visible to Clients' : 'Hidden'}):</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-bold bg-amber-500 text-slate-900 text-[10px]">
                  SPECIAL OFFER
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {discountBannerText} <strong>{discountCode}</strong> ({discountPercentage}% OFF)
                </span>
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                {discountExpiresAt}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRICING PLANS */}
      {activeTab === 'pricing' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span>Pricing Plans & Storage Capacities</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure storage quotas, single file limits, monthly and annual prices for each tier.
            </p>
          </div>

          <div className="space-y-6">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h4>
                      <span className="text-[11px] text-slate-500">ID: {plan.id}</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.is_popular}
                      onChange={(e) => handleUpdatePlan(plan.id, 'is_popular', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600"
                    />
                    <span>Highlight as Popular</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Monthly Price ($)
                    </label>
                    <input
                      type="number"
                      value={plan.monthly_price}
                      onChange={(e) => handleUpdatePlan(plan.id, 'monthly_price', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Annual Price ($/mo)
                    </label>
                    <input
                      type="number"
                      value={plan.annual_price}
                      onChange={(e) => handleUpdatePlan(plan.id, 'annual_price', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Cloud Storage (GB)
                    </label>
                    <input
                      type="number"
                      value={plan.storage_gb}
                      onChange={(e) => handleUpdatePlan(plan.id, 'storage_gb', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      value={plan.max_file_mb}
                      onChange={(e) => handleUpdatePlan(plan.id, 'max_file_mb', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Plan Description
                    </label>
                    <input
                      type="text"
                      value={plan.description}
                      onChange={(e) => handleUpdatePlan(plan.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      value={plan.badge || ''}
                      onChange={(e) => handleUpdatePlan(plan.id, 'badge', e.target.value)}
                      placeholder="e.g. Most Popular"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ADMIN CREDENTIALS (USERNAME & PASSCODE) */}
      {activeTab === 'credentials' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-600" />
              <span>Admin Passcode & Username Settings</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Directly configure the master credentials used to sign in to the Admin Portal.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Security Notice:</span>
              <p className="mt-0.5 leading-relaxed">
                The Admin Panel supports <strong>Sign In only</strong>. Public registration is permanently locked for admin accounts.
                Changes made here take effect immediately for Sarah (Admin) and any master passcode verification.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Username or Identifier
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="e.g. sarah_admin or admin@imgsphere.io"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Can be used instead of email when signing into Admin Portal.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Secret Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showAdminPasscode ? 'text' : 'password'}
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter new admin passcode"
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showAdminPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Required password/passcode to authenticate as Administrator.
              </span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Current Active Passcode:{' '}
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                {showAdminPasscode ? adminPasscode : '••••••••'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleUpdateAdminCredentialsOnly}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Update Admin Credentials</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: HERO SECTION */}
      {activeTab === 'hero' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Landing Page Hero Header</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Edit the main call-to-action, headline, and subtext displayed at the top of your public landing page.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Top Announcement Pill / Badge
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Main Headline (H1)
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Sub-Headline Narrative
              </label>
              <textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary CTA Button Text
                </label>
                <input
                  type="text"
                  value={heroCtaPrimary}
                  onChange={(e) => setHeroCtaPrimary(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Secondary CTA Button Text
                </label>
                <input
                  type="text"
                  value={heroCtaSecondary}
                  onChange={(e) => setHeroCtaSecondary(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ABOUT & METRICS */}
      {activeTab === 'about' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>About Section & Performance Metrics</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Modify the headline, company narrative, and the three key stat metrics shown on the homepage.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                About Section Title
              </label>
              <input
                type="text"
                value={aboutHeading}
                onChange={(e) => setAboutHeading(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                About Narrative
              </label>
              <textarea
                rows={3}
                value={aboutDescription}
                onChange={(e) => setAboutDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs font-bold text-purple-600 block mb-1">Metric 1</span>
                <input
                  type="text"
                  placeholder="Value (e.g. 99.9%)"
                  value={stat1Val}
                  onChange={(e) => setStat1Val(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-2"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. Uptime)"
                  value={stat1Label}
                  onChange={(e) => setStat1Label(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs font-bold text-purple-600 block mb-1">Metric 2</span>
                <input
                  type="text"
                  placeholder="Value (e.g. < 45ms)"
                  value={stat2Val}
                  onChange={(e) => setStat2Val(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-2"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. CDN Latency)"
                  value={stat2Label}
                  onChange={(e) => setStat2Label(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs font-bold text-purple-600 block mb-1">Metric 3</span>
                <input
                  type="text"
                  placeholder="Value (e.g. 100% Free)"
                  value={stat3Val}
                  onChange={(e) => setStat3Val(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-2"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. Community Tier)"
                  value={stat3Label}
                  onChange={(e) => setStat3Label(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: FOOTER & LINKS */}
      {activeTab === 'footer' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <span>Footer Branding & Status Details</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customize the animated footer copy, copyright disclaimer, operational status line, and contact email.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Footer Brand Summary
              </label>
              <textarea
                rows={2}
                value={footerDescription}
                onChange={(e) => setFooterDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={footerCopyright}
                  onChange={(e) => setFooterCopyright(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Operational Status Badge
                </label>
                <input
                  type="text"
                  value={footerStatusText}
                  onChange={(e) => setFooterStatusText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Support / Inquiries Email
              </label>
              <input
                type="email"
                value={footerContactLink}
                onChange={(e) => setFooterContactLink(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Action Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          All changes save to local storage and immediately update the public website, footer, navbar, and admin authentication.
        </span>
        <button
          type="button"
          onClick={() => handleSaveAll()}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save All Changes Now</span>
        </button>
      </div>
    </div>
  );
};
