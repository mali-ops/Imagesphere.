import { AdminPermission, UserRole, CustomRole } from '../types';
import {
  LayoutDashboard,
  Users,
  Shield,
  HardDrive,
  Briefcase,
  CreditCard,
  BarChart3,
  Globe,
  Settings,
  Lock,
  Zap,
} from 'lucide-react';

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  icon: any;
  permissions: {
    id: AdminPermission;
    name: string;
    description: string;
  }[];
}

export const ENTERPRISE_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'dashboard',
    name: 'Dashboard & Telemetry',
    description: 'Access to administrative overview and KPI dashboards',
    icon: LayoutDashboard,
    permissions: [
      {
        id: 'dashboard.view',
        name: 'View Dashboard',
        description: 'Access to administrative telemetry, statistics, and overview graphs',
      },
    ],
  },
  {
    id: 'users',
    name: 'Client & User Management',
    description: 'Control user registrations, profiles, quotas, and accounts',
    icon: Users,
    permissions: [
      {
        id: 'users.view',
        name: 'View Clients',
        description: 'Browse client directory, search profiles, and inspect storage usage',
      },
      {
        id: 'users.create',
        name: 'Create Clients',
        description: 'Provision new client accounts with custom plan tiers and quotas',
      },
      {
        id: 'users.edit',
        name: 'Edit Clients',
        description: 'Update profile information, storage limits, and plan assignments',
      },
      {
        id: 'users.delete',
        name: 'Delete Clients',
        description: 'Permanently remove user accounts and wipe associated media assets',
      },
      {
        id: 'users.suspend',
        name: 'Suspend Clients',
        description: 'Temporarily lock client access and unpublish their public images',
      },
    ],
  },
  {
    id: 'admins',
    name: 'Administrator Management',
    description: 'Delegate administrative responsibilities and manage staff',
    icon: Shield,
    permissions: [
      {
        id: 'admins.view',
        name: 'View Admins',
        description: 'View list of system administrators and assigned permission roles',
      },
      {
        id: 'admins.create',
        name: 'Add Admin',
        description: 'Appoint new team members to administrative positions',
      },
      {
        id: 'admins.edit',
        name: 'Edit Admin',
        description: 'Modify admin contact details and assigned management duties',
      },
      {
        id: 'admins.remove',
        name: 'Remove Admin',
        description: 'Revoke administrative privileges and demote to regular user',
      },
      {
        id: 'admins.suspend',
        name: 'Suspend Admin',
        description: 'Temporarily freeze admin console access',
      },
      {
        id: 'admins.reset_password',
        name: 'Reset Admin Password',
        description: 'Initiate secure one-time password reset for administrators',
      },
    ],
  },
  {
    id: 'resources',
    name: 'Media & Cloud Storage',
    description: 'Supervise uploaded assets, compression engine, and storage drives',
    icon: HardDrive,
    permissions: [
      {
        id: 'resources.view',
        name: 'View Resources',
        description: 'Inspect image library, resolution specs, and hosting storage metrics',
      },
      {
        id: 'resources.create',
        name: 'Create Resources',
        description: 'Upload system assets, branding images, and global media files',
      },
      {
        id: 'resources.edit',
        name: 'Edit Resources',
        description: 'Update resource metadata, compression parameters, and CDN settings',
      },
      {
        id: 'resources.delete',
        name: 'Delete Resources',
        description: 'Purge inappropriate or corrupted media files from CDN storage',
      },
    ],
  },
  {
    id: 'projects',
    name: 'Projects & Client Requests',
    description: 'Handle customer creative projects, order queues, and custom requests',
    icon: Briefcase,
    permissions: [
      {
        id: 'projects.view',
        name: 'View Projects',
        description: 'Inspect submitted client projects, requests, and creative requirements',
      },
      {
        id: 'projects.create',
        name: 'Create Projects',
        description: 'Create new project tickets on behalf of enterprise clients',
      },
      {
        id: 'projects.edit',
        name: 'Edit Projects',
        description: 'Update project status, deliverables, deadlines, and revisions',
      },
      {
        id: 'projects.delete',
        name: 'Delete Projects',
        description: 'Archive or remove completed and cancelled client projects',
      },
      {
        id: 'projects.assign',
        name: 'Assign Projects',
        description: 'Assign project tickets to specific staff members and admins',
      },
    ],
  },
  {
    id: 'payments',
    name: 'Billing & Financials',
    description: 'Manage subscription invoices, bank transfers, and manual deductions',
    icon: CreditCard,
    permissions: [
      {
        id: 'payments.view',
        name: 'View Payments',
        description: 'Access billing ledger, subscription invoices, and payment receipts',
      },
      {
        id: 'payments.approve',
        name: 'Approve Payments',
        description: 'Verify bank deposit slips and approve offline voucher submissions',
      },
      {
        id: 'payments.reject',
        name: 'Reject Payments',
        description: 'Decline invalid payment vouchers with explanatory feedback',
      },
      {
        id: 'payments.refund',
        name: 'Refund Payments',
        description: 'Process payment reversals and issue credit balance adjustments',
      },
    ],
  },
  {
    id: 'reports',
    name: 'Reports & Content Moderation',
    description: 'Audit abuse complaints, DMCA takedowns, and security notices',
    icon: BarChart3,
    permissions: [
      {
        id: 'reports.view',
        name: 'View Reports',
        description: 'Review flagged content tickets and user violation notices',
      },
      {
        id: 'reports.export',
        name: 'Export Reports',
        description: 'Generate and download CSV/PDF audit and compliance exports',
      },
    ],
  },
  {
    id: 'website',
    name: 'Website CMS & Pages',
    description: 'Customize homepage banners, announcement tickers, and SEO meta tags',
    icon: Globe,
    permissions: [
      {
        id: 'website.content',
        name: 'Manage Content',
        description: 'Update portal copy, testimonials, FAQ guides, and features list',
      },
      {
        id: 'website.pages',
        name: 'Manage Pages',
        description: 'Configure navigation menu links and custom landing page routes',
      },
      {
        id: 'website.media',
        name: 'Manage Media',
        description: 'Update hero graphics, platform logos, and public promotional assets',
      },
      {
        id: 'website.seo',
        name: 'Manage SEO',
        description: 'Fine-tune OpenGraph tags, schema markup, and search engine titles',
      },
    ],
  },
  {
    id: 'settings',
    name: 'System Settings',
    description: 'Platform branding, email templates, and environment parameters',
    icon: Settings,
    permissions: [
      {
        id: 'settings.view',
        name: 'View Settings',
        description: 'Inspect system environment parameters and configuration state',
      },
      {
        id: 'settings.edit',
        name: 'Edit Settings',
        description: 'Update application settings, cloud storage configs, and brand assets',
      },
    ],
  },
  {
    id: 'security',
    name: 'Security & Access Audits',
    description: 'Active session revocation, two-factor auth status, and audit logs',
    icon: Lock,
    permissions: [
      {
        id: 'security.logs',
        name: 'View Logs',
        description: 'Examine cryptographic audit logs, administrative actions, and IP traces',
      },
      {
        id: 'security.sessions',
        name: 'Manage Sessions',
        description: 'Inspect active browser sessions and remotely revoke compromised logins',
      },
      {
        id: 'security.permissions',
        name: 'Manage Permissions',
        description: 'Audit and modify role assignments across the administrative roster',
      },
    ],
  },
];

// Flat list of all available permission keys
export const ALL_PERMISSION_KEYS: AdminPermission[] = ENTERPRISE_PERMISSION_GROUPS.flatMap((group) =>
  group.permissions.map((p) => p.id)
);

// Standard Pre-built Enterprise Roles
export const DEFAULT_PRESET_ROLES: CustomRole[] = [
  {
    id: 'role_senior_admin',
    name: 'Senior Administrator',
    description: 'Full administrative rights across users, projects, reports, media, and billing operations.',
    is_system: true,
    created_at: '2026-01-01T00:00:00.000Z',
    permissions: [
      'dashboard.view',
      'users.view',
      'users.create',
      'users.edit',
      'users.suspend',
      'admins.view',
      'resources.view',
      'resources.create',
      'resources.edit',
      'projects.view',
      'projects.create',
      'projects.edit',
      'projects.assign',
      'payments.view',
      'payments.approve',
      'reports.view',
      'reports.export',
      'website.content',
      'website.pages',
      'settings.view',
      'security.logs',
      // Legacy mapped
      'manage_users',
      'solve_client_issues',
      'manage_reports',
      'view_analytics',
    ],
  },
  {
    id: 'role_support_admin',
    name: 'Customer Support Lead',
    description: 'Focuses on client assistance, quota repairs, password assistance, and ticket troubleshooting.',
    is_system: true,
    created_at: '2026-01-01T00:00:00.000Z',
    permissions: [
      'dashboard.view',
      'users.view',
      'users.edit',
      'projects.view',
      'projects.edit',
      'reports.view',
      'security.logs',
      // Legacy mapped
      'manage_users',
      'solve_client_issues',
      'manage_reports',
    ],
  },
  {
    id: 'role_finance_admin',
    name: 'Finance & Billing Specialist',
    description: 'Manages incoming payment vouchers, subscription invoicing, refunds, and bank records.',
    is_system: true,
    created_at: '2026-01-01T00:00:00.000Z',
    permissions: [
      'dashboard.view',
      'payments.view',
      'payments.approve',
      'payments.reject',
      'payments.refund',
      'reports.view',
      'reports.export',
      // Legacy mapped
      'manage_payments',
      'manage_subscriptions',
    ],
  },
  {
    id: 'role_content_admin',
    name: 'Content & CMS Manager',
    description: 'Controls marketing homepage content, news announcements, image moderation, and SEO tags.',
    is_system: true,
    created_at: '2026-01-01T00:00:00.000Z',
    permissions: [
      'dashboard.view',
      'resources.view',
      'resources.create',
      'resources.edit',
      'resources.delete',
      'website.content',
      'website.pages',
      'website.media',
      'website.seo',
      // Legacy mapped
      'manage_cms',
      'manage_reports',
    ],
  },
  {
    id: 'role_operations_admin',
    name: 'Operations & Infrastructure Admin',
    description: 'Supervises storage capacity, active projects, system health, and security telemetry.',
    is_system: true,
    created_at: '2026-01-01T00:00:00.000Z',
    permissions: [
      'dashboard.view',
      'resources.view',
      'resources.edit',
      'projects.view',
      'projects.create',
      'projects.edit',
      'projects.delete',
      'projects.assign',
      'reports.view',
      'settings.view',
      'security.logs',
      'security.sessions',
      // Legacy mapped
      'view_analytics',
    ],
  },
];

// Permission matching helper with backwards compatibility translation
export function checkUserHasPermission(
  role: UserRole | undefined,
  userPermissions: AdminPermission[] | undefined,
  requiredPermission: AdminPermission | string
): boolean {
  if (!role) return false;
  // 1. Owner has 100% unrestricted access to everything
  if (role === 'owner') return true;
  // 2. Regular users have no admin permissions
  if (role !== 'admin') return false;

  const perms = userPermissions || [];

  // Direct match
  if (perms.includes(requiredPermission as AdminPermission)) return true;

  // Legacy mappings:
  // manage_users grants users.*
  if (requiredPermission.startsWith('users.') && perms.includes('manage_users')) return true;
  if (requiredPermission === 'solve_client_issues' && (perms.includes('users.edit') || perms.includes('manage_users'))) return true;

  // manage_payments grants payments.*
  if (requiredPermission.startsWith('payments.') && perms.includes('manage_payments')) return true;

  // manage_subscriptions grants payments.* & subscriptions
  if (requiredPermission === 'manage_subscriptions' && (perms.includes('payments.view') || perms.includes('manage_payments'))) return true;

  // manage_reports grants reports.*
  if (requiredPermission.startsWith('reports.') && perms.includes('manage_reports')) return true;

  // manage_cms grants website.*
  if (requiredPermission.startsWith('website.') && perms.includes('manage_cms')) return true;

  // view_analytics grants dashboard.view & security.logs
  if ((requiredPermission === 'dashboard.view' || requiredPermission === 'security.logs') && perms.includes('view_analytics')) return true;

  return false;
}
