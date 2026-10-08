import { db, isDatabaseConfigured } from './index';
import { images } from './schema';
import { eq, desc, or } from 'drizzle-orm';

export interface CreateImageInput {
  id: string;
  userId?: string;
  title?: string;
  slug?: string;
  description?: string;
  storageUrl: string;
  thumbnailUrl?: string;
  size?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  visibility?: string;
  tags?: string | string[] | null;
  storageProvider?: string;
}

export async function insertImageRecord(input: CreateImageInput) {
  if (!isDatabaseConfigured) return null;
  try {
    const sanitizedTags = Array.isArray(input.tags)
      ? input.tags.filter(Boolean).map((t) => String(t).trim()).join(',')
      : (typeof input.tags === 'string' ? input.tags.trim() : null);

    const cleanInput = {
      id: String(input.id).slice(0, 100),
      userId: String(input.userId || 'guest').slice(0, 100),
      title: String(input.title || 'image').slice(0, 150),
      slug: input.slug ? String(input.slug).slice(0, 100) : null,
      description: input.description ? String(input.description).slice(0, 500) : null,
      storageUrl: String(input.storageUrl),
      thumbnailUrl: input.thumbnailUrl ? String(input.thumbnailUrl) : String(input.storageUrl),
      size: Math.max(0, Math.round(Number(input.size) || 0)),
      width: input.width ? Math.round(Number(input.width)) : null,
      height: input.height ? Math.round(Number(input.height)) : null,
      mimeType: input.mimeType ? String(input.mimeType).slice(0, 50) : 'image/jpeg',
      visibility: input.visibility === 'private' ? 'private' : 'public',
      tags: sanitizedTags || null,
      storageProvider: input.storageProvider || 'cloudinary',
    };

    const result = await db
      .insert(images)
      .values(cleanInput)
      .onConflictDoUpdate({
        target: images.id,
        set: {
          title: cleanInput.title,
          slug: cleanInput.slug,
          description: cleanInput.description,
          storageUrl: cleanInput.storageUrl,
          thumbnailUrl: cleanInput.thumbnailUrl,
          size: cleanInput.size,
          width: cleanInput.width,
          height: cleanInput.height,
          mimeType: cleanInput.mimeType,
          visibility: cleanInput.visibility,
          tags: cleanInput.tags,
          storageProvider: cleanInput.storageProvider,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.warn('Database insert/upsert image skipped:', (error as any).message);
    return null;
  }
}

export async function getImagesByUser(userId: string) {
  if (!isDatabaseConfigured) return [];
  try {
    return await db.select().from(images).where(eq(images.userId, userId)).orderBy(desc(images.createdAt));
  } catch (error) {
    console.warn('Database get user images skipped:', (error as any).message);
    return [];
  }
}

export async function getAllPublicImages() {
  if (!isDatabaseConfigured) return [];
  try {
    return await db.select().from(images).where(eq(images.visibility, 'public')).orderBy(desc(images.createdAt));
  } catch (error) {
    console.warn('Database get public images skipped:', (error as any).message);
    return [];
  }
}

export async function getImageById(id: string) {
  if (!isDatabaseConfigured) return null;
  try {
    const res = await db.select().from(images).where(eq(images.id, id));
    return res[0] || null;
  } catch (error) {
    console.warn('Database get image by id skipped:', (error as any).message);
    return null;
  }
}

export async function getImageBySlugOrId(identifier: string) {
  if (!isDatabaseConfigured) return null;
  try {
    const res = await db
      .select()
      .from(images)
      .where(or(eq(images.slug, identifier), eq(images.id, identifier)));
    return res[0] || null;
  } catch (error) {
    console.warn('Database get image by slug or id skipped:', (error as any).message);
    return null;
  }
}

