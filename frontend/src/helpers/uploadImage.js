const url = "https://api.cloudinary.com/v1_1/dxhi0grdd/image/upload";

const uploadImage = async (image) => {
  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "section_");

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Image upload error:", error);
    return { error: error.message };
  }
};

export default uploadImage;