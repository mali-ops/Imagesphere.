import { db, isDatabaseConfigured } from './index';
import { invoices } from './schema';
import { eq, desc } from 'drizzle-orm';

export interface CreateInvoiceInput {
  id: string;
  userId: string;
  amount: number; // in cents e.g. 999 = $9.99
  currency?: string;
  planName: string;
  billingCycle?: string;
  status?: string;
  description: string;
  cardLast4?: string;
  cardBrand?: string;
}

export async function insertInvoiceRecord(input: CreateInvoiceInput) {
  if (!isDatabaseConfigured) return null;
  try {
    const cleanInput = {
      id: input.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: input.userId,
      amount: Math.round(Number(input.amount) || 999),
      currency: input.currency || 'USD',
      planName: input.planName || 'Pro Plan',
      billingCycle: input.billingCycle || 'monthly',
      status: input.status || 'paid',
      description: input.description,
      cardLast4: input.cardLast4 || '4242',
      cardBrand: input.cardBrand || 'Visa',
    };

    const result = await db.insert(invoices).values(cleanInput).returning();
    return result[0];
  } catch (error) {
    console.warn('Database invoice insert skipped:', (error as any).message);
    return null;
  }
}

export async function getInvoicesByUser(userId: string) {
  if (!isDatabaseConfigured) return [];
  try {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));
  } catch (error) {
    console.warn('Database get user invoices skipped:', (error as any).message);
    return [];
  }
}

export async function getAllInvoices() {
  if (!isDatabaseConfigured) return [];
  try {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  } catch (error) {
    console.warn('Database get all invoices skipped:', (error as any).message);
    return [];
  }
}
