import React, { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/lib/cloudinary';

const ImagePreview = ({ 
  file, 
  existingUrl, 
  onClear, 
  alt 
}: { 
  file?: File | null, 
  existingUrl?: string, 
  onClear: () => void, 
  alt: string 
}) => {
  const imageUrl = file ? URL.createObjectURL(file) : existingUrl;
  
  return (
    <div className="relative">
      <img 
        src={imageUrl} 
        alt={alt} 
        className="w-32 h-32 object-cover rounded-lg"
      />
      <button 
        onClick={onClear} 
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ImageUpload = ({ 
  id, 
  label, 
  files, 
  setFiles, 
  uploadUrls,
  setUploadUrls,
  existingUrls 
}: { 
  id: string, 
  label: string, 
  files: File[], 
  setFiles: (files: File[]) => void,
  uploadUrls?: string[],
  setUploadUrls?: (urls: string[]) => void,
  existingUrls?: string[] 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles([...files, ...newFiles]);

    // Optional Cloudinary upload
    if (setUploadUrls) {
      setIsUploading(true);
      try {
        const newUrls = await Promise.all(
          newFiles.map(file => uploadToCloudinary(file))
        );
        setUploadUrls([...(uploadUrls || []), ...newUrls]);
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);

    // Remove corresponding URL if upload URLs are managed
    if (setUploadUrls && uploadUrls) {
      const updatedUrls = uploadUrls.filter((_, index) => index !== indexToRemove);
      setUploadUrls(updatedUrls);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <ImagePreview
              key={index}
              file={file}
              onClear={() => removeFile(index)}
              alt={`${label} ${index + 1}`}
            />
          ))}
          {existingUrls?.map((url, index) => (
            <ImagePreview
              key={`existing-${index}`}
              existingUrl={url}
              onClear={() => {
                // Placeholder for existing URL removal logic
              }}
              alt={`Existing ${label} ${index + 1}`}
            />
          ))}

          {(files.length + (existingUrls?.length || 0)) < 5 && (
            <div 
              className={`flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer ${isUploading ? 'opacity-50' : 'hover:border-primary'}`}
              onClick={() => !isUploading && document.getElementById(id)?.click()}
            >
              <div className="text-center">
                {isUploading ? (
                  <span className="text-sm text-gray-500">Uploading...</span>
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 mx-auto text-gray-400" />
                    <span className="text-sm text-gray-500">Upload</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <Input
          id={id}
          name={id}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export default ImageUpload;