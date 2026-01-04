'use client';

import { useState, useRef } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';
import { Upload, X, Link as LinkIcon, Loader2, Plus, Image as ImageIcon } from 'lucide-react';
import { compressImage, formatFileSize } from '@/lib/image-compression';

type AccentColor = 'cyber-purple' | 'velocity-yellow' | 'aqua-neon' | 'electric-red';

type MultiImageUploadProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket: string;
  folder?: string;
  label?: string;
  accentColor?: AccentColor;
  maxImages?: number;
};

const accentColorStyles: Record<AccentColor, { active: string; focus: string; loading: string; hover: string; text: string }> = {
  'cyber-purple': {
    active: 'bg-cyber-purple border-cyber-purple text-white',
    focus: 'focus:border-cyber-purple focus:ring-2 focus:ring-cyber-purple/40',
    loading: 'border-cyber-purple bg-cyber-purple/10',
    hover: 'hover:border-cyber-purple/50',
    text: 'text-cyber-purple',
  },
  'velocity-yellow': {
    active: 'bg-velocity-yellow border-velocity-yellow text-black',
    focus: 'focus:border-velocity-yellow focus:ring-2 focus:ring-velocity-yellow/40',
    loading: 'border-velocity-yellow bg-velocity-yellow/10',
    hover: 'hover:border-velocity-yellow/50',
    text: 'text-velocity-yellow',
  },
  'aqua-neon': {
    active: 'bg-aqua-neon border-aqua-neon text-black',
    focus: 'focus:border-aqua-neon focus:ring-2 focus:ring-aqua-neon/40',
    loading: 'border-aqua-neon bg-aqua-neon/10',
    hover: 'hover:border-aqua-neon/50',
    text: 'text-aqua-neon',
  },
  'electric-red': {
    active: 'bg-electric-red border-electric-red text-white',
    focus: 'focus:border-electric-red focus:ring-2 focus:ring-electric-red/40',
    loading: 'border-electric-red bg-electric-red/10',
    hover: 'hover:border-electric-red/50',
    text: 'text-electric-red',
  },
};

export default function MultiImageUpload({
  value = [],
  onChange,
  bucket,
  folder = '',
  label = 'Images',
  accentColor = 'cyber-purple',
  maxImages = 10,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientSupabase();
  const styles = accentColorStyles[accentColor];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (value.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      setError('Some files were skipped - only images allowed');
    }

    // Check file sizes (allow up to 50MB each, will be compressed)
    const validFiles = imageFiles.filter(file => file.size <= 50 * 1024 * 1024);
    if (validFiles.length !== imageFiles.length) {
      setError('Some files were skipped - maximum 50MB per image');
    }

    if (validFiles.length === 0) {
      setError('No valid images to upload');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        // Compress the image
        const originalSize = formatFileSize(file.size);
        const compressedFile = await compressImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        const compressedSize = formatFileSize(compressedFile.size);
        
        if (compressedFile.size < file.size) {
          console.log(`📸 Compressed: ${originalSize} → ${compressedSize}`);
        }

        const fileExt = compressedFile.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, compressedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    
    if (value.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    onChange([...value, urlInput.trim()]);
    setUrlInput('');
    setError('');
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-soft-white/70 mb-2">
        {label} ({value.length}/{maxImages})
      </label>

      {/* Existing Images */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group aspect-square">
              <img
                src={url}
                alt={`Attachment ${index + 1}`}
                className="w-full h-full rounded-xl border border-white/10 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).alt = 'Failed to load';
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-electric-red text-white rounded-full 
                  opacity-0 group-hover:opacity-100 transition-opacity
                  hover:bg-electric-red-light shadow-lg z-10"
              >
                <X size={12} />
              </button>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                transition-opacity rounded-xl flex items-center justify-center">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add More Section */}
      {canAddMore && (
        <>
          {/* Mode toggle */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl border transition-all ${
                mode === 'upload'
                  ? styles.active
                  : 'bg-white/5 border-white/10 text-soft-white/60 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <Upload size={14} />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl border transition-all ${
                mode === 'url'
                  ? styles.active
                  : 'bg-white/5 border-white/10 text-soft-white/60 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <LinkIcon size={14} />
              URL
            </button>
          </div>

          {/* Upload mode */}
          {mode === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id={`multi-image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              />
              <label
                htmlFor={`multi-image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed 
                  rounded-2xl cursor-pointer transition-all ${
                  uploading
                    ? styles.loading
                    : `border-white/20 ${styles.hover} hover:bg-white/5`
                }`}
              >
                {uploading ? (
                  <div className={`flex items-center gap-2 ${styles.text}`}>
                    <Loader2 size={20} className="animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-6 h-6 text-soft-white/30" />
                      <Plus className="w-4 h-4 text-soft-white/30" />
                    </div>
                    <p className="text-sm text-soft-white/50">Click to upload images</p>
                    <p className="text-xs text-soft-white/30">PNG, JPG, GIF (auto-compressed)</p>
                  </>
                )}
              </label>
            </div>
          )}

          {/* URL mode */}
          {mode === 'url' && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
                placeholder="https://example.com/image.jpg"
                className={`flex-1 px-4 py-3 bg-[#1a1a2e] border border-white/30 rounded-xl 
                  text-soft-white placeholder-soft-white/50
                  focus:outline-none ${styles.focus}
                  transition-all`}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className={`px-5 py-3 rounded-xl font-medium transition-all ${styles.active} hover:opacity-90`}
              >
                Add
              </button>
            </div>
          )}
        </>
      )}

      {/* Max reached message */}
      {!canAddMore && (
        <p className="text-sm text-soft-white/40 text-center py-2">
          Maximum number of images reached
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-electric-red">{error}</p>
      )}
    </div>
  );
}

