'use client';

import { useState, useRef } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';
import { Upload, X, Link as LinkIcon, Loader2 } from 'lucide-react';

type AccentColor = 'cyber-purple' | 'velocity-yellow' | 'aqua-neon' | 'electric-red';

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  folder?: string;
  label?: string;
  accentColor?: AccentColor;
};

const accentColorStyles: Record<AccentColor, { active: string; focus: string; loading: string; hover: string }> = {
  'cyber-purple': {
    active: 'bg-cyber-purple border-cyber-purple text-white',
    focus: 'focus:border-cyber-purple focus:ring-2 focus:ring-cyber-purple/40',
    loading: 'border-cyber-purple bg-cyber-purple/10',
    hover: 'hover:border-cyber-purple/50',
  },
  'velocity-yellow': {
    active: 'bg-velocity-yellow border-velocity-yellow text-black',
    focus: 'focus:border-velocity-yellow focus:ring-2 focus:ring-velocity-yellow/40',
    loading: 'border-velocity-yellow bg-velocity-yellow/10',
    hover: 'hover:border-velocity-yellow/50',
  },
  'aqua-neon': {
    active: 'bg-aqua-neon border-aqua-neon text-black',
    focus: 'focus:border-aqua-neon focus:ring-2 focus:ring-aqua-neon/40',
    loading: 'border-aqua-neon bg-aqua-neon/10',
    hover: 'hover:border-aqua-neon/50',
  },
  'electric-red': {
    active: 'bg-electric-red border-electric-red text-white',
    focus: 'focus:border-electric-red focus:ring-2 focus:ring-electric-red/40',
    loading: 'border-electric-red bg-electric-red/10',
    hover: 'hover:border-electric-red/50',
  },
};

export default function ImageUpload({
  value,
  onChange,
  bucket,
  folder = '',
  label = 'Image',
  accentColor = 'cyber-purple',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>(value ? 'url' : 'upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientSupabase();
  const styles = accentColorStyles[accentColor];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
      setUrlInput(urlData.publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-soft-white/70 mb-2">{label}</label>

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
            onChange={handleFileChange}
            className="hidden"
            id={`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed 
              rounded-2xl cursor-pointer transition-all ${
              uploading
                ? styles.loading
                : `border-white/20 ${styles.hover} hover:bg-white/5`
            }`}
          >
            {uploading ? (
              <div className={`flex items-center gap-2 ${accentColor === 'velocity-yellow' ? 'text-velocity-yellow' : accentColor === 'aqua-neon' ? 'text-aqua-neon' : accentColor === 'electric-red' ? 'text-electric-red' : 'text-cyber-purple'}`}>
                <Loader2 size={20} className="animate-spin" />
                Uploading...
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-soft-white/30 mb-2" />
                <p className="text-sm text-soft-white/50">Click to upload or drag and drop</p>
                <p className="text-xs text-soft-white/30">PNG, JPG, GIF up to 5MB</p>
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
            onBlur={handleUrlSubmit}
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
            Set
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-electric-red">{error}</p>
      )}

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-24 w-auto rounded-xl border border-white/10 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '';
              (e.target as HTMLImageElement).alt = 'Failed to load image';
            }}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 p-1.5 bg-electric-red text-white rounded-full 
              hover:bg-electric-red-light transition-colors shadow-lg"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
