'use client';

import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/app/hooks/use-toast';
import { Upload, X, Image, Video, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  uploadType?: 'main' | 'qr' | 'additional' | 'profile' | 'chat';
  className?: string;
  buttonText?: string;
  showPreview?: boolean;
  disabled?: boolean;
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv'
];

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  onError,
  maxSize = 5, // 5MB default
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  uploadType = 'additional',
  className,
  buttonText = 'Upload File',
  showPreview = true,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | 'other'>('other');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      const errorMsg = 'Invalid file type. Please select a supported file format.';
      onError?.(errorMsg);
      toast({ title: errorMsg, variant: 'destructive' });
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorMsg = `File size exceeds the limit of ${maxSize}MB`;
      onError?.(errorMsg);
      toast({ title: errorMsg, variant: 'destructive' });
      return;
    }

    // Set preview
    if (showPreview) {
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
      
      if (file.type.startsWith('image/')) {
        setPreviewType('image');
      } else if (file.type.startsWith('video/')) {
        setPreviewType('video');
      } else {
        setPreviewType('other');
      }
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      setUploadProgress(30);

      // Upload to Cloudflare R2 via our API
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadProgress(80);

      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.error || 'Upload failed');
      }

      const publicUrl = uploadResponse.data.url;
      setUploadProgress(100);
      
      // Call success callback
      onUpload(publicUrl);
      
      toast({ title: 'File uploaded successfully!' });

    } catch (error) {
      console.error('Upload failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload file';
      onError?.(errorMsg);
      toast({ title: errorMsg, variant: 'destructive' });
      setUploadProgress(0);
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setPreviewType('other');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    switch (previewType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Button */}
      <Button
        onClick={handleFileSelect}
        disabled={disabled || isUploading}
        variant="outline"
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : buttonText}
      </Button>

      {/* Hidden File Input */}
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes.join(',')}
        className="hidden"
      />

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Preview */}
      {showPreview && preview && (
        <div className="relative border rounded-lg p-4 bg-card">
          <Button
            onClick={clearPreview}
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div className="flex-1">
              {previewType === 'image' && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full h-32 object-cover rounded"
                />
              )}
              {previewType === 'video' && (
                <video
                  src={preview}
                  controls
                  className="max-w-full h-32 rounded"
                >
                  Your browser does not support video playback.
                </video>
              )}
              {previewType === 'other' && (
                <p className="text-sm text-muted-foreground">File ready for upload</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Type Info */}
      <p className="text-xs text-muted-foreground">
        Max size: {maxSize}MB. Supported formats: Images, Videos, GIFs
      </p>
    </div>
  );
};

export default FileUpload;