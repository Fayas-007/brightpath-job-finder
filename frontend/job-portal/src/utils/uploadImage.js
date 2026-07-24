import { API_PATHS } from './apiPaths';
import axiosInstance from './axiosInstance'; 

const uploadImage = async (imageFile) => {
  const formData = new FormData();
  // Append image file to form data
  formData.append('image', imageFile); 

  try {
    const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Set header for file upload
      },
    });
    return response.data; // Return response data
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Could not upload the image. Please try another file.';
    throw new Error(message);
  }
};

export default uploadImage;
