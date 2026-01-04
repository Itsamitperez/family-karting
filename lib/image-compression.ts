import imageCompression from 'browser-image-compression';

export type CompressionOptions = {
  /** Maximum file size in MB (default: 1) */
  maxSizeMB?: number;
  /** Maximum width or height in pixels (default: 1920) */
  maxWidthOrHeight?: number;
  /** Use web worker for compression (default: true) */
  useWebWorker?: boolean;
  /** Callback for compression progress (0-100) */
  onProgress?: (progress: number) => void;
};

const defaultOptions: Required<Omit<CompressionOptions, 'onProgress'>> = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

/**
 * Compresses an image file if it exceeds the threshold size.
 * Returns the original file if it's already small enough.
 * 
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed file (or original if already small)
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { maxSizeMB, maxWidthOrHeight, useWebWorker, onProgress } = {
    ...defaultOptions,
    ...options,
  };

  // Skip compression if file is already under target size
  const targetBytes = maxSizeMB * 1024 * 1024;
  if (file.size <= targetBytes) {
    return file;
  }

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      onProgress,
    });

    // Log compression results for debugging
    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
    const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    
    console.log(
      `🖼️ Image compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB (${reduction}% reduction)`
    );

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Checks if a file is an image based on its MIME type
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

