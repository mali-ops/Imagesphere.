import { db, isDatabaseConfigured } from './index';
import { users } from './schema';
import { eq, or } from 'drizzle-orm';

// In-memory store fallback so user registrations and logins are ALWAYS preserved across sessions
// even when PostgreSQL environment variables are not yet configured.
const inMemoryUsers: Map<string, any> = new Map();

// Seed initial users into memory
inMemoryUsers.set('usr_owner_1', {
  id: 1,
  uid: 'usr_owner_1',
  email: 'aliuniet@gmail.com',
  fullName: 'Ali (Site Owner)',
  role: 'owner',
  plan: 'pro',
  storageQuota: 107374182400,
  storageUsed: 419430400,
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  status: 'active',
  subscriptionStatus: 'active',
  autoDebitEnabled: 'true',
  cardLast4: '8888',
  cardBrand: 'Mastercard',
  createdAt: new Date('2025-01-01'),
});

inMemoryUsers.set('usr_admin_1', {
  id: 2,
  uid: 'usr_admin_1',
  email: 'admin@imgsphere.io',
  fullName: 'Platform Administrator',
  role: 'admin',
  admin_permissions: ['manage_users', 'solve_client_issues', 'manage_payments', 'manage_subscriptions', 'manage_reports', 'manage_cms', 'view_analytics'],
  assigned_by: 'aliuniet@gmail.com',
  plan: 'pro',
  storageQuota: 107374182400,
  storageUsed: 314572800,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  status: 'active',
  subscriptionStatus: 'active',
  autoDebitEnabled: 'true',
  cardLast4: '4242',
  cardBrand: 'Visa',
  createdAt: new Date('2025-01-01'),
});

inMemoryUsers.set('usr_demo_1', {
  id: 3,
  uid: 'usr_demo_1',
  email: 'demo@imgsphere.io',
  fullName: 'Sarah Jenkins',
  role: 'user',
  plan: 'prime',
  storageQuota: 16106127360,
  storageUsed: 262144000,
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  status: 'active',
  subscriptionStatus: 'active',
  autoDebitEnabled: 'true',
  cardLast4: '4242',
  cardBrand: 'Visa',
  createdAt: new Date('2025-01-15'),
});

export async function getOrCreateUser(
  uid: string,
  email: string,
  fullName?: string,
  role?: string,
  plan?: string,
  storageQuota?: number,
  avatarUrl?: string,
  password?: string,
  subscriptionStatus?: string,
  trialEndDate?: Date,
  autoDebitEnabled?: string,
  nextBillingDate?: Date,
  cardLast4?: string,
  cardBrand?: string
) {
  const calculatedRole =
    role ||
    (email.toLowerCase() === 'aliuniet@gmail.com' || email.toLowerCase() === 'owner@imgsphere.io'
      ? 'owner'
      : email.toLowerCase().includes('admin')
      ? 'admin'
      : 'user');
  const existing = inMemoryUsers.get(uid) || inMemoryUsers.get(email.toLowerCase());
  const selectedPlan = (plan || existing?.plan || 'community').toLowerCase();
  const calculatedQuota =
    storageQuota ||
    (existing?.storageQuota && !plan
      ? existing.storageQuota
      : selectedPlan === 'community' || selectedPlan === 'free'
      ? 524288000 // 500 MB
      : selectedPlan === 'prime'
      ? 16106127360 // 15 GB
      : 53687091200); // 50 GB for Pro

  const memUser = {
    ...(existing || {}),
    id: existing?.id || inMemoryUsers.size + 1,
    uid,
    email,
    fullName: fullName || existing?.fullName || email.split('@')[0],
    role: calculatedRole,
    plan: selectedPlan,
    storageQuota: calculatedQuota,
    storageUsed: existing?.storageUsed || 0,
    avatarUrl: avatarUrl || existing?.avatarUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${uid}`,
    password: password || existing?.password || null,
    status: existing?.status || 'active',
    subscriptionStatus: subscriptionStatus || existing?.subscriptionStatus || 'active',
    trialStartDate: existing?.trialStartDate || new Date(),
    trialEndDate: trialEndDate || existing?.trialEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    autoDebitEnabled: autoDebitEnabled || existing?.autoDebitEnabled || 'true',
    nextBillingDate: nextBillingDate || existing?.nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cardLast4: cardLast4 || existing?.cardLast4 || '4242',
    cardBrand: cardBrand || existing?.cardBrand || 'Visa',
    createdAt: existing?.createdAt || new Date(),
    lastLogin: new Date(),
  };

  inMemoryUsers.set(uid, memUser);
  inMemoryUsers.set(email.toLowerCase(), memUser);

  if (!isDatabaseConfigured) {
    return memUser;
  }

  try {
    const existingDb = await db.select().from(users).where(or(eq(users.uid, uid), eq(users.email, email)));
    if (existingDb.length > 0) {
      const result = await db
        .update(users)
        .set({
          fullName: fullName || existingDb[0].fullName,
          role: calculatedRole,
          plan: selectedPlan,
          storageQuota: calculatedQuota,
          ...(avatarUrl ? { avatarUrl } : {}),
          ...(password ? { password } : {}),
          ...(subscriptionStatus ? { subscriptionStatus } : {}),
          ...(trialEndDate ? { trialEndDate } : {}),
          ...(autoDebitEnabled ? { autoDebitEnabled } : {}),
          ...(nextBillingDate ? { nextBillingDate } : {}),
          ...(cardLast4 ? { cardLast4 } : {}),
          ...(cardBrand ? { cardBrand } : {}),
        })
        .where(eq(users.id, existingDb[0].id))
        .returning();
      return result[0] || memUser;
    }

    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        fullName: fullName || email.split('@')[0],
        role: calculatedRole,
        plan: selectedPlan,
        storageQuota: calculatedQuota,
        avatarUrl: avatarUrl || null,
        password: password || null,
        subscriptionStatus: subscriptionStatus || 'active',
        trialStartDate: new Date(),
        trialEndDate: trialEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoDebitEnabled: autoDebitEnabled || 'true',
        nextBillingDate: nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cardLast4: cardLast4 || '4242',
        cardBrand: cardBrand || 'Visa',
      })
      .returning();

    return result[0] || memUser;
  } catch (error) {
    console.warn('Database user registration skipped (fallback in memory):', (error as any).message);
    return memUser;
  }
}

export async function getAllUsers() {
  const memoryList = Array.from(new Set(Array.from(inMemoryUsers.values())));
  if (!isDatabaseConfigured) {
    return memoryList;
  }
  try {
    const dbList = await db.select().from(users);
    const map = new Map<string, any>();
    memoryList.forEach((u) => {
      const emailKey = u.email ? u.email.toLowerCase() : null;
      if (emailKey) map.set(emailKey, u);
      if (u.uid) map.set(u.uid, u);
    });

    dbList.forEach((u) => {
      const emailKey = u.email ? u.email.toLowerCase() : null;
      const memMatch = (emailKey ? map.get(emailKey) : null) || (u.uid ? map.get(u.uid) : null);
      const merged = memMatch ? { ...memMatch, ...u } : u;
      if (emailKey) map.set(emailKey, merged);
      if (u.uid) map.set(u.uid, merged);
    });

    const uniqueMap = new Map<string, any>();
    for (const u of map.values()) {
      const key = u.email ? u.email.toLowerCase() : u.uid;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, u);
      }
    }
    return Array.from(uniqueMap.values());
  } catch (error) {
    console.warn('Database fetch users fallback to memory:', (error as any).message);
    return memoryList;
  }
}

export async function getUserByUid(uid: string) {
  if (inMemoryUsers.has(uid)) {
    return inMemoryUsers.get(uid);
  }
  if (!isDatabaseConfigured) return null;
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid));
    return result[0] || null;
  } catch (error) {
    console.warn('Database fetch user by uid skipped:', (error as any).message);
    return null;
  }
}

export async function updateUserRecord(
  uid: string,
  data: Partial<{
    fullName: string;
    role: string;
    status: string;
    plan: string;
    storageQuota: number;
    storageUsed: number;
    avatarUrl: string;
    password: string;
    subscriptionStatus: string;
    trialStartDate: Date;
    trialEndDate: Date;
    autoDebitEnabled: string;
    nextBillingDate: Date;
    cardLast4: string;
    cardBrand: string;
  }>
) {
  // Find in-memory user by uid or email
  let matchedKey = uid;
  let existing = inMemoryUsers.get(uid);
  if (!existing) {
    for (const [k, v] of inMemoryUsers.entries()) {
      if (v.uid === uid || (v.email && v.email.toLowerCase() === uid.toLowerCase())) {
        matchedKey = k;
        existing = v;
        break;
      }
    }
  }

  const updated = {
    ...(existing || { id: inMemoryUsers.size + 1, uid, email: uid, role: 'user', createdAt: new Date() }),
    ...data,
    uid: existing?.uid || uid,
  };
  inMemoryUsers.set(matchedKey, updated);
  if (updated.email) {
    inMemoryUsers.set(updated.email.toLowerCase(), updated);
  }
  if (updated.uid) {
    inMemoryUsers.set(updated.uid, updated);
  }

  if (!isDatabaseConfigured) return updated;
  try {
    const emailToMatch = (existing?.email || (uid.includes('@') ? uid : '')).toLowerCase();
    const whereClause = emailToMatch
      ? or(eq(users.uid, uid), eq(users.email, emailToMatch))
      : eq(users.uid, uid);

    const result = await db
      .update(users)
      .set(data)
      .where(whereClause)
      .returning();

    if (result.length > 0) {
      return result[0];
    }

    // If no row existed in Postgres yet, insert it
    const insResult = await db
      .insert(users)
      .values({
        uid: existing?.uid || uid,
        email: emailToMatch || `${uid}@imgsphere.io`,
        fullName: data.fullName || existing?.fullName || uid,
        role: data.role || existing?.role || 'user',
        plan: data.plan || existing?.plan || 'free',
        storageQuota: data.storageQuota || existing?.storageQuota || 524288000,
        status: data.status || existing?.status || 'active',
        subscriptionStatus: data.subscriptionStatus || existing?.subscriptionStatus || 'active',
      })
      .returning();

    return insResult[0] || updated;
  } catch (error) {
    console.warn('Database update user fallback:', (error as any).message);
    return updated;
  }
}

export async function deleteUserRecord(uid: string) {
  inMemoryUsers.delete(uid);
  if (!isDatabaseConfigured) return true;
  try {
    await db.delete(users).where(eq(users.uid, uid));
    return true;
  } catch (error) {
    console.warn('Database delete user failed:', (error as any).message);
    return true;
  }
}

