import api from './apiInstances/axios';

export const signup = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    return response;
  } catch (error) {
    throw error;
  }
};
