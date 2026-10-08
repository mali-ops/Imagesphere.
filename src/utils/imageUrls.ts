import { ImageItem } from '../types';

export function getCleanExtension(image: { file_name?: string; mime_type?: string }): string {
  if (image.file_name && image.file_name.includes('.')) {
    const ext = image.file_name.split('.').pop()?.toLowerCase();
    if (ext && ext.length <= 5) return ext;
  }
  if (image.mime_type) {
    if (image.mime_type.includes('png')) return 'png';
    if (image.mime_type.includes('webp')) return 'webp';
    if (image.mime_type.includes('gif')) return 'gif';
    if (image.mime_type.includes('svg')) return 'svg';
  }
  return 'jpg';
}

export function getBrandedFileName(image: ImageItem, siteName = 'ImgSphere'): string {
  const safeSite = (siteName || 'ImgSphere').replace(/[^a-zA-Z0-9_-]/g, '_');
  const ext = getCleanExtension(image);
  const cleanTitle = (image.title || 'image')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 40);
  return `${safeSite}_${cleanTitle}.${ext}`;
}

export function getBrandedDirectUrl(image: ImageItem, siteName = 'ImgSphere'): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const ext = getCleanExtension(image);
  const cleanSite = (siteName || 'ImgSphere').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'imgsphere';
  const identifier = image.public_slug || image.id;
  // Explicitly brands the link path AND the filename:
  // e.g., https://domain/imgsphere/i/imgsphere-my-image-slug.png
  return `${origin}/${cleanSite}/i/${cleanSite}-${identifier}.${ext}`;
}

export function getBrandedShareUrl(image: ImageItem, siteName = 'ImgSphere'): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const cleanSite = (siteName || 'ImgSphere').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'imgsphere';
  const identifier = image.public_slug || image.id;
  return `${origin}/${cleanSite}/view/${identifier}`;
}

export async function downloadBrandedImage(
  image: ImageItem,
  siteName = 'ImgSphere',
  onStarted?: (fileName: string) => void
): Promise<void> {
  const fileName = getBrandedFileName(image, siteName);
  if (onStarted) onStarted(fileName);

  try {
    const response = await fetch(image.storage_url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Direct download fetch returned status: ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  } catch {
    const proxyUrl = `/api/images/download?url=${encodeURIComponent(image.storage_url)}&filename=${encodeURIComponent(fileName)}`;
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
