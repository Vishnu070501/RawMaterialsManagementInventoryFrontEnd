import axiosInstance from "@/app/lib/apiInstances/axios";

// Function to make a GET request
export const getData = async (endpoint, pdfDownload) => {
  try {
    const response = await axiosInstance.get(endpoint, pdfDownload ? {
      responseType: 'blob' // Ensure the response is treated as binary data (PDF)
    } : undefined);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(error.response.data.message || 'Server Error');
    } else if (error.request) {
      // Request was made but no response received
      // console.error('Error request:', error.request);
      throw new Error('Network Error');
    } else {
      // Something else happened
      console.error('Error message:', error.message);
      throw new Error(error.message);
    } 
  }
};


// Function to make a POST request
export const postData = async (endpoint, data, pdfDownload) => {
  try {
    const response = await axiosInstance.post(endpoint, data, pdfDownload ? {
      responseType: 'arraybuffer' // Set responseType to arraybuffer
    } : undefined);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(error.response.data.message || 'Server Error');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network Error');
    } else {
      // Something else happened
      throw new Error(error.message);
    }
  }
};

// Function to make a PUT request
export const putData = async (endpoint, data, pdfDownload) => {
  try {
    const response = await axiosInstance.put(endpoint, data, pdfDownload ? {
      responseType: 'arraybuffer' // Set responseType to arraybuffer
    } : undefined);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(error.response.data.message || 'Server Error');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network Error');
    } else {
      // Something else happened
      throw new Error(error.message);
    }
  }
};
// Add this function alongside the existing getData, postData, and putData functions
export const deleteData = async (endpoint) => {
  try {
    console.log("Deleting data from API:", endpoint);
    const response = await axiosInstance.delete(endpoint);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(error.response.data.message || 'Server Error');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network Error');
    } else {
      // Something else happened
      throw new Error(error.message);
    }
  }
};