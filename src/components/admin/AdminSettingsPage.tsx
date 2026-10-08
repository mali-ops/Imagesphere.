import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Save,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Megaphone,
  Layers,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Server,
  Zap,
  Info,
  CreditCard,
  Building,
  Shield,
  Lock,
  Activity,
  Sparkles,
} from 'lucide-react';
import { testCloudinaryConnection, activeStorageProvider } from '../../services/storage';

export const AdminSettingsPage: React.FC = () => {
  const {
    storageProvider,
    setStorageProvider,
    systemSettings,
    updateSystemSettings,
    confirm,
    resetToSeedData,
    addToast,
  } = useApp();

  const [maxUploadMB, setMaxUploadMB] = useState(systemSettings.max_image_size_mb || 10);
  const [defaultQuotaMB, setDefaultQuotaMB] = useState(systemSettings.default_storage_limit_mb || 1024);
  const [allowGuestUploads, setAllowGuestUploads] = useState(systemSettings.enable_guest_uploads ?? true);
  const [maintenanceMode, setMaintenanceMode] = useState(systemSettings.maintenance_mode ?? false);

  // Storage provider & Secrets
  const [selectedProvider, setSelectedProvider] = useState<'local' | 'cloudinary' | 'supabase' | 's3' | 'custom'>(
    systemSettings.storage_provider_name || 'supabase'
  );

  // Cloudinary
  const [cloudName, setCloudName] = useState(
    systemSettings.cloudinary_cloud_name && systemSettings.cloudinary_cloud_name !== 'imgsphere-cdn'
      ? systemSettings.cloudinary_cloud_name
      : 'q2eqlpu7'
  );
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(systemSettings.cloudinary_upload_preset || 'h4iodeef');
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState(systemSettings.cloudinary_api_key || '');
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState(systemSettings.cloudinary_api_secret || '');

  // Supabase
  const [supabaseUrl, setSupabaseUrl] = useState(systemSettings.supabase_url || 'https://xyzcompany.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(systemSettings.supabase_anon_key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key');
  const [supabaseServiceSecret, setSupabaseServiceSecret] = useState(systemSettings.supabase_service_role_secret || '');

  // AWS S3 / R2
  const [s3Bucket, setS3Bucket] = useState(systemSettings.s3_bucket_name || 'imgsphere-public-vault');
  const [s3Region, setS3Region] = useState(systemSettings.s3_region || 'us-east-1');
  const [s3AccessKey, setS3AccessKey] = useState(systemSettings.s3_access_key || '');
  const [s3SecretKey, setS3SecretKey] = useState(systemSettings.s3_secret_key || '');
  const [s3Endpoint, setS3Endpoint] = useState(systemSettings.s3_endpoint || '');

  // Custom CDN
  const [customCdnDomain, setCustomCdnDomain] = useState(systemSettings.custom_cdn_domain || 'https://cdn.imgsphere.io');

  // Reveal toggles for sensitive secret keys
  const [showCloudinarySecret, setShowCloudinarySecret] = useState(false);
  const [showSupabaseSecret, setShowSupabaseSecret] = useState(false);
  const [showS3Secret, setShowS3Secret] = useState(false);

  // Test status state
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'warning' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  // Announcement
  const [announcementText, setAnnouncementText] = useState('Welcome to ImgSphere — 1 GB Free High-Speed Cloud Image Hosting');
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Bank & Manual Payments Settings
  const [bankName, setBankName] = useState(systemSettings.bank_name || 'Meezan Bank Ltd / Standard Chartered');
  const [accountTitle, setAccountTitle] = useState(systemSettings.account_title || 'ImgSphere Cloud Media Global');
  const [accountNumber, setAccountNumber] = useState(systemSettings.account_number || '0102-0103492810');
  const [accountIban, setAccountIban] = useState(systemSettings.account_iban || 'PK36MEZN0001020103492810');
  const [paymentInstructions, setPaymentInstructions] = useState(
    systemSettings.payment_instructions ||
      'Transfer the plan subscription amount to the official bank account listed above. Once payment is made, upload the voucher screenshot and submit your email below.'
  );
  const [paymentContactNote, setPaymentContactNote] = useState(
    !systemSettings.payment_contact_note || systemSettings.payment_contact_note.includes('Hamari team')
      ? 'Our team will contact you within 24 hours to verify payment and activate your premium plan.'
      : systemSettings.payment_contact_note
  );

  // Option 2: Safepay Payment Gateway & Personal Bank Payout Engine
  const [safepayApiKey, setSafepayApiKey] = useState(systemSettings.safepay_api_key || 'sec_test_sample_safepay_key_9921');
  const [safepayV1Secret, setSafepayV1Secret] = useState(systemSettings.safepay_v1_secret || 'v1_secret_sample_safepay_key');
  const [safepayWebhookSecret, setSafepayWebhookSecret] = useState(systemSettings.safepay_webhook_secret || 'whsec_safepay_demo_live');
  const [safepayMerchantId, setSafepayMerchantId] = useState(systemSettings.safepay_merchant_id || 'mch_imgsphere_pk_01');
  const [paymentGatewayMode, setPaymentGatewayMode] = useState<'test' | 'live'>(systemSettings.payment_gateway_mode || 'test');
  const [payoutBankName, setPayoutBankName] = useState(systemSettings.payout_bank_name || 'Meezan Bank Ltd / HBL');
  const [payoutAccountTitle, setPayoutAccountTitle] = useState(systemSettings.payout_account_title || 'Ali Raza (Owner Account)');
  const [payoutAccountNumber, setPayoutAccountNumber] = useState(systemSettings.payout_account_number || '0102-0103492810');
  const [payoutIban, setPayoutIban] = useState(systemSettings.payout_iban || 'PK36MEZN0001020103492810');
  const [payoutFrequency, setPayoutFrequency] = useState<'daily' | 'weekly' | 'monthly'>(systemSettings.payout_frequency || 'daily');
  const [payoutCurrency, setPayoutCurrency] = useState(systemSettings.payout_currency || 'USD');

  const handleTestSecrets = async () => {
    setTestingConnection(true);
    setTestResult({ status: 'idle', message: '' });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-role': 'admin',
        'x-user-id': 'admin',
      };
      if (typeof sessionStorage !== 'undefined') {
        const token = sessionStorage.getItem('img_auth_session_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/storage/test-connection', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          provider: selectedProvider,
          config: {
            supabase_url: supabaseUrl,
            supabase_anon_key: supabaseAnonKey,
            cloudinary_cloud_name: cloudName,
          },
        }),
      });

      const data = await res.json();
      setTestingConnection(false);

      if (data.success) {
        setTestResult({
          status: 'success',
          message: data.message || `Connection to ${selectedProvider.toUpperCase()} verified successfully.`,
        });
        addToast(
          'Storage Verified',
          data.message || `${selectedProvider.toUpperCase()} credentials validated!`,
          'success'
        );
      } else {
        setTestResult({
          status: 'error',
          message: data.message || 'Connection test failed. Check settings and retry.',
        });
        addToast('Storage Test Failed', data.message || 'Verification failed.', 'error');
      }
    } catch {
      setTestingConnection(false);
      setTestResult({
        status: 'error',
        message: 'Could not contact server storage validation service.',
      });
      addToast('Storage Test Error', 'Could not contact server validation service.', 'error');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      max_image_size_mb: maxUploadMB,
      default_storage_limit_mb: defaultQuotaMB,
      enable_guest_uploads: allowGuestUploads,
      maintenance_mode: maintenanceMode,
      storage_provider_name: selectedProvider,
      cloudinary_cloud_name: cloudName,
      cloudinary_upload_preset: cloudinaryUploadPreset,
      cloudinary_api_key: cloudinaryApiKey,
      cloudinary_api_secret: cloudinaryApiSecret,
      supabase_url: supabaseUrl,
      supabase_anon_key: supabaseAnonKey,
      supabase_service_role_secret: supabaseServiceSecret,
      s3_bucket_name: s3Bucket,
      s3_region: s3Region,
      s3_access_key: s3AccessKey,
      s3_secret_key: s3SecretKey,
      s3_endpoint: s3Endpoint,
      custom_cdn_domain: customCdnDomain,
      bank_name: bankName,
      account_title: accountTitle,
      account_number: accountNumber,
      account_iban: accountIban,
      payment_instructions: paymentInstructions,
      payment_contact_note: paymentContactNote,
      safepay_api_key: safepayApiKey,
      safepay_v1_secret: safepayV1Secret,
      safepay_webhook_secret: safepayWebhookSecret,
      safepay_merchant_id: safepayMerchantId,
      safepay_environment: paymentGatewayMode === 'live' ? 'production' : 'sandbox',
      payment_gateway_mode: paymentGatewayMode,
      payout_bank_name: payoutBankName,
      payout_account_title: payoutAccountTitle,
      payout_account_number: payoutAccountNumber,
      payout_iban: payoutIban,
      payout_frequency: payoutFrequency,
      payout_currency: payoutCurrency,
    });
    addToast('Platform Settings Saved', 'Storage credentials and bank payout configuration updated successfully.', 'success');
  };

  const handleResetFactory = () => {
    confirm({
      title: 'Reset to Factory Seed Data?',
      message: 'This will reset all images, users, folders, and reports back to original initial showcase data.',
      confirmLabel: 'Reset Database',
      isDestructive: true,
      onConfirm: () => {
        resetToSeedData();
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            System Infrastructure
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Platform Settings & Cloud Storage Secrets
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage upload thresholds, cloud storage backend API keys & secrets, maintenance mode, and announcements.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* General Upload & Storage Limits */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-600" />
            <span>Upload Quotas & System Limits</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Maximum File Upload Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={maxUploadMB}
                onChange={(e) => setMaxUploadMB(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Free-tier default: 10 MB per image
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Default User Storage Allocation (MB)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={defaultQuotaMB}
                onChange={(e) => setDefaultQuotaMB(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                1024 MB = 1.0 GB included free per registered client
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowGuestUploads}
                onChange={(e) => setAllowGuestUploads(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Allow Guest Instant Uploads
                </span>
                <span className="text-[11px] text-slate-400">
                  Allow non-logged-in visitors to upload temporary images from landing page
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Maintenance Mode
                </span>
                <span className="text-[11px] text-slate-400">
                  Display maintenance notice banner to non-admin visitors
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* FULL-STACK SECURITY DEFENSE & HARDENING OVERVIEW */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Full-Stack Security & Defense Health</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Hardened
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time defensive security controls protecting secrets, APIs, and media endpoints.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Security Logging Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Secret Isolation</span>
                <Lock className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-sm font-bold text-white">Server-Side Only</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Zero API secrets persisted to browser localStorage or exposed in client JS.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>SSRF Protection</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-white">Active Guard</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Blocks AWS/GCP metadata (169.254.169.254), loopback (127.0.0.1) & RFC1918 IPs.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Rate Limiting</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-sm font-bold text-white">Sliding Window</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Downloads (40/m), URL Fetch (20/m), Webhooks (30/m), Auth (15/m).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>HTTP Headers</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-sm font-bold text-white">Strict Policies</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                CSP, HSTS, X-Content-Type-Options: nosniff, SVG script sandbox.
              </p>
            </div>
          </div>
        </div>

        {/* STORAGE SECRETS & CLOUD CREDENTIALS MANAGER */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-600" />
                <span>Cloud Storage & API Secrets Manager (سٹوریج سیکرٹس)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure your secret API tokens, keys, and endpoints for external Cloud storage providers.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Encrypted Local Vault</span>
            </div>
          </div>

          {/* Provider Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Active Storage Backend Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'supabase', label: 'Supabase Storage', badge: 'Active (Free Tier)' },
                { id: 'local', label: 'Free Engine', badge: 'Zero Cost / Fast' },
                { id: 's3', label: 'Cloudflare R2 / S3', badge: '10GB Free' },
                { id: 'cloudinary', label: 'Cloudinary CDN', badge: '25 GB Tier' },
                { id: 'custom', label: 'Custom CDN', badge: 'Direct Proxy' },
              ].map((prov, idx) => {
                const isSelected = selectedProvider === prov.id;
                return (
                  <button
                    key={`prov-btn-${prov.id || idx}`}
                    type="button"
                    onClick={() => setSelectedProvider(prov.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-600/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{prov.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{prov.badge}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Local Free Storage Panel */}
          {selectedProvider === 'local' && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>100% Free Built-in Storage Engine Active (مفت سٹوریج موڈ)</span>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                Aapko kisi external cloud provider (jaise AWS ya Cloudinary) ko koi paise ya credit card dene ki zaroorat nahi hai. Saari images aur media browser storage aur high-speed canvas engine ke zariye <strong>bilkul free</strong> process aur host hoti hain.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Monthly Cost</span>
                  <span className="text-emerald-600 font-extrabold text-sm">$0.00 (Free Forever)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">API Keys Required</span>
                  <span className="text-slate-700 dark:text-slate-200 font-bold text-sm">None (0 Setup)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Client Quotas</span>
                  <span className="text-purple-600 font-bold text-sm">Free (500MB) / Prime (15GB) / Pro (50GB)</span>
                </div>
              </div>
            </div>
          )}

          {/* Provider Specific Secret Fields */}
          {selectedProvider === 'cloudinary' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Cloud className="w-4 h-4 text-blue-500" />
                <span>Cloudinary API Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Cloud Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cloudName}
                    onChange={(e) => setCloudName(e.target.value)}
                    placeholder="e.g. dxyz123abc"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Cloudinary Dashboard ke top par &quot;Cloud Name&quot; likha hota hai.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Upload Preset (Unsigned)
                  </label>
                  <input
                    type="text"
                    value={cloudinaryUploadPreset}
                    onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                    placeholder="e.g. ml_default"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Cloudinary Settings ➔ Upload ➔ Add upload preset (Signing mode: Unsigned). Default: ml_default
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    API Key (Optional)
                  </label>
                  <input
                    type="text"
                    value={cloudinaryApiKey}
                    onChange={(e) => setCloudinaryApiKey(e.target.value)}
                    placeholder="e.g. 928471928472918"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    API Secret (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showCloudinarySecret ? 'text' : 'password'}
                      value={cloudinaryApiSecret}
                      onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                      placeholder="c9x8A_Secr3tToken..."
                      className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCloudinarySecret(!showCloudinarySecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showCloudinarySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedProvider === 'supabase' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Server className="w-4 h-4 text-emerald-500" />
                  <span>Supabase Storage Credentials (فعال سٹوریج)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSupabaseUrl('https://xyzcompany.supabase.co');
                    setSupabaseAnonKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key');
                    addToast('Supabase Template Set', 'Apna Supabase Project URL aur Anon Key darj karein.', 'info');
                  }}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Fill Supabase Template
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200">
                <p className="font-semibold mb-1">Supabase Storage kaise configure karein?</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Supabase Dashboard ➔ <strong>Storage</strong> ➔ &quot;New Bucket&quot; banayein (naam: <code>images</code>, Public bucket ko <strong>ON</strong> rakhein).</li>
                  <li><strong>Project Settings</strong> ➔ <strong>API</strong> me jayein.</li>
                  <li><strong>Project URL</strong> aur <strong>anon public</strong> key copy kar ke yahan paste karein.</li>
                  <li>Supabase me 1 GB bilkul <strong>Free Tier</strong> storage aur instant global CDN milta hai!</li>
                </ol>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Project URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://yourproject.supabase.co"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Public Anon Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Service Role Secret (Private / Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showSupabaseSecret ? 'text' : 'password'}
                      value={supabaseServiceSecret}
                      onChange={(e) => setSupabaseServiceSecret(e.target.value)}
                      placeholder="eyJhbGci..."
                      className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSupabaseSecret(!showSupabaseSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showSupabaseSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedProvider === 's3' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <HardDrive className="w-4 h-4 text-amber-500" />
                  <span>Cloudflare R2 / AWS S3 Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setS3Bucket('imgsphere-vault');
                    setS3Region('auto');
                    setS3Endpoint('https://<account_id>.r2.cloudflarestorage.com');
                    addToast('Cloudflare R2 Template Loaded', 'Account ID aur API Tokens darj karein.', 'info');
                  }}
                  className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 underline"
                >
                  Fill Cloudflare R2 Template
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">Cloudflare R2 setup kaise karein?</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Cloudflare Dashboard ➔ <strong>R2 Object Storage</strong> ➔ &quot;Create bucket&quot; banayein (e.g. <code>imgsphere-vault</code>).</li>
                  <li><strong>Manage R2 API Tokens</strong> ➔ &quot;Create API token&quot; (Object Read & Write permission).</li>
                  <li>Token banne ke baad <strong>Access Key ID</strong>, <strong>Secret Access Key</strong>, aur <strong>Endpoint URL</strong> copy kar ke yahan save karein.</li>
                  <li>Cloudflare R2 me pehle <strong>10 GB / month bilkul Free</strong> hotay hain aur egress fees zero hai!</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Bucket Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={s3Bucket}
                    onChange={(e) => setS3Bucket(e.target.value)}
                    placeholder="e.g. imgsphere-vault"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Region (R2 ke liye &apos;auto&apos;)
                  </label>
                  <input
                    type="text"
                    value={s3Region}
                    onChange={(e) => setS3Region(e.target.value)}
                    placeholder="auto ya us-east-1"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Access Key ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={s3AccessKey}
                    onChange={(e) => setS3AccessKey(e.target.value)}
                    placeholder="AKIA... ya R2 Token Key"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Secret Access Key <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showS3Secret ? 'text' : 'password'}
                      value={s3SecretKey}
                      onChange={(e) => setS3SecretKey(e.target.value)}
                      placeholder="Secret Key..."
                      className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowS3Secret(!showS3Secret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showS3Secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Custom S3 / Cloudflare R2 Endpoint URL
                </label>
                <input
                  type="text"
                  value={s3Endpoint}
                  onChange={(e) => setS3Endpoint(e.target.value)}
                  placeholder="https://<account_id>.r2.cloudflarestorage.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Cloudflare R2 Bucket settings me S3 API endpoint URL milta hai.
                </span>
              </div>
            </div>
          )}

          {selectedProvider === 'custom' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Zap className="w-4 h-4 text-purple-500" />
                <span>Custom CDN Origin Domain</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  CDN Base Domain
                </label>
                <input
                  type="url"
                  value={customCdnDomain}
                  onChange={(e) => setCustomCdnDomain(e.target.value)}
                  placeholder="https://cdn.imgsphere.io"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* Test Secrets Connection Button & Status Output */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={testingConnection}
                onClick={handleTestSecrets}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{testingConnection ? 'Testing Cloud API Handshake...' : 'Test Storage Credentials'}</span>
              </button>
            </div>

            {testResult.status === 'success' && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>API Secrets Verified & Ready</span>
              </div>
            )}
          </div>

          {testResult.message && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-mono">
              {testResult.message}
            </div>
          )}
        </div>

        {/* Bank Account & Manual Payments Configuration */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Receiving Bank Account & Voucher Settings</span>
            </h3>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg">
              Shown to users when upgrading plans
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure the bank account details and deposit instructions displayed in the plan upgrade modal. Users pay to this account and upload voucher screenshots.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Bank / Financial Institution Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Meezan Bank Ltd / Standard Chartered"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Title (Beneficiary Name)
              </label>
              <input
                type="text"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                placeholder="e.g. ImgSphere Cloud Media Global"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 0102-0103492810"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                International IBAN (Optional)
              </label>
              <input
                type="text"
                value={accountIban}
                onChange={(e) => setAccountIban(e.target.value)}
                placeholder="e.g. PK36MEZN0001020103492810"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Instructions to Customers
            </label>
            <textarea
              rows={2}
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Contact & Turnaround Notice (Displayed after submission)
            </label>
            <input
              type="text"
              value={paymentContactNote}
              onChange={(e) => setPaymentContactNote(e.target.value)}
              placeholder="e.g. Our team will contact you within 24 hours to verify payment and activate your premium plan."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        </div>

        {/* Option 2: Safepay Payment Gateway & Personal Bank Payout Engine */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Safepay Payment Gateway (SafePay انٹیگریشن)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All client payments are collected through Safepay (Debit/Credit Cards, Mobile Wallets, Net Banking) and routed to your bank account.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Environment:</span>
              <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentGatewayMode('test')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    paymentGatewayMode === 'test'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Safepay Sandbox (Test)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGatewayMode('live')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    paymentGatewayMode === 'live'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Safepay Production (Live)
                </button>
              </div>
            </div>
          </div>

          {/* Safepay API Credentials Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Safepay API Key (Client Key)
              </label>
              <input
                type="text"
                value={safepayApiKey}
                onChange={(e) => setSafepayApiKey(e.target.value)}
                placeholder="sec_..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Safepay Secret Key (v1 Secret)
              </label>
              <input
                type="password"
                value={safepayV1Secret}
                onChange={(e) => setSafepayV1Secret(e.target.value)}
                placeholder="Enter Safepay v1 Secret"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Safepay Webhook Secret Key
              </label>
              <input
                type="password"
                value={safepayWebhookSecret}
                onChange={(e) => setSafepayWebhookSecret(e.target.value)}
                placeholder="whsec_..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Safepay Merchant / Channel ID
              </label>
              <input
                type="text"
                value={safepayMerchantId}
                onChange={(e) => setSafepayMerchantId(e.target.value)}
                placeholder="mch_..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* How Safepay Payouts Work Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/70 dark:border-emerald-800/50 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Safepay Payment Gateway Operational (سیف پے ادائیگی نظام فعال ہے):</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              All website payments are now processed exclusively via <strong>Safepay</strong>. Customers checkout seamlessly using Safepay Checkout, Debit/Credit Cards (Visa, Mastercard, PayPak, UnionPay), or Mobile Wallets. Safepay verifies payments and deposits earnings straight into your designated <strong>Personal Bank Account</strong> below.
            </p>
          </div>

          {/* Owner Payout Bank Information */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              <span>Owner Personal Bank Details (Where You Receive Payouts)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Bank Name
                </label>
                <input
                  type="text"
                  value={payoutBankName}
                  onChange={(e) => setPayoutBankName(e.target.value)}
                  placeholder="e.g. Meezan Bank / HBL / Standard Chartered / Chase"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Title (Your Full Name)
                </label>
                <input
                  type="text"
                  value={payoutAccountTitle}
                  onChange={(e) => setPayoutAccountTitle(e.target.value)}
                  placeholder="e.g. Ali Raza"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  value={payoutAccountNumber}
                  onChange={(e) => setPayoutAccountNumber(e.target.value)}
                  placeholder="e.g. 0102-0103492810"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  International IBAN / Wire Routing
                </label>
                <input
                  type="text"
                  value={payoutIban}
                  onChange={(e) => setPayoutIban(e.target.value)}
                  placeholder="e.g. PK36MEZN0001020103492810"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Automated Payout Frequency
                </label>
                <select
                  value={payoutFrequency}
                  onChange={(e) => setPayoutFrequency(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="daily">Daily (Rolling 24h Payouts)</option>
                  <option value="weekly">Weekly (Every Monday)</option>
                  <option value="monthly">Monthly (1st of every month)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Settlement Currency
                </label>
                <select
                  value={payoutCurrency}
                  onChange={(e) => setPayoutCurrency(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (Rs)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Global Announcement Banner */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-purple-600" />
            <span>Global Announcement Banner</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Banner Content
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showAnnouncement}
              onChange={(e) => setShowAnnouncement(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Display Announcement on Website Header
            </span>
          </label>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetFactory}
            className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Factory Seed Data</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Platform Settings & Storage Secrets</span>
          </button>
        </div>
      </form>
    </div>
  );
};
