import Resizer from 'react-image-file-resizer';

const url = 'https://api.cloudinary.com/v1_1/dxhi0grdd/image/upload';

const uploadImage = async (image) => {
  try {
    // Compress the image
    const compressedImage = await new Promise((resolve) => {
      Resizer.imageFileResizer(
        image,
        800, // Max width
        800, // Max height
        'JPEG', // Output format
        80, // Quality (0-100)
        0, // Rotation
        (uri) => resolve(uri),
        'file', // Output type
      );
    });

    const formData = new FormData();
    formData.append('file', compressedImage);
    formData.append('upload_preset', 'section_');

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Image upload error:', error);
    return { error: error.message };
  }
};

export default uploadImage;
