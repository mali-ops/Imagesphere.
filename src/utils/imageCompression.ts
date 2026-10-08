/**
 * Image Compression Utility
 *
 * Automatically reduces file sizes and dimensions before uploading to Cloudinary,
 * Supabase, or local storage. Optimizes cloud bandwidth, storage quota, and CDN loading times.
 */

export interface CompressionOptions {
  /** Compression quality between 0.1 and 1.0 (default: 0.82) */
  quality?: number;
  /** Maximum width in pixels (default: 2560) */
  maxWidth?: number;
  /** Maximum height in pixels (default: 2560) */
  maxHeight?: number;
  /** Desired output format: 'auto' | 'webp' | 'jpeg' | 'png' | 'original' (default: 'auto') */
  outputFormat?: 'auto' | 'webp' | 'jpeg' | 'png' | 'original';
  /** Minimum file size in bytes to trigger compression (default: 40960 = 40 KB) */
  minSizeToCompressBytes?: number;
  /** Callback for progress updates */
  onProgress?: (progressPercent: number, statusText: string) => void;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savingsBytes: number;
  savingsPercent: number;
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
  originalType: string;
  mimeType: string;
  durationMs: number;
  wasCompressed: boolean;
}

/**
 * Formats byte values into human-readable strings (e.g., 2.45 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Checks if an image file can and should be compressed.
 * Excludes SVGs (vector) and animated GIFs by default to prevent rasterization or animation loss.
 */
export function isCompressibleImage(file: File): boolean {
  if (!file || !file.type) return false;
  const type = file.type.toLowerCase();

  // Vector graphics and animated GIFs should not be re-rasterized
  if (type === 'image/svg+xml') return false;
  if (type === 'image/gif') return false;

  return (
    type === 'image/jpeg' ||
    type === 'image/jpg' ||
    type === 'image/png' ||
    type === 'image/webp' ||
    type === 'image/bmp' ||
    type === 'image/avif'
  );
}

/**
 * Checks if the browser's canvas supports WebP export
 */
let cachedWebPSupport: boolean | null = null;
function checkWebPSupport(): boolean {
  if (cachedWebPSupport !== null) return cachedWebPSupport;
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/webp');
    cachedWebPSupport = dataUrl.indexOf('image/webp') === 5;
  } catch {
    cachedWebPSupport = false;
  }
  return cachedWebPSupport;
}

/**
 * Calculates new dimensions while maintaining aspect ratio
 */
export function calculateTargetDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth = 2560,
  maxHeight = 2560
): { targetWidth: number; targetHeight: number; didScale: boolean } {
  let targetWidth = srcWidth;
  let targetHeight = srcHeight;
  let didScale = false;

  if (targetWidth > maxWidth) {
    targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
    targetWidth = maxWidth;
    didScale = true;
  }

  if (targetHeight > maxHeight) {
    targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
    targetHeight = maxHeight;
    didScale = true;
  }

  return {
    targetWidth: Math.max(1, targetWidth),
    targetHeight: Math.max(1, targetHeight),
    didScale,
  };
}

/**
 * Provides an instant pre-upload estimate of compressed file size
 */
export function quickEstimateCompression(
  fileSize: number,
  mimeType: string
): { estimatedSize: number; estimatedSavingsPercent: number } {
  if (mimeType === 'image/png') {
    // PNGs without compression are typically 70-85% larger than WebP/optimized JPEG
    const estimated = Math.round(fileSize * 0.22);
    return { estimatedSize: Math.max(15000, estimated), estimatedSavingsPercent: 78 };
  }
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    // Large digital camera photos compress 50-70% when normalized
    const estimated = Math.round(fileSize * 0.35);
    return { estimatedSize: Math.max(15000, estimated), estimatedSavingsPercent: 65 };
  }
  const estimated = Math.round(fileSize * 0.6);
  return { estimatedSize: estimated, estimatedSavingsPercent: 40 };
}

/**
 * Main compression engine:
 * Decodes the image, scales dimensions smoothly via HTML5 Canvas,
 * and encodes to optimized WebP or JPEG.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const startTime = Date.now();
  const originalSize = file.size;
  const originalType = file.type || 'image/jpeg';

  const {
    quality = 0.82,
    maxWidth = 2560,
    maxHeight = 2560,
    outputFormat = 'auto',
    minSizeToCompressBytes = 40 * 1024, // 40 KB
    onProgress,
  } = options;

  // 1. Check if file is ineligible for compression
  if (!isCompressibleImage(file) || originalSize < minSizeToCompressBytes) {
    // Read dimensions for metadata completeness
    let width = 1200;
    let height = 800;
    try {
      const dims = await getImageDimensions(file);
      width = dims.width;
      height = dims.height;
    } catch {
      // Fallback dimensions
    }

    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savingsBytes: 0,
      savingsPercent: 0,
      originalWidth: width,
      originalHeight: height,
      width,
      height,
      originalType,
      mimeType: originalType,
      durationMs: Date.now() - startTime,
      wasCompressed: false,
    };
  }

  onProgress?.(10, 'Decoding source image...');

  // 2. Load image into memory
  const img = await loadImageElement(file);
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  // 3. Compute target dimensions
  const { targetWidth, targetHeight } = calculateTargetDimensions(
    originalWidth,
    originalHeight,
    maxWidth,
    maxHeight
  );

  onProgress?.(40, 'Resampling and rendering canvas...');

  // 4. Draw to canvas with high smoothing
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context could not be created for image compression');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Determine export format
  let targetMimeType = 'image/jpeg';
  const supportsWebP = checkWebPSupport();

  if (outputFormat === 'webp' || (outputFormat === 'auto' && supportsWebP)) {
    targetMimeType = 'image/webp';
  } else if (outputFormat === 'png') {
    targetMimeType = 'image/png';
  } else if (outputFormat === 'original' && file.type) {
    targetMimeType = file.type;
  } else {
    targetMimeType = 'image/jpeg';
  }

  // If converting transparent PNG/WebP to JPEG, paint a clean white background
  if (targetMimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  onProgress?.(70, `Encoding to ${targetMimeType.split('/')[1]?.toUpperCase()} (Q: ${Math.round(quality * 100)}%)...`);

  // 5. Convert canvas to Blob
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error('Canvas toBlob encoding failed'));
        }
      },
      targetMimeType,
      quality
    );
  });

  const durationMs = Date.now() - startTime;
  const compressedSize = blob.size;

  // 6. Safety check: If for some reason the compressed output is larger than original,
  // retain original file to prevent size regression!
  if (compressedSize >= originalSize && originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savingsBytes: 0,
      savingsPercent: 0,
      originalWidth,
      originalHeight,
      width: originalWidth,
      height: originalHeight,
      originalType,
      mimeType: originalType,
      durationMs,
      wasCompressed: false,
    };
  }

  // 7. Generate clean file name with matching extension
  let extension = '.webp';
  if (targetMimeType === 'image/jpeg') extension = '.jpg';
  else if (targetMimeType === 'image/png') extension = '.png';

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const newFileName = `${baseName}${extension}`;

  const compressedFile = new File([blob], newFileName, {
    type: targetMimeType,
    lastModified: Date.now(),
  });

  const savingsBytes = Math.max(0, originalSize - compressedSize);
  const savingsPercent = Math.round((savingsBytes / originalSize) * 1000) / 10;

  onProgress?.(100, `Compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (-${savingsPercent}%)`);

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    savingsBytes,
    savingsPercent,
    originalWidth,
    originalHeight,
    width: targetWidth,
    height: targetHeight,
    originalType,
    mimeType: targetMimeType,
    durationMs,
    wasCompressed: true,
  };
}

/**
 * Loads image into an HTMLImageElement using object URL
 */
function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Quick helper to extract natural width & height of an image file
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  try {
    const img = await loadImageElement(file);
    return {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
    };
  } catch {
    return { width: 1200, height: 800 };
  }
}
