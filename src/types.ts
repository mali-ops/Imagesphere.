export type UserRole = 'user' | 'admin' | 'owner';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'disabled';
export type ImageVisibility = 'public' | 'unlisted' | 'private';
export type ReportReason = 'Spam' | 'Copyright Concern' | 'Inappropriate Content' | 'Malware Concern' | 'Other';
export type ReportStatus = 'Pending' | 'Resolved' | 'Dismissed' | 'pending' | 'resolved' | 'dismissed';
export type ThemeMode = 'light' | 'dark' | 'system';

export type AdminPermission =
  // Dashboard Module
  | 'dashboard.view'
  // Users / Clients Module
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.suspend'
  // Admins Module
  | 'admins.view'
  | 'admins.create'
  | 'admins.edit'
  | 'admins.remove'
  | 'admins.suspend'
  | 'admins.reset_password'
  // Resources / Media
  | 'resources.view'
  | 'resources.create'
  | 'resources.edit'
  | 'resources.delete'
  // Projects / Requests
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'projects.assign'
  // Payments & Billing
  | 'payments.view'
  | 'payments.approve'
  | 'payments.reject'
  | 'payments.refund'
  // Reports & Analytics
  | 'reports.view'
  | 'reports.export'
  // Website CMS & Pages
  | 'website.content'
  | 'website.pages'
  | 'website.media'
  | 'website.seo'
  // Settings Module
  | 'settings.view'
  | 'settings.edit'
  // Security Module
  | 'security.logs'
  | 'security.sessions'
  | 'security.permissions'
  // Backwards compatibility legacy aliases
  | 'manage_users'
  | 'solve_client_issues'
  | 'manage_payments'
  | 'manage_subscriptions'
  | 'manage_reports'
  | 'manage_cms'
  | 'view_analytics';

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: AdminPermission[];
  is_system?: boolean;
  member_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  user_email?: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  login_time: string;
  last_active: string;
  is_current: boolean;
}

export interface ClientProject {
  id: string;
  client_id: string;
  client_name: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  budget?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_admin?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  category: 'info' | 'warning' | 'security' | 'success' | 'error';
  timestamp: string;
  is_read: boolean;
  action_url?: string;
}

export interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string;
  phone?: string;
  bio?: string;
  role: UserRole;
  custom_role?: string;
  admin_permissions?: AdminPermission[];
  two_factor_enabled?: boolean;
  assigned_by?: string;
  assigned_at?: string;
  client_notes?: string;
  status: UserStatus;
  storage_limit: number; // in bytes (e.g. 1073741824 = 1GB)
  storage_used: number;  // in bytes
  created_at: string;
  updated_at: string;
  website?: string;
  last_login?: string;
  passcode?: string;
  password?: string;
  social_links?: {
    twitter?: string;
    github?: string;
    instagram?: string;
  };
  plan?: 'free' | 'pro' | 'business' | string;
  plan_name?: string;
  subscription_status?: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';
  trial_start_date?: string;
  trial_end_date?: string;
  trial_days_total?: number;
  auto_debit_enabled?: boolean;
  next_billing_date?: string;
  card_last4?: string;
  card_brand?: string;
  billing_plan?: string;
  billing_amount?: number;
}

export interface ClientIssueTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  issue_type: 'storage_quota' | 'login_access' | 'billing' | 'upload_error' | 'image_corruption' | 'other';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface AdminActivityLog {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: 'owner' | 'admin';
  action: string;
  target_type: 'user' | 'admin' | 'system' | 'client_issue' | 'payment';
  target_id?: string;
  details: string;
  ip?: string;
  device?: string;
  status?: 'success' | 'failed' | 'blocked';
  timestamp: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  plan_name: string;
  billing_cycle: 'monthly' | 'annual';
  status: 'paid' | 'failed' | 'pending';
  description: string;
  card_last4?: string;
  card_brand?: string;
  created_at: string;
}

export interface ImageItem {
  id: string;
  user_id: string;
  uploader_name?: string;
  title: string;
  description?: string;
  file_name: string;
  original_name: string;
  storage_url: string;
  thumbnail_url: string;
  file_size: number; // in bytes
  mime_type: string;
  width: number;
  height: number;
  folder_id?: string;
  visibility: ImageVisibility;
  views: number;
  downloads: number;
  tags: string[];
  public_slug: string;
  created_at: string;
  updated_at: string;
  is_reported?: boolean;
  public_disabled?: boolean;
  original_file_size?: number;
  compression_ratio?: number;
  was_compressed?: boolean;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface ImageAnalyticsEvent {
  id: string;
  image_id: string;
  event_type: 'view' | 'download' | 'share';
  ip_hash?: string;
  user_agent?: string;
  created_at: string;
}

export interface Report {
  id: string;
  image_id: string;
  image_title: string;
  image_url: string;
  reporter_id?: string;
  reporter_email: string;
  reason: ReportReason;
  description: string;
  details?: string;
  status: ReportStatus;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  status: 'active' | 'inactive';
  created_at: string;
  expires_at?: string;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  created_at: string;
}

export interface NavItemConfig {
  id: string;
  label: string;
  route: string;
  is_enabled: boolean;
  order: number;
}

export interface FeatureItemConfig {
  id: string;
  title: string;
  description: string;
  icon_name: string;
}

export interface DiscountCampaign {
  is_active: boolean;
  code: string;
  percentage: number;
  banner_text: string;
  expiry_date?: string;
  expires_at?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  monthly_price: number;
  annual_price: number;
  storage_gb: number;
  max_file_mb: number;
  description: string;
  features: string[];
  is_popular?: boolean;
  cta_label: string;
}

export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: string;
  user_id?: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  customer_email: string;
  customer_name?: string;
  payment_method?: string; // Bank Transfer, EasyPaisa, JazzCash, Safepay, Other
  sender_account_or_phone?: string;
  sender_name?: string;
  transaction_id?: string;
  transaction_date?: string; // Date/time when payment transfer was performed
  voucher_url: string; // screenshot data URL or hosted image URL
  voucher_file_name: string;
  voucher_file_size?: number;
  notes?: string;
  status: PaymentRequestStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  max_image_size_mb: number;
  max_images_per_upload: number;
  allowed_file_formats: string[];
  default_storage_limit_mb: number;
  enable_registrations: boolean;
  enable_guest_uploads: boolean;
  maintenance_mode: boolean;
  site_name: string;
  site_logo: string;
  site_tagline: string;
  logo_type: 'icon' | 'image';
  logo_image_url?: string;
  support_email: string;

  // Live CMS Customization
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  about_heading: string;
  about_description: string;
  about_stat_1_val: string;
  about_stat_1_label: string;
  about_stat_2_val: string;
  about_stat_2_label: string;
  about_stat_3_val: string;
  about_stat_3_label: string;
  footer_description: string;
  footer_copyright: string;
  footer_status_text: string;
  footer_contact_link: string;
  nav_items: NavItemConfig[];
  features_list: FeatureItemConfig[];

  // Discount & Pricing
  discount_campaign?: DiscountCampaign;
  pricing_plans?: PricingPlan[];

  // Free Trial & Auto-Debit Recurring System
  trial_enabled?: boolean;
  trial_duration_days?: number; // e.g. 7 or 14
  trial_plan_id?: string; // 'pro'
  trial_plan_name?: string; // 'Pro Plan'
  trial_plan_price?: number; // 9.99
  auto_debit_enabled?: boolean; // true

  // Bank & Manual Payment Verification Details
  bank_name?: string;
  account_title?: string;
  account_number?: string;
  account_iban?: string;
  account_routing_or_branch?: string;
  easypaisa_account_title?: string;
  easypaisa_account_number?: string;
  jazzcash_account_title?: string;
  jazzcash_account_number?: string;
  payment_instructions?: string;
  payment_contact_note?: string;

  // Safepay Payment Gateway & Personal Bank Payout Engine
  safepay_api_key?: string;
  safepay_v1_secret?: string;
  safepay_webhook_secret?: string;
  safepay_merchant_id?: string;
  safepay_environment?: 'sandbox' | 'production';
  payment_gateway_mode?: 'test' | 'live';
  payout_bank_name?: string;
  payout_account_title?: string;
  payout_account_number?: string;
  payout_iban?: string;
  payout_frequency?: 'daily' | 'weekly' | 'monthly';
  payout_currency?: string;

  // Admin Credentials Customization
  admin_passcode?: string;
  admin_username?: string;

  // Storage Secrets & Cloud Credentials
  storage_provider_name: 'local' | 'cloudinary' | 'supabase' | 's3' | 'custom';
  cloudinary_cloud_name: string;
  cloudinary_upload_preset?: string;
  cloudinary_api_key: string;
  cloudinary_api_secret: string;
  supabase_url: string;
  supabase_anon_key: string;
  supabase_service_role_secret: string;
  s3_bucket_name: string;
  s3_region: string;
  s3_access_key: string;
  s3_secret_key: string;
  s3_endpoint: string;
  custom_cdn_domain: string;

  // Image Compression & Optimization Pipeline
  enable_auto_compression?: boolean;
  compression_quality?: number; // 0.1 to 1.0 (default: 0.82)
  compression_max_width?: number; // max px width (default: 2560)
  compression_max_height?: number; // max px height (default: 2560)
  compression_output_format?: 'auto' | 'webp' | 'jpeg' | 'original';
}

export interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  speed: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMsg?: string;
  result?: ImageItem;
  compressionInfo?: {
    originalSize: number;
    compressedSize: number;
    savingsPercent: number;
    wasCompressed: boolean;
  };
  settings: {
    title: string;
    description: string;
    tags: string[];
    folder_id?: string;
    visibility: ImageVisibility;
  };
}

export type WebhookEvent = 'image.created' | 'image.deleted' | 'image.viewed';
export type WebhookFormat = 'json_standard' | 'discord' | 'slack';

export interface WebhookConfig {
  id: string;
  user_id: string;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEvent[];
  format: WebhookFormat;
  is_active: boolean;
  created_at: string;
  last_triggered_at?: string;
  last_status?: number;
  last_status_text?: string;
  total_deliveries: number;
  successful_deliveries: number;
}

export interface WebhookDeliveryLog {
  id: string;
  webhook_id: string;
  webhook_name: string;
  event: string;
  url: string;
  status_code: number;
  status: 'success' | 'failed' | 'timeout';
  duration_ms: number;
  request_payload: any;
  response_body?: string;
  created_at: string;
}

export type AppRoute =
  | 'home'
  | 'landing'
  | 'features'
  | 'how-it-works'
  | 'about'
  | 'reviews'
  | 'pricing'
  | 'help'
  | 'contact'
  | 'payment-verification'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'auth-login'
  | 'auth-signup'
  | 'auth-forgot'
  | 'public-image'
  | 'dashboard-overview'
  | 'dashboard-upload'
  | 'dashboard-images'
  | 'dashboard-image-detail'
  | 'dashboard-folders'
  | 'dashboard-analytics'
  | 'dashboard-storage'
  | 'dashboard-profile'
  | 'dashboard-settings'
  | 'dashboard-billing'
  | 'dashboard-webhooks'
  | 'dashboard-help'
  | 'admin-overview'
  | 'admin-users'
  | 'admin-subscriptions'
  | 'admin-images'
  | 'admin-storage'
  | 'admin-reports'
  | 'admin-analytics'
  | 'admin-activity'
  | 'admin-announcements'
  | 'admin-settings'
  | 'admin-cms'
  | 'admin-support'
  | 'admin-payments'
  | 'admin-owner'
  | 'admin-clients-desk';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
