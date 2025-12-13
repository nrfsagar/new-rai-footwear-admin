// import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function uploadImage(file: File): Promise<string> {
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload_stream(
//       { resource_type: 'auto' },
//       (error:any, result:any) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(result!.secure_url);
//         }
//       }
//     ).end(buffer);
//   });
// }

"use server"
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image file to Cloudinary
 * @param file - The File object to upload
 * @returns The secure URL of the uploaded image
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        resolve(result!.secure_url);
      }
    );

    uploadStream.on('error', (error) => {
      reject(new Error(`Upload stream error: ${error.message}`));
    });

    uploadStream.end(buffer);
  });
}

/**
 * Extract public ID from Cloudinary URL (synchronous helper)
 * @param url - The Cloudinary image URL
 * @returns The public ID of the image
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/public_id.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Get the filename after /upload/ (may include version number)
    const filename = parts[uploadIndex + 2]; // Skip 'v...' if present
    
    if (!filename) return null;
    
    // Remove extension and version prefix
    const publicId = filename.split('.')[0];
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
}

/**
 * Delete an image from Cloudinary
 * @param url - The Cloudinary image URL or public ID
 * @returns Whether the deletion was successful
 */
export async function deleteImageFromCloudinary(url: string): Promise<boolean> {
  try {
    let publicId = url;
    
    // If it's a full URL, extract the public ID
    if (url.includes('res.cloudinary.com')) {
      const extracted = extractPublicIdFromUrl(url);
      if (!extracted) {
        console.warn(`Could not extract public ID from URL: ${url}`);
        return false;
      }
      publicId = extracted;
    }

    const result = await new Promise<{ result?: string; error?: unknown }>((resolve) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error(`Error deleting image ${publicId}:`, error);
          resolve({ error });
        } else {
          resolve({ result: result?.result });
        }
      });
    });

    if (result.error) {
      console.error('Cloudinary deletion failed:', result.error);
      return false;
    }

    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param urls - Array of Cloudinary image URLs or public IDs
 * @returns Array of deletion results for each image
 */
export async function deleteImagesFromCloudinary(urls: string[]): Promise<boolean[]> {
  try {
    const results = await Promise.allSettled(
      urls.map(url => deleteImageFromCloudinary(url))
    );

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      console.error('Image deletion rejected:', result.reason);
      return false;
    });
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    return urls.map(() => false);
  }
}